import React from 'react';
import { Rss, Globe, Github, Twitter, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Category, SiteSettings } from '../types';

interface FooterProps {
  categories: Category[];
  settings?: SiteSettings;
  onSelectCategory?: (categorySlug: string) => void;
  onNavigate?: (view: string, param?: string) => void;
  onOpenSeoModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  settings,
  onSelectCategory,
  onNavigate,
  onOpenSeoModal,
}) => {
  const handleCatClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    } else if (onNavigate) {
      onNavigate('category', slug);
    }
  };

  return (
    <footer className="w-full bg-[#1A1A1A] text-[#F5F3ED] border-t-2 border-[#1A1A1A] dark:border-[#E8E6DF]/20 transition-colors mt-16">
      {/* Top Editorial Index Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-10 border-b border-[#2A2A26]">
          {/* Col 1 & 2: Brand & Gazette Note */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#E07353] font-bold">
                Developer Chronicles
              </span>
              <h2 className="text-3xl font-serif italic font-light tracking-tight text-[#F5F3ED]">
                Nest.Journal
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#B5B3AC] leading-relaxed max-w-sm font-sans">
              {settings?.description ||
                'High-performance architectural patterns, dependency injection deep dives, microservices, and security blueprints for enterprise NestJS engineering teams.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings?.githubUrl || 'https://github.com/nestjs/nest'}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-[#2A2A26] hover:bg-[#3A3A34] text-[#F5F3ED] transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com/nestframework"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-[#2A2A26] hover:bg-[#3A3A34] text-[#F5F3ED] transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onOpenSeoModal}
                className="p-2 bg-[#2A2A26] hover:bg-[#3A3A34] text-emerald-400 transition-colors"
                title="Sitemap & SEO Diagnostics"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-[#2A2A26] hover:bg-[#3A3A34] text-[#E07353] transition-colors"
                title="RSS Feed"
              >
                <Rss className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-mono tracking-[0.25em] font-bold text-[#E07353]">
              Categories
            </h4>
            <ul className="space-y-2 font-serif text-sm">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCatClick(cat.slug)}
                    className="text-[#B5B3AC] hover:text-[#F5F3ED] hover:italic transition-colors flex items-center justify-between w-full text-left"
                  >
                    <span>{cat.name}</span>
                    {typeof cat.postCount === 'number' && (
                      <span className="font-mono text-[10px] opacity-40">({cat.postCount})</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Architecture & Resources */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-mono tracking-[0.25em] font-bold text-[#E07353]">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <button
                  onClick={onOpenSeoModal}
                  className="text-[#B5B3AC] hover:text-[#F5F3ED] transition-colors flex items-center gap-1 uppercase"
                >
                  <span>Sitemap & Schema Tester</span>
                </button>
              </li>
              <li>
                <a
                  href="https://docs.nestjs.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#B5B3AC] hover:text-[#F5F3ED] transition-colors flex items-center gap-1 uppercase"
                >
                  <span>Official Docs</span>
                  <ArrowUpRight className="w-3 h-3 text-[#7E7C76]" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/nestjs/nest"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#B5B3AC] hover:text-[#F5F3ED] transition-colors flex items-center gap-1 uppercase"
                >
                  <span>Nest Source Engine</span>
                  <ArrowUpRight className="w-3 h-3 text-[#7E7C76]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Syndication & Open Feeds */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-mono tracking-[0.25em] font-bold text-[#E07353]">
              Syndication
            </h4>
            <p className="text-xs text-[#B5B3AC] leading-relaxed font-sans">
              Auto-generated XML sitemaps, JSON-LD Schema.org TechArticle tags, and RSS feeds.
            </p>
            <div className="pt-2 flex flex-col gap-2 font-mono text-xs">
              <a
                href="/sitemap.xml"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2A26] hover:bg-[#3A3A34] text-[#F5F3ED] transition-colors"
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>/sitemap.xml</span>
              </a>
              <a
                href="/rss.xml"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2A26] hover:bg-[#3A3A34] text-[#F5F3ED] transition-colors"
              >
                <Rss className="w-3 h-3 text-[#E07353]" />
                <span>/rss.xml</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Gazette Footer matching Design HTML */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-widest font-mono font-bold text-[#7E7C76]">
          <span>© {new Date().getFullYear()} Nest.Journal Engineering</span>
          <span>Powered by NestJS Framework</span>
          <span className="text-emerald-400">SEO Score: 98/100</span>
        </div>
      </div>
    </footer>
  );
};
