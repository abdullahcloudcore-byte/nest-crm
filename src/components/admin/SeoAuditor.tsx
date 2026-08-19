import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  ArrowUpRight,
  RefreshCw,
  Globe,
  FileCode,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { Post, Category, SiteSettings } from '../../types';
import { auditPostSEO } from '../../utils/seoUtils';

interface SeoAuditorProps {
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
  onEditPost: (post: Post) => void;
}

export const SeoAuditor: React.FC<SeoAuditorProps> = ({
  posts,
  categories,
  settings,
  onEditPost,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs-work' | 'excellent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute all audits
  const auditedPosts = posts.map((post) => {
    const audit = auditPostSEO({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      seo: {
        metaTitle: post.seo?.metaTitle || post.title,
        metaDescription: post.seo?.metaDescription || post.excerpt,
        focusKeyword: post.seo?.focusKeyword || 'NestJS',
        keywords: post.tags || [],
      },
    });

    return {
      post,
      audit,
    };
  });

  const avgScore = posts.length
    ? Math.round(auditedPosts.reduce((acc, p) => acc + p.audit.score, 0) / posts.length)
    : 85;

  const excellentCount = auditedPosts.filter((p) => p.audit.score >= 90).length;
  const warningCount = auditedPosts.filter((p) => p.audit.score >= 70 && p.audit.score < 90).length;
  const criticalCount = auditedPosts.filter((p) => p.audit.score < 70).length;

  const filteredList = auditedPosts.filter(({ post, audit }) => {
    if (filterStatus === 'excellent' && audit.score < 90) return false;
    if (filterStatus === 'needs-work' && audit.score >= 90) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return post.title.toLowerCase().includes(q) || post.slug.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 text-white border border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Search Engine Health Audit Scanner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Site-Wide Technical & On-Page SEO Health
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time automated auditing of keyword densities, meta length limits, OpenGraph imagery, heading hierarchies, and crawlability.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-2xl text-emerald-400">
            {avgScore}
          </div>
          <div>
            <div className="text-sm font-bold text-white">Overall Index Score</div>
            <div className="text-xs text-slate-400">{posts.length} audited articles</div>
          </div>
        </div>
      </div>

      {/* SEO Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => setFilterStatus('excellent')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'excellent'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">High Ranking (90-100)</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {excellentCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Fully optimized for Google & social SERPs</div>
        </div>

        <div
          onClick={() => setFilterStatus('needs-work')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'needs-work'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Optimization Advice (70-89)</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {warningCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Minor meta title or content depth polish recommended</div>
        </div>

        <div
          onClick={() => setFilterStatus('all')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'all'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-[#E0234E] shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between text-[#E0234E]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Indexed Posts</span>
            <Globe className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {posts.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Included in XML Sitemap & RSS 2.0</div>
        </div>
      </div>

      {/* Audit Scanner Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Individual Post SEO Diagnostics
          </h3>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredList.map(({ post, audit }) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-rose-300 dark:hover:border-rose-900/60 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        audit.score >= 90
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : audit.score >= 75
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      Score: {audit.score}/100
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Keyword: <strong className="text-slate-700 dark:text-slate-200">{post.seo?.focusKeyword || 'NestJS'}</strong> ({audit.keywordDensity.count} matches, {audit.keywordDensity.percentage}%)
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{post.title}</h4>
                </div>

                <button
                  onClick={() => onEditPost(post)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#E0234E] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <span>Edit in SEO Panel</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#E0234E]" />
                </button>
              </div>

              {/* Checks Pill Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                {audit.checks.slice(0, 4).map((chk) => (
                  <div
                    key={chk.id}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center gap-2"
                  >
                    {chk.status === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    {chk.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    {chk.status === 'fail' && <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
                    <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{chk.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
