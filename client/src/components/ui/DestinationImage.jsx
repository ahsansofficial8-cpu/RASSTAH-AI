import { useEffect, useState } from 'react';
import { getLocalDestinationImage, loadDestinationMedia } from '@/data/destinationImages';

function DestinationFallback({ destinationName }) {
  return (
    <div
      className="relative flex h-full min-h-40 flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-teal-900 via-cyan-800 to-emerald-900 p-4 text-center text-white"
      role="img"
      aria-label={`${destinationName}, destination image unavailable`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.22),transparent_60%)]" aria-hidden="true" />
      <span className="relative max-w-full break-words text-lg font-semibold text-white">{destinationName}</span>
    </div>
  );
}

export default function DestinationImage({
  alt,
  locationName,
  destinationId,
  photoIndex = 0,
  imageUrls,
  showSkeleton = false,
  fallbackUrl = '',
  fill = false,
  priority = false,
  className = ''
}) {
  const normalizedName = (locationName || alt || 'Pakistan destination')
    .replace(/\s+pakistan$/i, '')
    .trim();
  const localUrl = destinationId ? getLocalDestinationImage(destinationId) : '';
  const requestedUrl = Number.isInteger(photoIndex) && photoIndex > 0 && imageUrls?.[photoIndex]
    ? imageUrls[photoIndex]
    : localUrl;
  const [loadedUrl, setLoadedUrl] = useState('');
  const [failedUrl, setFailedUrl] = useState('');
  const [catalogFallback, setCatalogFallback] = useState('');
  const usableFallback = fallbackUrl || catalogFallback;
  const [useBackup, setUseBackup] = useState(false);
  const backupUrl = 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1600&q=80';
  const effectiveImageUrl = useBackup ? backupUrl : (failedUrl === localUrl && localUrl && usableFallback
    ? usableFallback
    : requestedUrl || usableFallback || backupUrl);
  const imageUrl = effectiveImageUrl;
  const isLoaded = loadedUrl === imageUrl;
  const failed = failedUrl === imageUrl && useBackup;

  useEffect(() => {
    if (!destinationId || (localUrl && failedUrl !== localUrl) || fallbackUrl || catalogFallback) return undefined;
    let active = true;
    loadDestinationMedia(destinationId)
      .then((media) => {
        if (active && media.fallbackUrl) setCatalogFallback(media.fallbackUrl);
      })
      .catch((error) => console.error(`Unable to load fallback photo for ${destinationId}`, error));
    return () => { active = false; };
  }, [destinationId, failedUrl, localUrl, fallbackUrl, catalogFallback]);

  const handleError = () => {
    if (!useBackup) {
      setUseBackup(true);
    } else {
      setFailedUrl(imageUrl);
    }
  };

  return (
    <div
      className={`${fill ? 'absolute inset-0' : 'relative aspect-[16/10] min-h-40'} w-full overflow-hidden bg-[var(--bg-subtle)] ${fill ? '' : 'rounded-xl'} ${className}`}
    >
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={alt || `${normalizedName} landscape`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoadedUrl(imageUrl)}
          onError={handleError}
          className={`h-full w-full object-cover ${showSkeleton && !isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        />
      ) : (
        <DestinationFallback destinationName={normalizedName} />
      )}
      {showSkeleton && !failed && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--bg-subtle)] via-[var(--bg-hover)] to-[var(--bg-subtle)]" role="status" aria-label={`Loading ${normalizedName} image`} />
      )}
    </div>
  );
}
