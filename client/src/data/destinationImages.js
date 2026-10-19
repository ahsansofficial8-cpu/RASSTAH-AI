import { PAKISTAN_99_LOCATIONS } from './pakistan59Locations.js';

function normalizeDestinationName(value) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const LOCAL_IMAGE_MODULES = import.meta.glob('../images/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default'
});
const LOCAL_IMAGES_BY_SLUG = Object.freeze(
  Object.fromEntries(Object.entries(LOCAL_IMAGE_MODULES).map(([path, imageUrl]) => {
    const filename = path.split('/').pop().replace(/\.(?:jpe?g|png|webp)$/i, '');
    return [filename, imageUrl];
  }))
);

function findLocalImage(id, name = '') {
  if (!id) return '';
  const norm = normalizeDestinationName(name || id);
  if (LOCAL_IMAGES_BY_SLUG[norm]) return LOCAL_IMAGES_BY_SLUG[norm];
  if (LOCAL_IMAGES_BY_SLUG[id]) return LOCAL_IMAGES_BY_SLUG[id];

  const slugKeys = Object.keys(LOCAL_IMAGES_BY_SLUG);
  const matchedKey = slugKeys.find((k) => (
    k === id
    || k === norm
    || k.startsWith(id)
    || id.startsWith(k)
    || k.includes(id.split('-')[0])
    || (norm && k.includes(norm.split('-')[0]))
  ));
  if (matchedKey && LOCAL_IMAGES_BY_SLUG[matchedKey]) {
    return LOCAL_IMAGES_BY_SLUG[matchedKey];
  }

  return `https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1600&q=80`;
}

const DESTINATION_IMAGE_BY_ID = Object.freeze(
  Object.fromEntries(PAKISTAN_99_LOCATIONS.map(({ id, name }) => [
    id,
    findLocalImage(id, name)
  ]))
);

function getDestinationRecord(destinationId, records) {
  const destination = PAKISTAN_99_LOCATIONS.find((location) => location.id === destinationId);
  return destination ? records[normalizeDestinationName(destination.name)] || null : null;
}

export function getLocalDestinationImage(destinationId) {
  if (!destinationId) return '';
  if (DESTINATION_IMAGE_BY_ID[destinationId]) return DESTINATION_IMAGE_BY_ID[destinationId];
  return findLocalImage(destinationId);
}

export function getYouTubeVideoId(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    const allowedHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be', 'www.youtu.be']);
    if (!allowedHosts.has(url.hostname.toLocaleLowerCase())) return '';
    const pathParts = url.pathname.split('/').filter(Boolean);
    const videoId = url.hostname.toLocaleLowerCase().endsWith('youtu.be')
      ? pathParts[0]
      : url.searchParams.get('v') || (['embed', 'shorts', 'live'].includes(pathParts[0]) ? pathParts[1] : '');
    return /^[A-Za-z0-9_-]{11}$/.test(videoId || '') ? videoId : '';
  } catch {
    return '';
  }
}

export function getYouTubeEmbedUrl(value, params = '') {
  const videoId = getYouTubeVideoId(value);
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}${params}`
    : '';
}

export const DESTINATION_IMAGES = Object.freeze(
  Object.fromEntries(PAKISTAN_99_LOCATIONS.map(({ id }) => [id, Object.freeze([getLocalDestinationImage(id)])]))
);

export function getDestinationMedia(destinationId) {
  const localImage = getLocalDestinationImage(destinationId);
  return { images: localImage ? [localImage] : [], youtubeUrl: '' };
}

let sourceMediaPromise;
let attributionPromise;

export async function loadDestinationMedia(destinationId) {
  const destination = PAKISTAN_99_LOCATIONS.find((location) => location.id === destinationId);
  if (!destination) return { images: [], youtubeUrl: '', attribution: null };

  sourceMediaPromise ||= import('./pakistan_travel_media_99.json').then((module) => module.default);
  attributionPromise ||= fetch('/images/destinations/attributions.json')
    .then((response) => {
      if (!response.ok) return {};
      const contentType = response.headers.get('content-type') || '';
      return contentType.includes('application/json') ? response.json() : {};
    })
    .catch((error) => {
      console.warn('Local destination image attributions are not available.', error);
      return {};
    });

  const [records, attributions] = await Promise.all([sourceMediaPromise, attributionPromise]);
  const record = getDestinationRecord(destinationId, records);
  const images = Array.isArray(record?.images)
    ? record.images.filter((url) => typeof url === 'string' && /^https?:\/\/\S+$/i.test(url))
    : [];

  return {
    images: images.length
      ? [getLocalDestinationImage(destinationId) || images[0], ...images.slice(1)]
      : [getLocalDestinationImage(destinationId)].filter(Boolean),
    youtubeUrl: getYouTubeVideoId(record?.youtube_url) ? record.youtube_url : '',
    fallbackUrl: images[0] || '',
    attribution: attributions[destinationId] || null
  };
}
