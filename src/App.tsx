import React, { useState, useEffect, useMemo } from 'react';
import { Post, Category, SiteSettings, BlogStats } from './types';
import { api } from './services/api';
import { initialPosts, initialCategories, initialSettings } from './data/initialData';

// Frontend Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/frontend/HeroBanner';
import { CategoryBar } from './components/frontend/CategoryBar';
import { PostCard } from './components/frontend/PostCard';
import { PostReader } from './components/frontend/PostReader';
import { CategoryView } from './components/frontend/CategoryView';
import { SearchModal } from './components/frontend/SearchModal';
import { SeoToolsModal } from './components/frontend/SeoToolsModal';
import { NestCheatsheet } from './components/frontend/NestCheatsheet';

// Admin Component
import { AdminLayout } from './components/admin/AdminLayout';

import { BookOpen, Bookmark, X } from 'lucide-react';

export default function App() {
  // Global State
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  // Navigation View State
  const [currentView, setCurrentView] = useState<'home' | 'post' | 'category' | 'cheatsheet' | 'admin'>('home');
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nestjs_blog_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);

  // Sync theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load initial data from API (or fallback to seed)
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedPosts, fetchedCats, fetchedSettings, fetchedStats] = await Promise.allSettled([
        api.getPosts(),
        api.getCategories(),
        api.getSettings(),
        api.getStats(),
      ]);

      if (fetchedPosts.status === 'fulfilled' && fetchedPosts.value?.length) {
        setPosts(fetchedPosts.value);
      }
      if (fetchedCats.status === 'fulfilled' && fetchedCats.value?.length) {
        setCategories(fetchedCats.value);
      }
      if (fetchedSettings.status === 'fulfilled' && fetchedSettings.value) {
        setSettings(fetchedSettings.value);
      }
      if (fetchedStats.status === 'fulfilled' && fetchedStats.value) {
        setStats(fetchedStats.value);
      }
    } catch (e) {
      console.warn('Using local fallback seed data', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (postId: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId];
      localStorage.setItem('nestjs_blog_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  // Handlers for Navigation
  const handleSelectPost = (post: Post) => {
    setActivePost(post);
    setCurrentView('post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categorySlug: string | null) => {
    setActiveCategorySlug(categorySlug);
    setActiveTag(null);
    if (categorySlug) {
      setCurrentView('category');
    } else {
      setCurrentView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTag = (tag: string) => {
    setActiveTag(tag);
    setActiveCategorySlug(null);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CRUD Handlers for Admin
  const handleSavePost = async (postData: Partial<Post>) => {
    const isNew = !postData.id;
    let saved: Post;
    if (isNew) {
      saved = await api.createPost(postData);
      setPosts((prev) => [saved, ...prev]);
    } else {
      saved = await api.updatePost(postData.id!, postData);
      setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    }
    // Refresh stats
    api.getStats().then(setStats).catch(() => {});
  };

  const handleDeletePost = async (postId: string) => {
    await api.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    api.getStats().then(setStats).catch(() => {});
  };

  const handleSaveCategory = async (catData: Partial<Category>) => {
    const isNew = !catData.id;
    let saved: Category;
    if (isNew) {
      saved = await api.createCategory(catData);
      setCategories((prev) => [...prev, saved]);
    } else {
      saved = await api.updateCategory(catData.id!, catData);
      setCategories((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    await api.deleteCategory(catId);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  const handleSaveSettings = async (newSettings: SiteSettings) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
  };

  // Filtered Posts for Home View
  const publishedPosts = useMemo(() => {
    return posts.filter((p) => p.status === 'published');
  }, [posts]);

  const featuredPost = useMemo(() => {
    return publishedPosts.find((p) => p.featured) || publishedPosts[0];
  }, [publishedPosts]);

  const displayedPosts = useMemo(() => {
    return publishedPosts.filter((p) => {
      if (onlyBookmarks && !bookmarkedIds.includes(p.id)) return false;
      if (activeCategorySlug) {
        const cat = categories.find((c) => c.slug === activeCategorySlug);
        if (cat && p.categoryId !== cat.id) return false;
      }
      if (activeTag && !p.tags.includes(activeTag)) return false;
      return true;
    });
  }, [publishedPosts, activeCategorySlug, activeTag, onlyBookmarks, bookmarkedIds, categories]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.slug === activeCategorySlug);
  }, [categories, activeCategorySlug]);

  // If in Admin Mode, render the full CMS layout
  if (currentView === 'admin') {
    return (
      <AdminLayout
        posts={posts}
        categories={categories}
        settings={settings}
        stats={stats}
        onExitAdmin={() => setCurrentView('home')}
        onViewPostFrontend={(post) => {
          setActivePost(post);
          setCurrentView('post');
        }}
        onSavePost={handleSavePost}
        onDeletePost={handleDeletePost}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onSaveSettings={handleSaveSettings}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F4] dark:bg-[#141412] text-[#1A1A1A] dark:text-[#F5F3ED] font-sans transition-colors duration-200">
      {/* Header Bar */}
      <Header
        categories={categories}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSeoModal={() => setIsSeoModalOpen(true)}
        onOpenCheatsheet={() => {
          setCurrentView('cheatsheet');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setCurrentView('admin')}
        onSelectCategory={handleSelectCategory}
        onGoHome={() => {
          setActiveCategorySlug(null);
          setActiveTag(null);
          setOnlyBookmarks(false);
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentView={currentView}
        bookmarksCount={bookmarkedIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* POST READER VIEW */}
        {currentView === 'post' && activePost && (
          <PostReader
            post={activePost}
            category={categories.find((c) => c.id === activePost.categoryId)}
            categories={categories}
            allPosts={posts}
            settings={settings}
            isBookmarked={bookmarkedIds.includes(activePost.id)}
            onToggleBookmark={handleToggleBookmark}
            onSelectPost={handleSelectPost}
            onSelectCategory={handleSelectCategory}
            onSelectTag={handleSelectTag}
            onBack={() => setCurrentView('home')}
          />
        )}

        {/* CATEGORY VIEW */}
        {currentView === 'category' && activeCategory && (
          <CategoryView
            category={activeCategory}
            posts={posts}
            categories={categories}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectPost={handleSelectPost}
            onSelectCategory={handleSelectCategory}
            onSelectTag={handleSelectTag}
            onBack={() => {
              setActiveCategorySlug(null);
              setCurrentView('home');
            }}
          />
        )}

        {/* CHEATSHEET VIEW */}
        {currentView === 'cheatsheet' && <NestCheatsheet />}

        {/* HOME FEED VIEW */}
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
            {/* Hero Featured Article Banner (if no active tag or category filter) */}
            {!activeTag && !activeCategorySlug && !onlyBookmarks && featuredPost && (
              <HeroBanner
                post={featuredPost}
                category={categories.find((c) => c.id === featuredPost.categoryId)}
                onSelectPost={handleSelectPost}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {/* Architecture Topics Bar */}
            <CategoryBar
              categories={categories}
              selectedCategorySlug={activeCategorySlug}
              onSelectCategory={handleSelectCategory}
              totalPostsCount={publishedPosts.length}
            />

            {/* Active Filters Bar / Bookmark Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A] dark:text-[#F5F3ED] tracking-tight">
                  {onlyBookmarks
                    ? 'Saved Articles'
                    : activeTag
                    ? `Dispatches Tagged #${activeTag}`
                    : activeCategorySlug
                    ? `${categories.find((c) => c.slug === activeCategorySlug)?.name} Publications`
                    : 'Recent Architectural Dispatches'}
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#E8E6DF] dark:bg-[#242420] text-[#1A1A1A] dark:text-[#F5F3ED]">
                  {displayedPosts.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Bookmarks Toggle */}
                <button
                  onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold border transition-all ${
                    onlyBookmarks
                      ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A] border-[#1A1A1A]'
                      : 'bg-transparent border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 hover:border-[#1A1A1A]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmarks ({bookmarkedIds.length})</span>
                </button>

                {/* Clear Tag button */}
                {activeTag && (
                  <button
                    onClick={() => setActiveTag(null)}
                    className="inline-flex items-center gap-1 text-xs font-mono uppercase font-bold text-[#C45E3D] dark:text-[#E07353] hover:underline"
                  >
                    <span>Clear #{activeTag}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Posts Grid */}
            {displayedPosts.length === 0 ? (
              <div className="text-center py-20 border border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 bg-[#FFFFFF] dark:bg-[#1C1C19] space-y-4">
                <BookOpen className="w-10 h-10 text-[#7E7C76] mx-auto opacity-40" />
                <div className="space-y-1">
                  <h3 className="font-serif text-xl text-[#1A1A1A] dark:text-[#F5F3ED]">
                    No publications found
                  </h3>
                  <p className="text-xs font-mono text-[#7E7C76] uppercase max-w-sm mx-auto">
                    {onlyBookmarks
                      ? "No bookmarked articles saved. Click the bookmark icon on any dispatch to save it."
                      : 'No articles match your current topic filter. Try selecting another topic.'}
                  </p>
                </div>
                {onlyBookmarks && (
                  <button
                    onClick={() => setOnlyBookmarks(false)}
                    className="px-4 py-2 bg-[#1A1A1A] dark:bg-[#F5F3ED] text-[#F5F3ED] dark:text-[#1A1A1A] text-xs font-mono uppercase font-bold"
                  >
                    View All Dispatches
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    category={categories.find((c) => c.id === post.categoryId)}
                    isBookmarked={bookmarkedIds.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelectPost={handleSelectPost}
                    onSelectCategory={handleSelectCategory}
                    onSelectTag={handleSelectTag}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        categories={categories}
        settings={settings}
        onSelectCategory={handleSelectCategory}
        onOpenSeoModal={() => setIsSeoModalOpen(true)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={publishedPosts}
        categories={categories}
        onSelectPost={handleSelectPost}
        onSelectCategory={handleSelectCategory}
      />

      {/* SEO Tools & Feeds Inspector Modal */}
      <SeoToolsModal
        isOpen={isSeoModalOpen}
        onClose={() => setIsSeoModalOpen(false)}
        posts={publishedPosts}
        categories={categories}
        settings={settings}
      />
    </div>
  );
}
