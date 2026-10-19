const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const test = require('node:test');
const axios = require('axios');
const app = require('../server');
const database = require('../db');
const { models } = require('../models');

test('declares geospatial indexes for providers, stations, reports, and experiences', () => {
  for (const modelName of ['Driver', 'PoliceStation', 'RoadReport', 'MarketplaceExperience']) {
    const indexes = models[modelName].schema.indexes();
    assert.ok(indexes.some(([fields]) => fields.location === '2dsphere'), `${modelName} should index location as 2dsphere`);
  }
  assert.ok(models.TripOutline);
});

test('Mongo-backed data access fails explicitly when Atlas is not connected', async () => {
  await assert.rejects(database.list('users'), { code: 'MONGODB_UNAVAILABLE' });
});

test('server starts stateless APIs in degraded mode when MongoDB is unavailable', async (t) => {
  const originalConnect = database.connect;
  let server;
  database.connect = async () => { throw new Error('MongoDB URI is not configured.'); };
  t.after(() => {
    database.connect = originalConnect;
    if (server) server.close();
  });
  server = await app.startServer(0);
  await once(server, 'listening');

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  assert.equal(response.status, 503);
  const health = await response.json();
  assert.equal(health.database, 'mongodb-unavailable');
  assert.equal(health.status, 'degraded');
});

test('approved guide directory exposes approved service-base coordinates without contact details', async (t) => {
  const originalList = database.list;
  database.list = async (collection, filter) => {
    assert.deepEqual(filter, { status: 'approved' });
    if (collection === 'drivers') {
      return [{
        id: 'guide-approved',
        name: 'Approved local guide',
        contact: 'private@example.test',
        regions: ['Hunza'],
        vehicle: 'Guide only',
        experienceYears: 5,
        location: { type: 'Point', coordinates: [74.65, 36.31] }
      }];
    }
    assert.equal(collection, 'marketplaceExperiences');
    return [{
      id: 'operator-approved',
      name: 'Approved tour operator',
      city: 'Skardu',
      services: ['Guided trips'],
      publicContact: 'operator@example.test',
      status: 'approved',
      location: { type: 'Point', coordinates: [75.6333, 35.2971] }
    }];
  };

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    database.list = originalList;
    server.close();
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/guides`);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.guides[0].location, { type: 'Point', coordinates: [74.65, 36.31] });
  assert.equal(result.guides[0].name, 'Approved local guide');
  assert.equal('contact' in result.guides[0], false);
  assert.equal(result.guides[1].name, 'Approved tour operator');
  assert.equal(result.guides[1].publicContact, 'operator@example.test');
  assert.equal(result.guides[1].providerType, 'tour-operator');
});

test('guide applications publish contact only after explicit publication consent', async (t) => {
  const originalAddApplication = database.addDriverApplication;
  const applications = [];
  database.addDriverApplication = async (application) => {
    applications.push(application);
    return { id: `application-${applications.length}`, status: 'pending_review', submittedAt: '2026-10-17T00:00:00.000Z' };
  };

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    database.addDriverApplication = originalAddApplication;
    server.close();
  });

  const url = `http://127.0.0.1:${server.address().port}/api/guides/applications`;
  const base = {
    name: 'Local guide',
    contact: 'guide@example.test',
    regions: ['Hunza'],
    vehicle: 'Guide only',
    experienceYears: 5,
    consent: true,
    city: 'Karimabad'
  };
  const publishedResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...base, publishContact: true })
  });
  assert.equal(publishedResponse.status, 201);
  assert.equal(applications[0].city, 'Karimabad');
  assert.equal(applications[0].publicContact, 'guide@example.test');
  assert.equal(applications[0].publicContactConsent, true);

  const privateResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...base, publishContact: false })
  });
  assert.equal(privateResponse.status, 201);
  assert.equal('publicContact' in applications[1], false);
});

test('route estimates include additional OSRM alternatives when available', async (t) => {
  const originalGet = axios.get;
  axios.get = async (url, options) => {
    assert.match(url, /^https:\/\/router\.project-osrm\.org\/route\/v1\/driving\//);
    assert.equal(options.params.alternatives, 3);
    return {
      data: {
        code: 'Ok',
        routes: [
          { distance: 100000, duration: 7200, geometry: { coordinates: [] } },
          { distance: 110000, duration: 7800 },
          { distance: 95000, duration: 6900 }
        ]
      }
    };
  };
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    axios.get = originalGet;
    server.close();
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/routes/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
      destination: { name: 'Murree', lat: 33.9073, lng: 73.3943 }
    })
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.alternativeRoutes, [
    { option: 2, distanceKm: 110, durationHours: 2.2 },
    { option: 3, distanceKm: 95, durationHours: 1.9 }
  ]);
});

