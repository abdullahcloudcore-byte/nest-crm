import React, { useState } from 'react';
import { X, Globe, Rss, FileText, Copy, Check, Download, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { Post, Category, SiteSettings } from '../../types';
import { generateSitemapXml, generateRssXml } from '../../utils/seoUtils';

interface SeoToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
}

export const SeoToolsModal: React.FC<SeoToolsModalProps> = ({
  isOpen,
  onClose,
  posts,
  categories,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'rss' | 'robots' | 'serp'>('sitemap');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sitemapXml = generateSitemapXml(posts, categories, settings.siteUrl);
  const rssXml = generateRssXml(posts, settings);
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${settings.siteUrl}/sitemap.xml`;

  const getContent = () => {
    switch (activeTab) {
      case 'sitemap':
        return sitemapXml;
      case 'rss':
        return rssXml;
      case 'robots':
        return robotsTxt;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'sitemap' ? 'sitemap.xml' : activeTab === 'rss' ? 'rss.xml' : 'robots.txt';
    const blob = new Blob([getContent()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                SEO & Distribution Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect auto-generated Sitemaps, RSS 2.0 syndication, Robots.txt & SERP previews
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sitemap'
                ? 'border-[#E0234E] text-[#E0234E]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>sitemap.xml</span>
          </button>

          <button
            onClick={() => setActiveTab('rss')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rss'
                ? 'border-[#E0234E] text-[#E0234E]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Rss className="w-4 h-4 text-amber-500" />
            <span>rss.xml Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('robots')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'robots'
                ? 'border-[#E0234E] text-[#E0234E]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>robots.txt</span>
          </button>

          <button
            onClick={() => setActiveTab('serp')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'serp'
                ? 'border-[#E0234E] text-[#E0234E]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>SERP & Social Preview</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'serp' ? (
            <div className="space-y-6">
              {/* Google Search Result Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Google Search Engine Results Page (SERP) Preview
                </h4>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="w-4 h-4 rounded-full bg-[#E0234E] flex items-center justify-center text-[9px] font-bold text-white">
                      N
                    </div>
                    <span>{settings.siteUrl}</span>
                  </div>
                  <h3 className="text-blue-600 dark:text-blue-400 font-medium text-base hover:underline cursor-pointer">
                    {settings.siteName} - {settings.tagline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {settings.description}
                  </p>
                </div>
              </div>

              {/* Social OpenGraph Preview Card */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Social OpenGraph (Twitter / LinkedIn) Card
                </h4>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 text-white max-w-md shadow-lg">
                  <img
                    src={settings.defaultOgImage}
                    alt="Social Preview"
                    className="w-full aspect-[16/9] object-cover"
                  />
                  <div className="p-4 space-y-1 bg-slate-900">
                    <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
                      {new URL(settings.siteUrl).hostname}
                    </div>
                    <div className="font-bold text-sm text-white">{settings.siteName}</div>
                    <div className="text-xs text-slate-400 line-clamp-2">{settings.description}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>Direct Endpoint: {activeTab === 'sitemap' ? '/sitemap.xml' : activeTab === 'rss' ? '/rss.xml' : '/robots.txt'}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E0234E] text-white hover:bg-rose-600 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-300 text-xs font-mono overflow-x-auto max-h-96 border border-slate-800 leading-relaxed scrollbar-thin">
                {getContent()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
