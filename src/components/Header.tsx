import React from 'react';
import { Search, Moon, Sun, LayoutDashboard, Layers, Code, Globe, Bookmark, BookOpen, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface HeaderProps {
  categories: Category[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenSeoModal: () => void;
  onOpenCheatsheet: () => void;
  onOpenAdmin: () => void;
  onSelectCategory: (categorySlug: string | null) => void;
  onGoHome: () => void;
  currentView: string;
  bookmarksCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  isDarkMode,
  onToggleTheme,
  onOpenSearch,
  onOpenSeoModal,
  onOpenCheatsheet,
  onOpenAdmin,
  onSelectCategory,
  onGoHome,
  currentView,
  bookmarksCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F9F8F4]/95 dark:bg-[#141412]/95 border-b border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 transition-colors">
      {/* Top Gazette Eyebrow Banner */}
      <div className="border-b border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 py-1.5 px-4 sm:px-8 text-[10px] font-mono uppercase tracking-[0.25em] flex justify-between items-center text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#C45E3D] dark:text-[#E07353]">Vol. IV — Issue 2026</span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="hidden sm:inline">Enterprise NestJS Engineering Journal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="hidden md:inline">Index Engine:</span> 100% SEO Ready
          </span>
        </div>
      </div>

      {/* Main Masthead Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        {/* Brand Masthead */}
        <div
          id="brand-logo"
          onClick={onGoHome}
          className="flex flex-col cursor-pointer group select-none"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 mb-0.5">
            Developer Chronicles
          </span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl sm:text-4xl font-serif italic font-light tracking-tight text-[#1A1A1A] dark:text-[#F5F3ED] group-hover:text-[#C45E3D] dark:group-hover:text-[#E07353] transition-colors">
              Nest.Journal
            </h1>
            <span className="text-xs font-mono font-bold text-[#C45E3D] dark:text-[#E07353]">
              /hub
            </span>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex flex-wrap items-center gap-5 sm:gap-7 text-[11px] uppercase tracking-widest font-semibold pb-1">
          <button
            id="nav-articles"
            onClick={onGoHome}
            className={`pb-1 transition-all flex items-center gap-1.5 ${
              currentView === 'home'
                ? 'border-b-2 border-[#1A1A1A] dark:border-[#E8E6DF] text-[#1A1A1A] dark:text-[#F5F3ED] font-bold'
                : 'text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED]'
            }`}
          >
            <span>Articles</span>
          </button>

          <button
            id="nav-cheatsheet"
            onClick={onOpenCheatsheet}
            className={`pb-1 transition-all flex items-center gap-1.5 ${
              currentView === 'cheatsheet'
                ? 'border-b-2 border-[#1A1A1A] dark:border-[#E8E6DF] text-[#1A1A1A] dark:text-[#F5F3ED] font-bold'
                : 'text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED]'
            }`}
          >
            <span>Architecture Guide</span>
          </button>

          <button
            id="nav-seotools"
            onClick={onOpenSeoModal}
            className="pb-1 text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED] transition-all flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-[#C45E3D] dark:text-[#E07353]" />
            <span>SEO & Syndication</span>
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15">
            {/* Quick Search */}
            <button
              id="header-search-btn"
              onClick={onOpenSearch}
              className="p-1.5 rounded text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED] hover:bg-[#E8E6DF]/50 dark:hover:bg-[#242420] transition-all flex items-center gap-1.5 text-xs font-mono"
              title="Search articles"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline uppercase text-[10px] tracking-wider">Search</span>
            </button>

            {/* Dark Mode */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-1.5 rounded text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED] hover:bg-[#E8E6DF]/50 dark:hover:bg-[#242420] transition-colors"
              title={isDarkMode ? 'Light Paper Theme' : 'Dark Ink Theme'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-[#1A1A1A]" />}
            </button>

            {/* Admin Switch */}
            <button
              id="header-admin-btn"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] dark:bg-[#F5F3ED] text-[#F5F3ED] dark:text-[#1A1A1A] text-[10px] uppercase font-bold tracking-wider hover:opacity-90 transition-all shadow-sm"
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Admin Console</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