test('live currency and nearby facility routes proxy free data providers', async (t) => {
  const originalGet = axios.get;
  const originalPost = axios.post;
  let currencyResponseStatus = 200;
  let facilityElements = [
    { type: 'node', lat: 30.1, lon: 70, tags: { amenity: 'hospital', name: 'Far Hospital' } },
    { type: 'way', center: { lat: 30.02, lon: 70 }, tags: { amenity: 'clinic', name: 'Nearby Clinic' } },
    { type: 'node', lat: 30.03, lon: 70, tags: { amenity: 'fuel', name: 'Valley Fuel' } }
  ];
  axios.get = async (url, options) => {
    assert.equal(url, 'https://open.er-api.com/v6/latest/USD');
    assert.equal(options.timeout, 10000);
    return {
      data: {
        ...(currencyResponseStatus === 200
          ? { rates: { PKR: 280.25 }, time_last_update_utc: 'Sat, 17 Oct 2026 00:00:01 +0000' }
          : { rates: {}, result: 'error', 'error-type': 'unsupported-code' })
      }
    };
  };
  axios.post = async (url, body, options) => {
    assert.equal(url, 'https://overpass-api.de/api/interpreter');
    const query = new URLSearchParams(body).get('data');
    assert.match(query, /around:50000,30,70/);
    assert.equal(options.headers['Content-Type'], 'application/x-www-form-urlencoded');
    return {
      data: { elements: facilityElements }
    };
  };

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    axios.get = originalGet;
    axios.post = originalPost;
    server.close();
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const currencyResponse = await fetch(`${baseUrl}/api/live/currency`);
  assert.equal(currencyResponse.status, 200);
  const currency = await currencyResponse.json();
  assert.equal(currency.rate, 280.25);
  assert.equal(currency.source, 'Exchange Rate API');

  const facilityResponse = await fetch(`${baseUrl}/api/live/facilities?lat=30&lng=70`);
  assert.equal(facilityResponse.status, 200);
  const facilities = await facilityResponse.json();
  assert.deepEqual(facilities.hospital, { name: 'Nearby Clinic', distanceKm: 2.2 });
  assert.deepEqual(facilities.fuelStation, { name: 'Valley Fuel', distanceKm: 3.3 });
  assert.equal(facilities.radiusKm, 50);

  facilityElements = [];
  const emptyFacilityResponse = await fetch(`${baseUrl}/api/live/facilities?lat=30&lng=70`);
  assert.equal(emptyFacilityResponse.status, 200);
  assert.deepEqual(await emptyFacilityResponse.json(), {
    hospital: null,
    fuelStation: null,
    radiusKm: 50,
    source: 'OpenStreetMap Overpass'
  });

  currencyResponseStatus = 503;
  const unavailableCurrency = await fetch(`${baseUrl}/api/live/currency`);
  assert.equal(unavailableCurrency.status, 502);
  assert.match((await unavailableCurrency.json()).message, /did not return a PKR rate/);

  const invalidResponse = await fetch(`${baseUrl}/api/live/facilities?lat=10&lng=70`);
  assert.equal(invalidResponse.status, 400);
});

test('live road weather is sourced from Open-Meteo and returns provider-based alerts', async (t) => {
  const originalGet = axios.get;
  axios.get = async (url, options) => {
    assert.equal(url, 'https://api.open-meteo.com/v1/forecast');
    assert.equal(options.params.latitude, 36.3167);
    assert.equal(options.params.longitude, 74.65);
    assert.match(options.params.current, /precipitation/);
    return {
      data: {
        current: {
          time: '2026-10-17T12:00',
          temperature_2m: 8,
          apparent_temperature: 6,
          precipitation: 3,
          weather_code: 61,
          wind_speed_10m: 12
        },
        hourly: {
          time: ['2026-10-17T12:00'],
          precipitation_probability: [80],
          precipitation: [3],
          weather_code: [61]
        }
      }
    };
  };

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    axios.get = originalGet;
    server.close();
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/live/road-weather?lat=36.3167&lng=74.65&location=Hunza`);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.location, 'Hunza');
  assert.equal(result.source, 'Open-Meteo');
  assert.ok(result.fetchedAt);
  assert.equal(result.nextHours[0].precipitationProbability, 80);
  assert.match(result.alerts[0], /Precipitation is reported/);

  const invalidResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/live/road-weather?lat=10&lng=74.65`);
  assert.equal(invalidResponse.status, 400);
});

