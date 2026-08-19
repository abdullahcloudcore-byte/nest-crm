import React from 'react';
import { Category, Post } from '../../types';
import { PostCard } from './PostCard';
import { ArrowLeft, Rss, Layers } from 'lucide-react';

interface CategoryViewProps {
  category: Category;
  posts: Post[];
  categories: Category[];
  bookmarkedIds: string[];
  onToggleBookmark: (postId: string) => void;
  onSelectPost: (post: Post) => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectTag: (tag: string) => void;
  onBack: () => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  posts,
  categories,
  bookmarkedIds,
  onToggleBookmark,
  onSelectPost,
  onSelectCategory,
  onSelectTag,
  onBack,
}) => {
  const categoryPosts = posts.filter((p) => p.categoryId === category.id && p.status === 'published');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Back button */}
      <div className="pb-4 border-b border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs uppercase font-mono font-bold tracking-wider text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 hover:text-[#C45E3D] dark:hover:text-[#E07353] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Return to All Dispatches</span>
        </button>
      </div>

      {/* Category Editorial Masthead Banner */}
      <div className="border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 bg-[#FFFFFF] dark:bg-[#1C1C19] p-8 sm:p-12 relative overflow-hidden">
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#C45E3D] dark:text-[#E07353] font-bold">
            <span>DOMAIN ARCHIVE</span>
            <span>•</span>
            <span>{categoryPosts.length} PUBLICATIONS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-[#1A1A1A] dark:text-[#F5F3ED] leading-[1.05]">
            {category.name}
          </h1>

          <p className="text-base sm:text-lg text-[#1A1A1A]/80 dark:text-[#E8E6DF]/80 leading-relaxed font-sans">
            {category.description}
          </p>

          <div className="pt-4 flex items-center gap-3">
            <a
              href="/rss.xml"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold tracking-wider px-4 py-2 bg-[#1A1A1A] dark:bg-[#F5F3ED] text-[#F5F3ED] dark:text-[#1A1A1A] hover:bg-[#C45E3D] dark:hover:bg-[#E07353] dark:hover:text-white transition-colors"
            >
              <Rss className="w-3.5 h-3.5 text-[#E07353] dark:text-[#C45E3D]" />
              <span>Syndicate Domain (RSS)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Post Grid in this category */}
      <div>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10">
          <h2 className="text-xs uppercase font-mono tracking-[0.25em] font-bold text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70">
            Archived Articles in {category.name}
          </h2>
          <span className="font-mono text-xs font-bold text-[#C45E3D] dark:text-[#E07353]">
            {categoryPosts.length} Items
          </span>
        </div>

        {categoryPosts.length === 0 ? (
          <div className="text-center py-20 border border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 bg-[#FFFFFF] dark:bg-[#1C1C19] space-y-3">
            <Layers className="w-10 h-10 text-[#7E7C76] mx-auto opacity-50" />
            <h3 className="font-serif text-lg text-[#1A1A1A] dark:text-[#F5F3ED]">
              No publications currently in this section
            </h3>
            <p className="text-xs font-mono uppercase text-[#7E7C76]">
              Drafts are being prepared by the editorial board.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                category={category}
                isBookmarked={bookmarkedIds.includes(post.id)}
                onToggleBookmark={onToggleBookmark}
                onSelectPost={onSelectPost}
                onSelectCategory={onSelectCategory}
                onSelectTag={onSelectTag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
