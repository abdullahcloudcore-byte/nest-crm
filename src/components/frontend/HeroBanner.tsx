import React from 'react';
import { Post, Category } from '../../types';
import { Clock, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { getCategoryIcon } from '../../utils/iconMap';

interface HeroBannerProps {
  post: Post;
  category?: Category;
  categories?: Category[];
  onSelectPost: (post: Post) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  post,
  category,
  categories,
  onSelectPost,
  onSelectCategory,
}) => {
  const resolvedCategory = category || categories?.find((c) => c.id === post.categoryId);
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className="relative border-b border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 pb-12 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Headline & Editorial Body */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#E8E6DF] dark:bg-[#242420] text-[#1A1A1A] dark:text-[#F5F3ED] px-2.5 py-1 font-bold uppercase tracking-wider">
                FEATURED DISPATCH
              </span>
              {resolvedCategory && (
                <button
                  onClick={() => onSelectCategory(resolvedCategory.slug)}
                  className="text-[#C45E3D] dark:text-[#E07353] font-bold uppercase tracking-wider hover:underline"
                >
                  {resolvedCategory.name}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60">
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{post.readingTimeMinutes} MIN READ</span>
            </div>
          </div>

          {/* Headline */}
          <h2
            onClick={() => onSelectPost(post)}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-[#1A1A1A] dark:text-[#F5F3ED] leading-[1.02] tracking-tight hover:italic transition-all cursor-pointer"
          >
            {post.title}
          </h2>

          <p className="text-base sm:text-lg text-[#1A1A1A]/80 dark:text-[#E8E6DF]/80 leading-relaxed font-sans max-w-2xl">
            {post.excerpt}
          </p>

          <div className="h-[1px] w-full bg-[#1A1A1A] dark:bg-[#E8E6DF] opacity-10" />

          {/* Author & Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover grayscale contrast-125 border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20"
              />
              <div>
                <div className="font-serif italic font-medium text-base text-[#1A1A1A] dark:text-[#F5F3ED]">
                  {post.author.name}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60">
                  {post.author.role}
                </div>
              </div>
            </div>

            <button
              id="hero-read-cta"
              onClick={() => onSelectPost(post)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] dark:bg-[#F5F3ED] text-[#F5F3ED] dark:text-[#1A1A1A] text-[11px] uppercase font-bold tracking-widest hover:bg-[#C45E3D] dark:hover:bg-[#E07353] dark:hover:text-white transition-colors"
            >
              <span>Read Full Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Editorial Image Frame */}
        <div
          className="lg:col-span-5 relative group cursor-pointer"
          onClick={() => onSelectPost(post)}
        >
          <div className="border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 p-2.5 bg-[#FFFFFF] dark:bg-[#1C1C19] shadow-sm">
            <div className="aspect-[4/3] overflow-hidden bg-[#E8E6DF] dark:bg-[#242420]">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-90"
              />
            </div>
            <div className="pt-2 px-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60">
              <span>FIG 1.0 — Architecture Topology</span>
              <span>{post.views} Readers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
