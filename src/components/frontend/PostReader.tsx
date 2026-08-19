import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import {
  Clock,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Calendar,
  User,
  ArrowLeft,
  Check,
  Copy,
  MessageSquare,
  Globe,
  Sparkles,
  ShieldCheck,
  Send,
  Twitter,
  Linkedin,
  Code,
  Tag,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Post, Category, Comment, SiteSettings } from '../../types';
import { getCategoryIcon } from '../../utils/iconMap';
import { generateJsonLdSchema } from '../../utils/seoUtils';
import { api } from '../../services/api';

interface PostReaderProps {
  post: Post;
  category?: Category;
  categories: Category[];
  allPosts: Post[];
  settings: SiteSettings;
  isBookmarked: boolean;
  onToggleBookmark: (postId: string) => void;
  onSelectPost: (post: Post) => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectTag: (tag: string) => void;
  onBack: () => void;
}

export const PostReader: React.FC<PostReaderProps> = ({
  post,
  category,
  categories,
  allPosts,
  settings,
  isBookmarked,
  onToggleBookmark,
  onSelectPost,
  onSelectCategory,
  onSelectTag,
  onBack,
}) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showSeoMetaInspector, setShowSeoMetaInspector] = useState(false);

  // New comment form state
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentEmail, setNewCommentEmail] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Update dynamic document title & meta tags simulation
  useEffect(() => {
    document.title = `${post.seo?.metaTitle || post.title} | ${settings.siteName}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const data = await api.getComments(post.id);
      setComments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Extract Table of Contents from markdown headers (# and ##)
  const toc = useMemo(() => {
    const lines = post.content.split('\n');
    const items: { id: string; text: string; level: number }[] = [];
    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);
      if (h2Match) {
        const text = h2Match[1].trim();
        items.push({
          id: text.toLowerCase().replace(/[^\w]+/g, '-'),
          text,
          level: 2,
        });
      } else if (h3Match) {
        const text = h3Match[1].trim();
        items.push({
          id: text.toLowerCase().replace(/[^\w]+/g, '-'),
          text,
          level: 3,
        });
      }
    });
    return items;
  }, [post.content]);

  // Handle Like
  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const res = await api.likePost(post.id);
      setLikes(res.likes);
      setHasLiked(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      setLikes((l) => l + 1);
      setHasLiked(true);
    }
  };

  // Handle Comment Submit
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const created = await api.addComment({
        postId: post.id,
        authorName: newCommentName.trim(),
        authorEmail: newCommentEmail.trim(),
        content: newCommentText.trim(),
      });
      setComments((prev) => [...prev, created]);
      setNewCommentText('');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.9 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Copy Code Snippet
  const copyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Copy Link
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  // Related posts in same category
  const relatedPosts = useMemo(() => {
    return allPosts
      .filter((p) => p.id !== post.id && p.status === 'published' && p.categoryId === post.categoryId)
      .slice(0, 3);
  }, [allPosts, post]);

  const jsonLdSchema = useMemo(() => {
    return JSON.stringify(generateJsonLdSchema(post, settings.siteUrl), null, 2);
  }, [post, settings]);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Back button & SEO Meta Drawer trigger */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-bold text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 hover:text-[#C45E3D] dark:hover:text-[#E07353] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Return to Journal</span>
        </button>

        <button
          id="toggle-seo-meta-btn"
          onClick={() => setShowSeoMetaInspector(!showSeoMetaInspector)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-mono font-bold tracking-wider border transition-all ${
            showSeoMetaInspector
              ? 'bg-[#1A1A1A] text-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#1A1A1A] border-[#1A1A1A]'
              : 'bg-transparent text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 hover:border-[#1A1A1A]'
          }`}
        >
          <Globe className="w-3 h-3 text-[#C45E3D] dark:text-[#E07353]" />
          <span>Live SEO & Schema Inspector</span>
        </button>
      </div>

      {/* SEO & Structured Data live inspection panel */}
      {showSeoMetaInspector && (
        <div className="mb-10 p-6 bg-[#1A1A1A] text-[#F5F3ED] border border-[#1A1A1A] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#F5F3ED]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>SEO Audit Engine & Schema.org JSON-LD</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-[#2A2A26] text-emerald-400 border border-emerald-500/30">
              Score: {post.seo?.score || 94}/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#121210] p-4 border border-[#2A2A26] space-y-2">
              <div className="text-[10px] uppercase tracking-wider opacity-60">
                Google SERP Snippet Preview
              </div>
              <div className="text-[#C45E3D] font-bold text-sm">
                {post.seo?.metaTitle || post.title}
              </div>
              <div className="text-emerald-400 text-[11px]">
                {settings.siteUrl}/post/{post.slug}
              </div>
              <div className="text-[#E8E6DF]/80 text-xs">
                {post.seo?.metaDescription || post.excerpt}
              </div>
            </div>

            <div className="bg-[#121210] p-4 border border-[#2A2A26] space-y-1.5 text-xs">
              <div className="text-[10px] uppercase tracking-wider opacity-60">
                Target Keywords & Indexing
              </div>
              <div>Focus Keyword: <span className="text-[#C45E3D] font-bold">{post.seo?.focusKeyword || 'NestJS Architecture'}</span></div>
              <div>Robots: <span className="text-emerald-400">index, follow, max-snippet:-1</span></div>
              <div>Canonical: <span className="text-[#B5B3AC] truncate block">{post.seo?.canonicalUrl || `${settings.siteUrl}/post/${post.slug}`}</span></div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono opacity-60 mb-1">
              JSON-LD Structured Data (&lt;script type="application/ld+json"&gt;)
            </div>
            <pre className="bg-[#121210] p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-36 scrollbar-thin border border-[#2A2A26]">
              {jsonLdSchema}
            </pre>
          </div>
        </div>
      )}

      {/* Article Header */}
      <header className="space-y-6 mb-10 pb-8 border-b border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-wider">
          {category && (
            <button
              onClick={() => onSelectCategory(category.slug)}
              className="bg-[#E8E6DF] dark:bg-[#242420] text-[#1A1A1A] dark:text-[#F5F3ED] px-2.5 py-1 font-bold hover:bg-[#C45E3D] hover:text-white transition-colors"
            >
              {category.name}
            </button>
          )}

          <span className="text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60">
            {formattedDate}
          </span>
          <span className="text-[#1A1A1A]/40 dark:text-[#E8E6DF]/40">•</span>
          <span className="text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60">
            {post.readingTimeMinutes} MIN READ
          </span>
          <span className="text-[#1A1A1A]/40 dark:text-[#E8E6DF]/40">•</span>
          <span className="text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60">
            {post.views} READS
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] dark:text-[#F5F3ED] leading-[1.05]">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl font-serif italic text-[#1A1A1A]/80 dark:text-[#E8E6DF]/80 leading-relaxed max-w-3xl">
          {post.excerpt}
        </p>

        {/* Author Bio Bar & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10">
          <div className="flex items-center gap-3 py-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover grayscale contrast-125 border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20"
            />
            <div>
              <div className="font-serif italic font-bold text-base text-[#1A1A1A] dark:text-[#F5F3ED]">
                {post.author.name}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/60 dark:text-[#E8E6DF]/60">
                {post.author.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            {/* Like button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase font-bold border transition-all ${
                hasLiked
                  ? 'bg-[#C45E3D] text-white border-[#C45E3D]'
                  : 'bg-transparent border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 text-[#1A1A1A] dark:text-[#F5F3ED] hover:border-[#1A1A1A]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{likes} Endorsements</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(post.id)}
              className={`p-2 border transition-all ${
                isBookmarked
                  ? 'bg-[#1A1A1A] text-white dark:bg-[#F5F3ED] dark:text-[#1A1A1A] border-[#1A1A1A]'
                  : 'bg-transparent border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 text-[#1A1A1A] dark:text-[#F5F3ED] hover:border-[#1A1A1A]'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share Link */}
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 text-[#1A1A1A] dark:text-[#F5F3ED] hover:border-[#1A1A1A] transition-colors"
              title="Copy share link"
            >
              {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShareLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid: Sidebar Table of Contents + Article Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Main Markdown Article Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Featured Cover Image Frame */}
          {post.coverImage && (
            <div className="border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 p-2 bg-[#FFFFFF] dark:bg-[#1C1C19]">
              <div className="aspect-[16/9] overflow-hidden bg-[#E8E6DF] dark:bg-[#242420]">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover filter saturate-90"
                />
              </div>
            </div>
          )}

          {/* Markdown Renderer */}
          <div className="text-[#1A1A1A] dark:text-[#F5F3ED] leading-relaxed font-sans space-y-6">
            <ReactMarkdown
              components={{
                p({ children }) {
                  return <p className="text-base sm:text-lg leading-relaxed text-[#1A1A1A]/90 dark:text-[#E8E6DF]/90 mb-6">{children}</p>;
                },
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const snippetId = `code-${Math.random().toString(36).substr(2, 6)}`;

                  if (!inline) {
                    return (
                      <div className="my-8 border border-[#1A1A1A] dark:border-[#3A3A34] bg-[#121210] text-[#F5F3ED] overflow-hidden">
                        {/* Snippet Header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A1A] border-b border-[#2A2A26] text-[11px] font-mono text-[#B5B3AC]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#E07353] uppercase tracking-wider">
                              {match ? match[1].toUpperCase() : 'TYPESCRIPT'}
                            </span>
                          </div>

                          <button
                            onClick={() => copyCode(codeString, snippetId)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#2A2A26] hover:bg-[#3A3A34] text-[#F5F3ED] uppercase text-[10px] font-bold tracking-wider transition-colors"
                          >
                            {copiedCodeId === snippetId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>COPY</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Code Content */}
                        <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed bg-[#121210] m-0">
                          <code>{codeString}</code>
                        </pre>
                      </div>
                    );
                  }

                  return (
                    <code className="px-1.5 py-0.5 bg-[#E8E6DF] dark:bg-[#242420] text-[#C45E3D] dark:text-[#E07353] font-mono text-xs font-semibold">
                      {children}
                    </code>
                  );
                },
                h2({ children }) {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                  return (
                    <h2 id={id} className="text-2xl sm:text-3xl font-serif font-light mt-12 mb-4 text-[#1A1A1A] dark:text-[#F5F3ED] scroll-mt-24 border-b border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 pb-2">
                      {children}
                    </h2>
                  );
                },
                h3({ children }) {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                  return (
                    <h3 id={id} className="text-xl sm:text-2xl font-serif italic font-normal mt-8 mb-3 text-[#1A1A1A] dark:text-[#F5F3ED] scroll-mt-24">
                      {children}
                    </h3>
                  );
                },
                ul({ children }) {
                  return <ul className="list-disc pl-6 space-y-2 mb-6 font-sans text-[#1A1A1A]/90 dark:text-[#E8E6DF]/90">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-6 space-y-2 mb-6 font-sans text-[#1A1A1A]/90 dark:text-[#E8E6DF]/90">{children}</ol>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-2 border-[#C45E3D] pl-4 italic font-serif text-lg text-[#1A1A1A]/80 dark:text-[#E8E6DF]/80 my-6">
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags Cloud */}
          <div className="pt-8 border-t border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 space-y-3">
            <h4 className="text-[10px] uppercase font-mono tracking-[0.2em] font-bold text-[#1A1A1A]/50 dark:text-[#E8E6DF]/50">
              Taxonomy & Related Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-[#E8E6DF] dark:bg-[#242420] text-[#1A1A1A] dark:text-[#F5F3ED] hover:bg-[#C45E3D] hover:text-white transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Author Card Box */}
          <div className="p-6 border border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 bg-[#FFFFFF] dark:bg-[#1C1C19] flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-16 h-16 rounded-full object-cover grayscale contrast-125 border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-serif italic font-bold text-lg text-[#1A1A1A] dark:text-[#F5F3ED]">
                  {post.author.name}
                </h4>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C45E3D] dark:text-[#E07353] font-bold">
                  {post.author.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 leading-relaxed font-sans">
                {post.author.bio}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <section className="space-y-6 pt-8 border-t border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-light text-[#1A1A1A] dark:text-[#F5F3ED]">
                Responses & Discourse ({comments.length})
              </h3>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="p-6 border border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 bg-[#FFFFFF] dark:bg-[#1C1C19] space-y-4">
              <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-[#1A1A1A] dark:text-[#F5F3ED]">
                Submit Peer Commentary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Full Name *"
                  required
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="px-3.5 py-2.5 text-xs sm:text-sm bg-[#F9F8F4] dark:bg-[#141412] border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 text-[#1A1A1A] dark:text-[#F5F3ED] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-[#E8E6DF]"
                />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={newCommentEmail}
                  onChange={(e) => setNewCommentEmail(e.target.value)}
                  className="px-3.5 py-2.5 text-xs sm:text-sm bg-[#F9F8F4] dark:bg-[#141412] border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 text-[#1A1A1A] dark:text-[#F5F3ED] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-[#E8E6DF]"
                />
              </div>

              <textarea
                placeholder="Share your architectural insight, critique, or benchmarking results..."
                required
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F9F8F4] dark:bg-[#141412] border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20 text-[#1A1A1A] dark:text-[#F5F3ED] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-[#E8E6DF] resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] dark:bg-[#F5F3ED] text-[#F5F3ED] dark:text-[#1A1A1A] text-xs font-mono uppercase font-bold tracking-widest hover:bg-[#C45E3D] dark:hover:bg-[#E07353] dark:hover:text-white transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingComment ? 'Transmitting...' : 'Post Commentary'}</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comm) => (
                <div
                  key={comm.id}
                  className="p-5 border border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 bg-[#FFFFFF] dark:bg-[#1C1C19] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={comm.authorAvatar}
                        alt={comm.authorName}
                        className="w-8 h-8 rounded-full object-cover grayscale border border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20"
                      />
                      <div>
                        <div className="font-serif font-bold text-sm text-[#1A1A1A] dark:text-[#F5F3ED]">
                          {comm.authorName}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/50 dark:text-[#E8E6DF]/50">
                          {new Date(comm.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#1A1A1A]/80 dark:text-[#E8E6DF]/80 font-sans leading-relaxed pl-11">
                    {comm.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky Right Sidebar: Table of Contents & Category Info */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Table of Contents Box */}
          {toc.length > 0 && (
            <div className="p-5 border border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 bg-[#FFFFFF] dark:bg-[#1C1C19] space-y-3">
              <h4 className="text-[10px] uppercase font-mono tracking-[0.2em] font-bold text-[#1A1A1A] dark:text-[#F5F3ED]">
                Article Outline
              </h4>

              <nav className="space-y-1.5 text-xs font-serif">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block py-1 text-[#1A1A1A]/70 dark:text-[#E8E6DF]/70 hover:text-[#C45E3D] dark:hover:text-[#E07353] transition-colors ${
                      item.level === 3 ? 'pl-4 border-l border-[#1A1A1A]/20 dark:border-[#E8E6DF]/20' : 'font-medium'
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Admin / System Insights Widget matching Design HTML */}
          <div className="bg-[#1A1A1A] text-[#F5F3ED] p-6 border border-[#1A1A1A]">
            <span className="text-[9px] uppercase tracking-widest block mb-2 opacity-60 font-mono">
              Admin Insights
            </span>
            <div className="flex items-center gap-3 mb-4 font-mono text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System: Operational</span>
            </div>
            <div className="text-3xl font-serif mb-1">
              {post.views > 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
            </div>
            <div className="text-[10px] uppercase tracking-tighter opacity-60 font-mono">
              Total Article Reads
            </div>
          </div>

          {/* Related Articles in Same Topic */}
          {relatedPosts.length > 0 && (
            <div className="p-5 border border-[#1A1A1A]/15 dark:border-[#E8E6DF]/15 bg-[#FFFFFF] dark:bg-[#1C1C19] space-y-4">
              <h4 className="text-[10px] uppercase font-mono tracking-[0.2em] font-bold text-[#1A1A1A] dark:text-[#F5F3ED]">
                Related {category?.name} Dispatches
              </h4>
              <div className="space-y-3">
                {relatedPosts.map((rp) => (
                  <div
                    key={rp.id}
                    onClick={() => onSelectPost(rp)}
                    className="group cursor-pointer space-y-1 pb-3 border-b border-[#1A1A1A]/10 dark:border-[#E8E6DF]/10 last:border-0 last:pb-0"
                  >
                    <h5 className="font-serif text-sm text-[#1A1A1A] dark:text-[#F5F3ED] group-hover:text-[#C45E3D] dark:group-hover:text-[#E07353] transition-colors line-clamp-2">
                      {rp.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#1A1A1A]/50 dark:text-[#E8E6DF]/50">
                      <span>{rp.readingTimeMinutes}M READ</span>
                      <span>•</span>
                      <span>{rp.views} VIEWS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
};
