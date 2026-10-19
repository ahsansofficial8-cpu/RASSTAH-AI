import { Play } from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/data/destinationImages';

export default function DestinationVideo({ destinationName, youtubeUrl, isLoading = false }) {
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl, '?rel=0');

  if (isLoading) {
    return (
      <div className="aspect-video animate-pulse rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)]" role="status" aria-label={`Loading ${destinationName} video`} />
    );
  }

  if (!embedUrl) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-6 text-center text-[var(--text-secondary)]" role="status">
        <Play size={28} aria-hidden="true" />
        <p className="mb-0 text-sm">No destination video is available in the local media file.</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] shadow-md">
        <iframe
          src={embedUrl}
          title={`${destinationName} — YouTube destination video`}
          className="h-full w-full border-0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <p className="text-xs text-[var(--text-secondary)]">
        Video link supplied by the local destination media file; footage content has not been independently verified.
        {' '}<a href={youtubeUrl} target="_blank" rel="noreferrer" className="text-[var(--brand-primary)] underline">Open on YouTube</a>
      </p>
    </section>
  );
}
