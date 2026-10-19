import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dns from 'node:dns';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(scriptDirectory, '..');
const mediaPath = path.join(clientDirectory, 'src', 'data', 'pakistan_travel_media_99.json');
const locationsPath = path.join(clientDirectory, 'src', 'data', 'pakistan59Locations.js');
const outputDirectory = path.join(clientDirectory, 'public', 'images', 'destinations');
const force = process.argv.includes('--force');
const supportedLicenses = /^(CC0(?: 1\.0)?|CC BY(?:-SA)? \d(?:\.\d)?|Public domain(?: .*)?|PD-[A-Za-z0-9-]+)$/i;
const dnsServers = process.env.DESTINATION_IMAGE_DNS_SERVERS
  ?.split(',')
  .map((server) => server.trim())
  .filter(Boolean);
if (dnsServers?.length) dns.setServers(dnsServers);

function normalize(value) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stripHtml(value = '') {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:p|div)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0*39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchCommonsMetadata(imageUrl) {
  const source = new URL(imageUrl);
  if (source.hostname !== 'upload.wikimedia.org') {
    throw new Error('Only Wikimedia Commons image URLs are supported.');
  }

  const filename = decodeURIComponent(source.pathname.split('/').pop());
  const endpoint = new URL('https://commons.wikimedia.org/w/api.php');
  endpoint.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    titles: `File:${filename}`,
    iiprop: 'url|extmetadata',
    iiurlwidth: '1600'
  });

  const response = await fetch(endpoint, {
    headers: { 'User-Agent': 'RaastahDestinationImageDownloader/1.0 (local site asset preparation)' },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`Wikimedia Commons metadata returned HTTP ${response.status}.`);
  const payload = await response.json();
  const page = Object.values(payload.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl || !info.extmetadata) throw new Error('Wikimedia Commons returned no reusable file metadata.');

  const licenseName = stripHtml(info.extmetadata.LicenseShortName?.value);
  const licenseUrl = stripHtml(info.extmetadata.LicenseUrl?.value);
  if (!supportedLicenses.test(licenseName) || !licenseUrl) {
    throw new Error(`The image has no supported, verifiable reuse license (${licenseName || 'unknown'}).`);
  }

  const creator = stripHtml(info.extmetadata.Artist?.value);
  const credit = stripHtml(info.extmetadata.Credit?.value);
  const title = stripHtml(info.extmetadata.ObjectName?.value) || filename;
  return {
    downloadUrl: info.thumburl,
    title,
    creator,
    credit,
    licenseName,
    licenseUrl,
    sourcePage: info.descriptionurl
  };
}

async function saveImage(imageUrl, filePath) {
  const response = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Image download returned HTTP ${response.status}.`);
  const contentType = response.headers.get('content-type') || '';
  if (!/^image\/(?:jpeg|png|webp)$/i.test(contentType)) {
    throw new Error(`Image server returned unsupported content type: ${contentType || 'unknown'}.`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error('Image download was empty.');
  await writeFile(filePath, bytes);
}

const media = JSON.parse(await readFile(mediaPath, 'utf8'));
const locationsModule = await import(pathToFileURL(locationsPath));
const locations = locationsModule.PAKISTAN_99_LOCATIONS;
if (!Array.isArray(locations) || locations.length !== 99) {
  throw new Error(`Expected 99 destination records; found ${locations?.length ?? 'none'}.`);
}

await mkdir(outputDirectory, { recursive: true });
const attributions = {};
const failures = [];

for (const location of locations) {
  const record = media[normalize(location.name)];
  const imageUrl = record?.images?.[0];
  if (!imageUrl) {
    failures.push(`${location.id}: no first image in media catalog`);
    continue;
  }

  const sourceExtension = path.extname(new URL(imageUrl).pathname).toLowerCase();
  const extension = sourceExtension === '.png' ? 'png' : 'jpg';
  const filename = `${location.id}.${extension}`;
  const filePath = path.join(outputDirectory, filename);

  try {
    let license = await fetchCommonsMetadata(imageUrl);
    if (force || !(await fileExists(filePath))) {
      await saveImage(license.downloadUrl, filePath);
    }
    attributions[location.id] = {
      filename,
      title: license.title,
      creator: license.creator,
      credit: license.credit,
      license: license.licenseName,
      licenseUrl: license.licenseUrl,
      sourcePage: license.sourcePage,
      changes: 'Resized from the Wikimedia Commons source image for local web delivery.'
    };
    license = null;
    console.log(`Prepared ${location.id}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    if (error instanceof TypeError || ['AbortError', 'TimeoutError'].includes(error.name)) {
      throw new Error(`Wikimedia Commons is unreachable while preparing ${location.id}: ${error.message}`, { cause: error });
    }
    failures.push(`${location.id}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Prepared ${Object.keys(attributions).length} of ${locations.length} images.`);
  for (const failure of failures) console.error(`- ${failure}`);
  throw new Error('Image preparation incomplete; no attribution manifest was written.');
}

const manifestPath = path.join(outputDirectory, 'attributions.json');
const temporaryManifestPath = `${manifestPath}.tmp`;
await writeFile(temporaryManifestPath, `${JSON.stringify(attributions, null, 2)}\n`);
await rename(temporaryManifestPath, manifestPath);
console.log(`Prepared ${locations.length} licensed destination images and their attribution manifest.`);

async function fileExists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
