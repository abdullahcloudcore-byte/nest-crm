import React from 'react';
import { Post, Category } from '../../types';
import { Clock, Eye, Bookmark, Heart } from 'lucide-react';

interface PostCardProps {
  post: Post;
  category?: Category;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelectPost: (post: Post) => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectTag: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  category,
  isBookmarked,
  onToggleBookmark,
  onSelectPost,
  onSelectCategory,
  onSelectTag,
}) => {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  return (
    <article className="flex flex-col justify-between border border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 bg-[#FFFFFF] dark:bg-[#1C1C19] p-6 group hover:border-[#1A1A1A] dark:hover:border-[#E8E6DF] transition-all relative">
      {/* Top Meta: Domain & Date */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4 text-[10px] uppercase tracking-widest font-mono">
          {category ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCategory(category.slug);
              }}
              className="font-bold text-[#C45E3D] dark:text-[#E07353] hover:underline"
            >
              {category.name}
            </button>
          ) : (
            <span className="text-[#C45E3D] dark:text-[#E07353] font-bold">Architecture</span>
          )}

          <div className="flex items-center gap-3 text-[#1A1A1A]/50 dark:text-[#E8E6DF]/50">
            <span>{formattedDate}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(post.id);
              }}
              className="p-1 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED] transition-colors"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#C45E3D] text-[#C45E3D]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div
          onClick={() => onSelectPost(post)}
          className="aspect-[16/9] w-full overflow-hidden bg-[#E8E6DF] dark:bg-[#242420] mb-4 border border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 cursor-pointer"
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter saturate-90"
            loading="lazy"
          />
        </div>

        {/* Title */}
        <h4
          onClick={() => onSelectPost(post)}
          className="text-2xl font-serif leading-tight font-normal text-[#1A1A1A] dark:text-[#F5F3ED] mb-3 group-hover:text-[#C45E3D] dark:group-hover:text-[#E07353] cursor-pointer transition-colors"
        >
          {post.title}
        </h4>

        {/* Excerpt */}
        <p className="text-sm text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 font-sans leading-relaxed line-clamp-3 mb-6">
          {post.excerpt}
        </p>
      </div>

      {/* Footer: Tags and Read Info */}
      <div className="border-t border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 pt-4 mt-auto">
        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-mono font-bold tracking-tighter mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTag(tag);
              }}
              className="text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 hover:text-[#C45E3D] dark:hover:text-[#E07353] transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#1A1A1A]/50 dark:text-[#E8E6DF]/50">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTimeMinutes} MIN READ
          </span>

          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {post.views} VIEWS
          </span>
        </div>
      </div>
    </article>
  );
};
