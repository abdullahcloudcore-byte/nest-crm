import React from 'react';
import { Category } from '../../types';
import { Sparkles } from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  totalPostsCount: number;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  totalPostsCount,
}) => {
  return (
    <div className="mb-10 pb-6 border-b border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60">
          Index by Architecture Domain
        </h3>
        {selectedCategorySlug && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-[11px] font-mono uppercase tracking-wider text-[#C45E3D] dark:text-[#E07353] hover:underline"
          >
            [ Reset Filter ]
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
        {/* All topics */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold border transition-all flex items-center gap-2 ${
            selectedCategorySlug === null
              ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A] border-[#1A1A1A] dark:border-[#F5F3ED]'
              : 'bg-transparent text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 hover:border-[#1A1A1A] dark:hover:border-[#E8E6DF]'
          }`}
        >
          <span>All Dispatches</span>
          <span className="font-mono text-[10px] opacity-60">({totalPostsCount})</span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
              className={`flex-shrink-0 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold border transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A] border-[#1A1A1A] dark:border-[#F5F3ED]'
                  : 'bg-transparent text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 hover:border-[#1A1A1A] dark:hover:border-[#E8E6DF]'
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.postCount === 'number' && (
                <span className="font-mono text-[10px] opacity-60">({cat.postCount})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
