import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight, Tag, BookOpen, Layers } from 'lucide-react';
import { Post, Category } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  categories: Category[];
  onSelectPost: (post: Post) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  posts,
  categories,
  onSelectPost,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPosts = posts.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.content.toLowerCase().includes(q)
    );
  });

  const filteredCategories = categories.filter((c) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#1C1C19] border border-[#1A1A1A] dark:border-[#E8E6DF]/30 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C45E3D] dark:text-[#E07353]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search publications, architectural patterns, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-[#1A1A1A] dark:text-[#F5F3ED] placeholder-[#7E7C76] focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[10px] font-mono uppercase text-[#7E7C76] hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED]"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#7E7C76] hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4 max-h-[60vh]">
          {/* Categories Results */}
          {filteredCategories.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#7E7C76] font-bold">
                Matching Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCategory(c.slug);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-mono uppercase font-bold bg-[#E8E6DF] dark:bg-[#242420] text-[#1A1A1A] dark:text-[#F5F3ED] hover:bg-[#C45E3D] hover:text-white transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#7E7C76] font-bold">
              {query ? `Matching Articles (${filteredPosts.length})` : 'Recent Publications'}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-10 text-[#7E7C76] text-xs font-mono uppercase">
                No matching publications found for "{query}"
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="p-3.5 border border-transparent hover:border-[#1A1A1A]/20 dark:hover:border-[#E8E6DF]/20 hover:bg-[#F9F8F4] dark:hover:bg-[#242420] cursor-pointer transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <h4 className="font-serif text-base text-[#1A1A1A] dark:text-[#F5F3ED] group-hover:text-[#C45E3D] dark:group-hover:text-[#E07353] transition-colors line-clamp-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[#7E7C76] line-clamp-1 font-sans">
                        {post.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#7E7C76] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F5F3ED] flex-shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 bg-[#F9F8F4] dark:bg-[#141412] text-[10px] font-mono text-[#7E7C76] flex items-center justify-between">
          <span>Navigate with mouse or tap</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
