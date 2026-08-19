export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  postCount?: number;
}

export interface Author {
  name: string;
  avatar: string;
  role: string;
  bio: string;
  github?: string;
  twitter?: string;
}

export interface PostSEO {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'article' | 'website';
  noIndex?: boolean;
  score?: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  views: number;
  likes: number;
  coverImage: string;
  seo: PostSEO;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  status: 'approved' | 'pending' | 'spam';
}

export interface SEOCheckItem {
  id: string;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  recommendation?: string;
}

export interface SEOAuditResult {
  score: number;
  passedCount: number;
  warningCount: number;
  failCount: number;
  checks: SEOCheckItem[];
  wordCount: number;
  readingTimeMinutes: number;
  headings: { h1: number; h2: number; h3: number };
  keywordDensity: { keyword: string; count: number; percentage: number };
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  tagline: string;
  description: string;
  defaultOgImage: string;
  twitterHandle: string;
  githubUrl: string;
  authorName: string;
  authorRole?: string;
  authorBio: string;
  authorAvatar: string;
  enableComments: boolean;
  enableAiAssistant: boolean;
  googleAnalyticsId?: string;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgSeoScore: number;
}
