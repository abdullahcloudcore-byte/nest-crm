import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  ShieldCheck,
  Settings,
  Plus,
  ArrowLeft,
  Globe,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Post, Category, SiteSettings, BlogStats } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { PostList } from './PostList';
import { PostEditor } from './PostEditor';
import { CategoryManager } from './CategoryManager';
import { SeoAuditor } from './SeoAuditor';
import { SettingsManager } from './SettingsManager';

interface AdminLayoutProps {
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
  stats: BlogStats | null;
  onExitAdmin: () => void;
  onViewPostFrontend: (post: Post) => void;
  onSavePost: (postData: Partial<Post>) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onSaveCategory: (catData: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  posts,
  categories,
  settings,
  stats,
  onExitAdmin,
  onViewPostFrontend,
  onSavePost,
  onDeletePost,
  onSaveCategory,
  onDeleteCategory,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'editor' | 'categories' | 'seo' | 'settings'>('dashboard');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handleCreatePost = () => {
    setEditingPost(null);
    setActiveTab('editor');
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setActiveTab('editor');
  };

  const handlePostSaveComplete = async (postData: Partial<Post>) => {
    if (editingPost) {
      postData.id = editingPost.id;
    }
    await onSavePost(postData);
    setActiveTab('posts');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#141412] text-[#1A1A1A] dark:text-[#F5F3ED] flex flex-col font-sans transition-colors">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F9F8F4]/95 dark:bg-[#141412]/95 backdrop-blur-md border-b border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onExitAdmin}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 hover:border-[#1A1A1A] dark:hover:border-[#E8E6DF] text-xs font-mono uppercase font-bold text-[#1A1A1A] dark:text-[#F5F3ED] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Journal</span>
            </button>

            <div className="h-5 w-px bg-[#1A1A1A]/15 dark:bg-[#E8E6DF]/15" />

            <div className="flex items-center gap-2">
              <div>
                <span className="font-serif italic font-medium text-lg text-[#1A1A1A] dark:text-[#F5F3ED]">
                  Nest.Journal Desk
                </span>
                <span className="ml-2 text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A] font-bold">
                  CMS
                </span>
              </div>
            </div>
          </div>

          {/* Tab Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-mono uppercase tracking-wider font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-[#1A1A1A] dark:border-[#F5F3ED] text-[#1A1A1A] dark:text-[#F5F3ED] font-bold'
                  : 'border-transparent text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-2 transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'posts' || activeTab === 'editor'
                  ? 'border-[#1A1A1A] dark:border-[#F5F3ED] text-[#1A1A1A] dark:text-[#F5F3ED] font-bold'
                  : 'border-transparent text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Articles ({posts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-2 transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'categories'
                  ? 'border-[#1A1A1A] dark:border-[#F5F3ED] text-[#1A1A1A] dark:text-[#F5F3ED] font-bold'
                  : 'border-transparent text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`px-3 py-2 transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'seo'
                  ? 'border-[#C45E3D] dark:border-[#E07353] text-[#C45E3D] dark:text-[#E07353] font-bold'
                  : 'border-transparent text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SEO Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 transition-all flex items-center gap-1.5 border-b-2 ${
                activeTab === 'settings'
                  ? 'border-[#1A1A1A] dark:border-[#F5F3ED] text-[#1A1A1A] dark:text-[#F5F3ED] font-bold'
                  : 'border-transparent text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60 hover:text-[#1A1A1A] dark:hover:text-[#F5F3ED]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Quick Write Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreatePost}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] dark:bg-[#F5F3ED] text-[#F5F3ED] dark:text-[#1A1A1A] text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#C45E3D] dark:hover:bg-[#E07353] dark:hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Draft Article</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 border-t border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 overflow-x-auto scrollbar-none text-xs font-mono uppercase">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 ${activeTab === 'dashboard' ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A]' : 'opacity-60'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-2.5 py-1 ${activeTab === 'posts' ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A]' : 'opacity-60'}`}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-2.5 py-1 ${activeTab === 'categories' ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A]' : 'opacity-60'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-2.5 py-1 ${activeTab === 'seo' ? 'bg-[#C45E3D] text-white' : 'text-emerald-600'}`}
          >
            SEO
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1 ${activeTab === 'settings' ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A]' : 'opacity-60'}`}
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main Admin Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            stats={stats}
            posts={posts}
            categories={categories}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onEditPost={handleEditPost}
            onCreatePost={handleCreatePost}
            onDeletePost={onDeletePost}
            onViewPostFrontend={onViewPostFrontend}
          />
        )}

        {activeTab === 'posts' && (
          <PostList
            posts={posts}
            categories={categories}
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
            onDeletePost={onDeletePost}
            onViewPostFrontend={onViewPostFrontend}
          />
        )}

        {activeTab === 'editor' && (
          <PostEditor
            post={editingPost}
            categories={categories}
            onSave={handlePostSaveComplete}
            onCancel={() => setActiveTab('posts')}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            onSaveCategory={onSaveCategory}
            onDeleteCategory={onDeleteCategory}
          />
        )}

        {activeTab === 'seo' && (
          <SeoAuditor
            posts={posts}
            categories={categories}
            settings={settings}
            onEditPost={handleEditPost}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            settings={settings}
            onSaveSettings={onSaveSettings}
          />
        )}
      </main>
    </div>
  );
};
