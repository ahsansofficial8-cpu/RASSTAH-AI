require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') });

const dns = require('node:dns');
const mongoose = require('mongoose');

const dnsServers = process.env.MONGODB_DNS_SERVERS
  ?.split(',')
  .map((server) => server.trim())
  .filter(Boolean);
if (dnsServers?.length) dns.setServers(dnsServers);

const DEMO_OPERATORS = [
  { city: 'Hunza', coordinates: [74.65, 36.3167] },
  { city: 'Skardu', coordinates: [75.6333, 35.2971] },
  { city: 'Islamabad', coordinates: [73.0479, 33.6844] },
  { city: 'Gilgit', coordinates: [74.3144, 35.9208] },
  { city: 'Lahore', coordinates: [74.3587, 31.5204] },
  { city: 'Chitral', coordinates: [71.7864, 35.8518] },
  { city: 'Naran', coordinates: [73.6501, 34.9092] },
  { city: 'Kalam', coordinates: [72.5853, 35.4908] },
  { city: 'Peshawar', coordinates: [71.5249, 34.0151] },
  { city: 'Karachi', coordinates: [67.0011, 24.8607] }
];

async function seedDemoOperators() {
  if (process.env.ALLOW_DEMO_OPERATOR_SEED !== 'true') {
    throw new Error('Set ALLOW_DEMO_OPERATOR_SEED=true to seed clearly labeled demo-only profiles.');
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('Set MONGODB_URI before seeding demo operators.');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });

  const { models } = require('../models');
  const reviewedAt = new Date().toISOString();
  const operations = DEMO_OPERATORS.map(({ city, coordinates }, index) => {
    const number = String(index + 1).padStart(2, '0');
    const id = `demo-operator-${number}`;
    const disclaimer = 'DEMO DATA ONLY — this is not a real business or service listing.';
    const profile = {
      id,
      name: `DEMO ONLY — Sample Tour Operator ${number}`,
      city,
      region: city,
      regions: [city],
      vehicle: disclaimer,
      services: [disclaimer],
      publicContact: '',
      experienceYears: 0,
      reviewedAt,
      status: 'approved',
      demoOnly: true,
      location: { type: 'Point', coordinates }
    };

    return {
      updateOne: {
        filter: { id },
        update: { $set: profile },
        upsert: true
      }
    };
  });

  const result = await models.Driver.bulkWrite(operations, { ordered: true });
  console.log(`Seeded or updated ${DEMO_OPERATORS.length} clearly labeled demo-only operator profiles.`);
  console.log(`MongoDB matched ${result.matchedCount}; inserted ${result.upsertedCount}.`);
}

seedDemoOperators()
  .catch((error) => {
    console.error('Demo operator seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
