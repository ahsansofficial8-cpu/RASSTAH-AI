/**
 * ==============================================================================
 * RAASTAH (راستہ) — TRAVEL STORIES & ALPINE GUIDES
 * Comprehensive, fact-checked editorial guides and road trip narratives.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, User, ArrowRight, Sparkles, 
  MapPin, Share2, Compass, CheckCircle2, ChevronRight
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { BLOG_POSTS } from '@/data/blogData';
import { Badge, Button, Card } from '@/components/ui';
import DestinationImage from '@/components/ui/DestinationImage';

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <PageWrapper>
      <main className="min-h-screen bg-[var(--bg-page)] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          
          {/* Header */}
          <header className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <BookOpen size={14} />
              <span>EXPEDITION DISPATCHES & GUIDES</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 sm:text-5xl">
              Alpine Travel Stories & Guides
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              In-depth mountain road reports, high-altitude survival recommendations, and curated cultural itineraries from vetted Pakistani expedition leads.
            </p>
          </header>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card 
                  hover 
                  className="h-full flex flex-col justify-between overflow-hidden border-slate-200 bg-white shadow-md hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <DestinationImage
                        destinationId={post.destinationId}
                        locationName={post.title}
                        fill
                        className="group-hover:scale-108 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 text-slate-900 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {post.category}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1">
                        <Clock size={12} />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">{post.author}</span>
                      </div>

                      <h2 className="font-display font-bold text-lg text-slate-900 group-hover:text-[var(--brand-primary)] transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] group-hover:gap-2 transition-all">
                      <span>Read Full Guide</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Modal Article Reader */}
          {selectedPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-6">
                
                <button 
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
                >
                  ✕
                </button>

                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    {selectedPost.category} · {selectedPost.readTime}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <span>By <strong>{selectedPost.author}</strong> ({selectedPost.authorRole})</span>
                    <span>•</span>
                    <span>Published {selectedPost.date}</span>
                  </div>
                </div>

                <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100">
                  <DestinationImage
                    destinationId={selectedPost.destinationId}
                    locationName={selectedPost.title}
                    fill
                  />
                </div>

                <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                  {selectedPost.content}
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <Button 
                    variant="primary" 
                    onClick={() => setSelectedPost(null)}
                    className="text-xs font-bold px-6 py-2.5"
                  >
                    Done Reading
                  </Button>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </PageWrapper>
  );
}