test('obsolete media search and metadata proxy routes are not registered', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const searchResponse = await fetch(`${baseUrl}/api/media/search-videos?destination=Hunza`);
  const metadataResponse = await fetch(`${baseUrl}/api/media/youtube/1j9wYgK88hM`);
  assert.equal(searchResponse.status, 404);
  assert.equal(metadataResponse.status, 404);
});

test('MyMemory translation is available without AI provider configuration', async (t) => {
  const originalGet = axios.get;
  let myMemoryResponseStatus = 200;
  axios.get = async (url, options) => {
    assert.equal(url, 'https://api.mymemory.translated.net/get');
    assert.equal(options.params.langpair, 'en|ur');
    return {
      data: {
        responseStatus: myMemoryResponseStatus,
        ...(myMemoryResponseStatus === 200
          ? { responseData: { translatedText: 'ہسپتال کہاں ہے؟' } }
          : { responseDetails: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE QUOTA' })
      }
    };
  };

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    axios.get = originalGet;
    server.close();
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/tools/translate/mymemory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Where is the hospital?', sourceLanguage: 'English', targetLanguage: 'Urdu' })
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.translation, 'ہسپتال کہاں ہے؟');
  assert.equal(result.source, 'MyMemory Translation API');
  assert.ok(result.translatedAt);

  myMemoryResponseStatus = 429;
  const limitedResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/tools/translate/mymemory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Try another phrase', sourceLanguage: 'English', targetLanguage: 'Urdu' })
  });
  assert.equal(limitedResponse.status, 429);
  assert.match((await limitedResponse.json()).message, /limit has been reached/);
});

test('configured AI endpoints return translations; missing config is explicit', async (t) => {
  const originalEnvironment = {
    nodeEnv: process.env.NODE_ENV,
    endpoint: process.env.PUBLIC_AI_ENDPOINT,
    model: process.env.PUBLIC_AI_MODEL,
    apiKey: process.env.PUBLIC_AI_API_KEY
  };
  let providerPayload;
  const provider = http.createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      providerPayload = JSON.parse(body);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({
        choices: [{ message: { content: 'Test provider translation' } }]
      }));
    });
  });
  provider.listen(0, '127.0.0.1');
  await once(provider, 'listening');

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    provider.close();
    server.close();
    for (const [key, value] of Object.entries({
      NODE_ENV: originalEnvironment.nodeEnv,
      PUBLIC_AI_ENDPOINT: originalEnvironment.endpoint,
      PUBLIC_AI_MODEL: originalEnvironment.model,
      PUBLIC_AI_API_KEY: originalEnvironment.apiKey
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  delete process.env.PUBLIC_AI_ENDPOINT;
  delete process.env.PUBLIC_AI_MODEL;
  const pending = await fetch(`${baseUrl}/api/tools/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello', sourceLanguage: 'English', targetLanguage: 'Urdu' })
  });
  assert.equal(pending.status, 503);
  assert.equal((await pending.json()).message, 'AI Translator offline. Please configure API.');

  process.env.NODE_ENV = 'development';
  process.env.PUBLIC_AI_ENDPOINT = `http://127.0.0.1:${provider.address().port}/v1/chat/completions`;
  process.env.PUBLIC_AI_MODEL = 'test-provider-model';
  const response = await fetch(`${baseUrl}/api/tools/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Where is the hospital?', sourceLanguage: 'English', targetLanguage: 'Urdu' })
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.translation, 'Test provider translation');
  assert.equal(result.model, 'test-provider-model');
  assert.match(providerPayload.messages[0].content, /Where is the hospital/);

  const chatbotResponse = await fetch(`${baseUrl}/api/tools/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Help me plan a trip to Hunza.',
      history: [{ role: 'user', content: 'I want to travel in spring.' }, { role: 'assistant', content: 'What kind of trip do you enjoy?' }]
    })
  });
  assert.equal(chatbotResponse.status, 200);
  assert.match(providerPayload.messages[0].content, /friendly, enthusiastic, knowledgeable Pakistani travel guide/);
  assert.match(providerPayload.messages[0].content, /do not lead with disclaimers/);
  assert.match(providerPayload.messages[0].content, /still give useful general guidance first/);
  assert.match(providerPayload.messages[0].content, /3 or 4 sentences maximum/);
  assert.match(providerPayload.messages[0].content, /natural follow-up question/);
  assert.match(providerPayload.messages[0].content, /\/tools\?tab=packing/);
  assert.match(providerPayload.messages[0].content, /\/guides/);
  assert.deepEqual(providerPayload.messages.slice(1, 3), [
    { role: 'user', content: 'I want to travel in spring.' },
    { role: 'assistant', content: 'What kind of trip do you enjoy?' }
  ]);
  assert.match(providerPayload.messages[3].content, /Help me plan a trip to Hunza/);
});
