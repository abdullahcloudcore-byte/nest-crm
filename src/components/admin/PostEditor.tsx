import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Save,
  ArrowLeft,
  Sparkles,
  Eye,
  Edit3,
  Globe,
  Tag,
  Folder,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Code,
  ShieldCheck,
  Check,
  RefreshCw,
  Bold,
  Italic,
  List,
  Quote,
  Layers,
} from 'lucide-react';
import { Post, Category, SEOAuditResult, Author } from '../../types';
import { auditPostSEO, generateSlug } from '../../utils/seoUtils';
import { api } from '../../services/api';

interface PostEditorProps {
  post: Post | null;
  categories: Category[];
  onSave: (postData: Partial<Post>) => Promise<void>;
  onCancel: () => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  categories,
  onSave,
  onCancel,
}) => {
  // Form State
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [categoryId, setCategoryId] = useState(post?.categoryId || categories[0]?.id || 'cat-arch');
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(', ') || 'NestJS, TypeScript, Architecture');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(post?.status || 'published');
  const [featured, setFeatured] = useState(post?.featured || false);
  const [coverImage, setCoverImage] = useState(
    post?.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80'
  );

  // SEO State
  const [metaTitle, setMetaTitle] = useState(post?.seo?.metaTitle || post?.title || '');
  const [metaDescription, setMetaDescription] = useState(post?.seo?.metaDescription || post?.excerpt || '');
  const [focusKeyword, setFocusKeyword] = useState(post?.seo?.focusKeyword || 'NestJS');

  // UI state
  const [editorTab, setEditorTab] = useState<'write' | 'preview' | 'seo'>('write');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [seoResult, setSeoResult] = useState<SEOAuditResult>(() =>
    auditPostSEO({
      title: post?.title || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      slug: post?.slug || '',
      coverImage: post?.coverImage || '',
      seo: {
        metaTitle: post?.seo?.metaTitle || '',
        metaDescription: post?.seo?.metaDescription || '',
        focusKeyword: post?.seo?.focusKeyword || 'NestJS',
        keywords: post?.tags || [],
      },
    })
  );

  // Update slug and meta title automatically when title changes if creating new
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!post) {
      setSlug(generateSlug(newTitle));
      setMetaTitle(newTitle);
    }
  };

  // Live SEO audit recalculation
  useEffect(() => {
    const result = auditPostSEO({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        focusKeyword,
        keywords: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      },
    });
    setSeoResult(result);
  }, [title, slug, excerpt, content, coverImage, metaTitle, metaDescription, focusKeyword, tagsInput]);

  // Insert code snippet template
  const insertTemplate = (snippet: string) => {
    setContent((prev) => prev + '\n\n' + snippet);
  };

  // AI SEO Generator
  const handleGenerateAiSeo = async () => {
    try {
      setIsGeneratingAi(true);
      const cat = categories.find((c) => c.id === categoryId);
      const res = await api.generateAiSEO({
        title,
        content,
        categoryName: cat?.name,
      });

      if (res.metaTitle) setMetaTitle(res.metaTitle);
      if (res.metaDescription) {
        setMetaDescription(res.metaDescription);
        if (!excerpt) setExcerpt(res.metaDescription);
      }
      if (res.focusKeyword) setFocusKeyword(res.focusKeyword);
      if (res.tags && Array.isArray(res.tags)) setTagsInput(res.tags.join(', '));
      if (res.suggestedSlug && !slug) setSlug(res.suggestedSlug);
    } catch (e) {
      console.error('AI SEO generation error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save handler
  const handleSavePost = async () => {
    if (!title.trim()) {
      alert('Please enter an article title.');
      return;
    }

    try {
      setIsSaving(true);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        title,
        slug: slug ? generateSlug(slug) : generateSlug(title),
        excerpt,
        content,
        categoryId,
        tags,
        status,
        featured,
        coverImage,
        seo: {
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          focusKeyword,
          keywords: tags,
          canonicalUrl: `https://nestjs-blog.dev/post/${slug || generateSlug(title)}`,
          ogImage: coverImage,
          ogType: 'article',
          score: seoResult.score,
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
              {post ? 'Edit Article & SEO Configuration' : 'Create New Technical Article'}
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`font-bold font-mono ${
                  seoResult.score >= 90
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : seoResult.score >= 75
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                SEO Score: {seoResult.score}/100
              </span>
              <span>•</span>
              <span className="text-slate-400 font-mono">{seoResult.wordCount} words</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Editor Mode Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setEditorTab('write')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                editorTab === 'write'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              onClick={() => setEditorTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                editorTab === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setEditorTab('seo')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                editorTab === 'seo'
                  ? 'bg-white dark:bg-slate-900 text-[#E0234E] font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#E0234E]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>SEO Audit ({seoResult.score})</span>
            </button>
          </div>

          <button
            onClick={handleSavePost}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#E0234E] hover:bg-rose-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      {editorTab === 'seo' ? (
        /* --- SEO AUDIT & METADATA TAB --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: SEO Fields & AI Generator */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI SEO Assistant Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>AI SEO Metadata Optimizer</span>
                </div>
                <p className="text-xs text-slate-300">
                  Auto-generate high CTR title, meta description, and keywords based on your draft content.
                </p>
              </div>

              <button
                onClick={handleGenerateAiSeo}
                disabled={isGeneratingAi}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E0234E] to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isGeneratingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isGeneratingAi ? 'Optimizing...' : 'Generate with AI'}</span>
              </button>
            </div>

            {/* SEO Form Controls */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
              {/* Focus Keyword */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Primary Focus Keyword *
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Density: {seoResult.keywordDensity.percentage}% ({seoResult.keywordDensity.count} matches)
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. NestJS Microservices Kafka"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E0234E]"
                />
              </div>

              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Meta Title (SERP Display)
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      metaTitle.length >= 40 && metaTitle.length <= 60
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {metaTitle.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Compelling title with keyword under 60 chars"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E0234E]"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Meta Description
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      metaDescription.length >= 130 && metaDescription.length <= 160
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {metaDescription.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Engaging summary with call to action and keyword under 160 chars"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E0234E] resize-none"
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Permalink Slug
                </label>
                <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-400">
                  <span>/post/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    className="flex-1 bg-transparent text-slate-900 dark:text-white focus:outline-none ml-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Google SERP Preview */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Google Search Results Preview
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                  <span>https://nestjs-blog.dev</span>
                  <span>&rsaquo;</span>
                  <span>post</span>
                  <span>&rsaquo;</span>
                  <span className="text-slate-700 dark:text-slate-300">{slug || 'article-slug'}</span>
                </div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold text-base">
                  {metaTitle || title || 'Your Article Title'}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {metaDescription || excerpt || 'Your article summary will show here in Google search engine result snippets.'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live SEO Checklist */}
          <div className="lg:col-span-5 space-y-6">
            {/* Score Card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Search Engine Score
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 font-mono text-emerald-400 font-bold">
                  {seoResult.passedCount} Passed
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-2xl text-emerald-400">
                  {seoResult.score}
                </div>
                <div>
                  <div className="text-base font-bold">
                    {seoResult.score >= 90 ? 'Search Ready 🚀' : seoResult.score >= 75 ? 'Good Optimization' : 'Needs Polish'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {seoResult.warningCount} recommendations, {seoResult.failCount} issues
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist items */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                SEO Audit Checklist
              </h4>

              <div className="space-y-3">
                {seoResult.checks.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {item.status === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {item.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        {item.status === 'fail' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                        <span>{item.title}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                          item.status === 'pass'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : item.status === 'warning'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{item.message}</p>
                    {item.recommendation && item.status !== 'pass' && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Tip: {item.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : editorTab === 'preview' ? (
        /* --- PREVIEW TAB --- */
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {title || 'Untitled Post'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">{excerpt}</p>
          </div>

          {coverImage && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-md">
              <img src={coverImage} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        /* --- WRITE TAB --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Writing Area (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Article Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Mastering NestJS Microservices with Kafka & Dead Letter Queues"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E0234E] shadow-sm"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Lead Excerpt / Summary
              </label>
              <textarea
                rows={2}
                placeholder="Short 1-2 sentence overview for cards and social shares..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E0234E] shadow-sm resize-none"
              />
            </div>

            {/* Content & Markdown Toolbar */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => insertTemplate('## 1. Introduction\n\nExplain the architecture context...')}
                    className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    + H2 Heading
                  </button>
                  <button
                    onClick={() => insertTemplate('```typescript\n// NestJS Code snippet\n```')}
                    className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-mono"
                  >
                    &lt;/&gt; Code Block
                  </button>
                  <button
                    onClick={() => insertTemplate('> **Best Practice**: Always encapsulate domain logic in pure services.')}
                    className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300"
                  >
                    " Quote / Callout
                  </button>
                </div>

                {/* Quick NestJS Code Inserters */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">NestJS Snippets:</span>
                  <button
                    onClick={() =>
                      insertTemplate(
                        `\`\`\`typescript\n@Controller('items')\nexport class ItemsController {\n  constructor(private readonly itemsService: ItemsService) {}\n\n  @Get()\n  async findAll() {\n    return this.itemsService.findAll();\n  }\n}\n\`\`\``
                      )
                    }
                    className="px-2 py-1 rounded text-[11px] bg-rose-50 dark:bg-rose-950/50 text-[#E0234E] hover:bg-rose-100 font-mono font-semibold"
                  >
                    + Controller
                  </button>
                  <button
                    onClick={() =>
                      insertTemplate(
                        `\`\`\`typescript\n@Injectable()\nexport class CustomGuard implements CanActivate {\n  canActivate(context: ExecutionContext): boolean {\n    const request = context.switchToHttp().getRequest();\n    return true;\n  }\n}\n\`\`\``
                      )
                    }
                    className="px-2 py-1 rounded text-[11px] bg-rose-50 dark:bg-rose-950/50 text-[#E0234E] hover:bg-rose-100 font-mono font-semibold"
                  >
                    + Guard
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                rows={18}
                placeholder="Write your NestJS guide in Markdown with code blocks, headings, and architectural patterns..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 bg-transparent text-sm sm:text-base font-mono text-slate-900 dark:text-slate-100 focus:outline-none resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Right Sidebar Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Publication State & Category */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Publishing Settings
              </h4>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Post Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="published">Published (Live on Site)</option>
                  <option value="draft">Draft (Admin Only)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Architecture Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Featured Article</div>
                  <div className="text-[11px] text-slate-400">Highlight on Hero Banner</div>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#E0234E] rounded border-slate-300 focus:ring-[#E0234E]"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="NestJS, Kafka, Microservices, Security"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Cover Image URL */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cover Image URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
              />
              {coverImage && (
                <div className="aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
