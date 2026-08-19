import React from 'react';
import {
  FileText,
  Layers,
  Eye,
  Heart,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Sparkles,
  Edit3,
  Trash2,
  Globe,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { Post, Category, BlogStats } from '../../types';
import { getCategoryIcon } from '../../utils/iconMap';

interface AdminDashboardProps {
  stats: BlogStats | null;
  posts: Post[];
  categories: Category[];
  onNavigateTab: (tab: string) => void;
  onEditPost: (post: Post) => void;
  onCreatePost: () => void;
  onDeletePost: (postId: string) => void;
  onViewPostFrontend: (post: Post) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  posts,
  categories,
  onNavigateTab,
  onEditPost,
  onCreatePost,
  onDeletePost,
  onViewPostFrontend,
}) => {
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const avgSeoScore = posts.length
    ? Math.round(posts.reduce((acc, p) => acc + (p.seo?.score || 80), 0) / posts.length)
    : 85;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-bold">
              CMS Engine Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            NestJS Blog & SEO Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage technical articles, categories, metadata, live audits, and syndication feeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreatePost}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E0234E] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Posts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Articles</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#E0234E]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{posts.length}</div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{publishedCount} Published</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{draftCount} Drafts</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Views */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Readers</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-500">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Organic Search Traffic</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg SEO Health Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg SEO Score</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {avgSeoScore}<span className="text-base font-normal text-slate-400">/100</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {avgSeoScore >= 90 ? 'Excellent Search Optimization' : 'Optimization Recommended'}
            </div>
          </div>
        </div>

        {/* Card 4: Categories */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{categories.length}</div>
            <div className="text-xs text-slate-500 mt-1">
              Structured Architecture Silos
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts Table with quick actions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Recent Articles & SEO Audits
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live index status, metadata scores, and instant editor controls
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('posts')}
            className="text-xs font-bold text-[#E0234E] hover:underline"
          >
            View All ({posts.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[11px] font-bold">
              <tr>
                <th className="pb-3 pr-4">Title & Slug</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">SEO Health</th>
                <th className="pb-3 px-4">Views</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {posts.slice(0, 5).map((post) => {
                const cat = categories.find((c) => c.id === post.categoryId);
                const score = post.seo?.score || 85;
                return (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {post.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                        /post/{post.slug}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {cat ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <span style={{ color: cat.color }}>{getCategoryIcon(cat.icon, 'w-3 h-3')}</span>
                          <span>{cat.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          post.status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-xs ${
                            score >= 90
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : score >= 75
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {score}/100
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              score >= 90 ? 'bg-emerald-500' : score >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {post.views}
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewPostFrontend(post)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View on site"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditPost(post)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#E0234E] hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Edit Post & SEO"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
