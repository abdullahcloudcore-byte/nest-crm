import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initialCategories, initialPosts, initialComments, initialSettings } from './src/data/initialData';
import { Category, Post, Comment, SiteSettings } from './src/types';
import { generateSlug, estimateReadingTime, auditPostSEO, generateSitemapXml, generateRssXml } from './src/utils/seoUtils';

let categories: Category[] = [...initialCategories];
let posts: Post[] = [...initialPosts];
let comments: Comment[] = [...initialComments];
let settings: SiteSettings = { ...initialSettings };

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get Stats
  app.get('/api/stats', (req, res) => {
    const published = posts.filter((p) => p.status === 'published');
    const drafts = posts.filter((p) => p.status === 'draft');
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const avgScore = posts.length
      ? Math.round(posts.reduce((acc, p) => acc + (p.seo?.score || 80), 0) / posts.length)
      : 85;

    res.json({
      totalPosts: posts.length,
      publishedPosts: published.length,
      draftPosts: drafts.length,
      totalCategories: categories.length,
      totalViews,
      totalLikes,
      totalComments: comments.length,
      avgSeoScore: avgScore,
    });
  });

  // Categories CRUD
  app.get('/api/categories', (req, res) => {
    const populated = categories.map((cat) => ({
      ...cat,
      postCount: posts.filter((p) => p.categoryId === cat.id && p.status === 'published').length,
    }));
    res.json(populated);
  });

  app.post('/api/categories', (req, res) => {
    const { name, description, color, icon, metaTitle, metaDescription } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const slug = generateSlug(name);
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      description: description || '',
      color: color || '#E0234E',
      icon: icon || 'Layers',
      metaTitle: metaTitle || `${name} - NestJS Framework Tutorials`,
      metaDescription: metaDescription || description || `Explore in-depth ${name} guides and best practices for NestJS.`,
    };
    categories.push(newCategory);
    res.status(201).json(newCategory);
  });

  app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    categories[index] = {
      ...categories[index],
      ...req.body,
      slug: req.body.name ? generateSlug(req.body.name) : categories[index].slug,
    };
    res.json(categories[index]);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    categories = categories.filter((c) => c.id !== id);
    res.json({ success: true, message: 'Category removed' });
  });

  // Posts CRUD
  app.get('/api/posts', (req, res) => {
    const { category, tag, search, status, featured } = req.query;
    let results = [...posts];

    if (status) {
      results = results.filter((p) => p.status === status);
    }
    if (category) {
      const cat = categories.find((c) => c.slug === category || c.id === category);
      if (cat) {
        results = results.filter((p) => p.categoryId === cat.id);
      }
    }
    if (tag) {
      results = results.filter((p) => p.tags.some((t) => t.toLowerCase() === String(tag).toLowerCase()));
    }
    if (featured === 'true') {
      results = results.filter((p) => p.featured);
    }
    if (search) {
      const query = String(search).toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.content.toLowerCase().includes(query)
      );
    }

    // Sort by publication date descending
    results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    res.json(results);
  });

  app.get('/api/posts/:slugOrId', (req, res) => {
    const { slugOrId } = req.params;
    const post = posts.find((p) => p.slug === slugOrId || p.id === slugOrId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Increment view count
    post.views = (post.views || 0) + 1;
    res.json(post);
  });

  app.post('/api/posts', (req, res) => {
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
    const readingTime = estimateReadingTime(data.content || '');
    const seoAudit = auditPostSEO({ ...data, slug });

    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: data.title,
      slug,
      excerpt: data.excerpt || (data.content ? data.content.slice(0, 160).replace(/[#*`_]/g, '') + '...' : ''),
      content: data.content || '',
      categoryId: data.categoryId || (categories[0]?.id ?? 'cat-arch'),
      tags: Array.isArray(data.tags) ? data.tags : ['NestJS', 'TypeScript'],
      status: data.status || 'draft',
      featured: Boolean(data.featured),
      author: data.author || {
        name: settings.authorName,
        avatar: settings.authorAvatar,
        role: 'NestJS Architect',
        bio: settings.authorBio,
      },
      publishedAt: data.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTimeMinutes: readingTime,
      views: 0,
      likes: 0,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      seo: {
        metaTitle: data.seo?.metaTitle || data.title,
        metaDescription: data.seo?.metaDescription || data.excerpt || '',
        focusKeyword: data.seo?.focusKeyword || '',
        keywords: data.seo?.keywords || data.tags || ['NestJS'],
        canonicalUrl: data.seo?.canonicalUrl || `${settings.siteUrl}/post/${slug}`,
        ogImage: data.seo?.ogImage || data.coverImage,
        ogType: 'article',
        noIndex: Boolean(data.seo?.noIndex),
        score: seoAudit.score,
      },
    };

    posts.unshift(newPost);
    res.status(201).json(newPost);
  });

  app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const current = posts[index];
    const incoming = req.body;
    const slug = incoming.slug ? generateSlug(incoming.slug) : current.slug;
    const content = incoming.content !== undefined ? incoming.content : current.content;
    const readingTime = estimateReadingTime(content);
    const seoAudit = auditPostSEO({ ...current, ...incoming, content, slug });

    const updated: Post = {
      ...current,
      ...incoming,
      slug,
      content,
      readingTimeMinutes: readingTime,
      updatedAt: new Date().toISOString(),
      seo: {
        ...current.seo,
        ...(incoming.seo || {}),
        score: seoAudit.score,
      },
    };

    posts[index] = updated;
    res.json(updated);
  });

  app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    posts = posts.filter((p) => p.id !== id);
    res.json({ success: true, message: 'Post deleted' });
  });

  app.post('/api/posts/:id/like', (req, res) => {
    const { id } = req.params;
    const post = posts.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.likes = (post.likes || 0) + 1;
    res.json({ likes: post.likes });
  });

  // Comments API
  app.get('/api/comments/:postId', (req, res) => {
    const { postId } = req.params;
    const postComments = comments.filter((c) => c.postId === postId);
    res.json(postComments);
  });

  app.post('/api/comments', (req, res) => {
    const { postId, authorName, authorEmail, content } = req.body;
    if (!postId || !authorName || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      postId,
      authorName,
      authorEmail: authorEmail || 'developer@nestjs.com',
      authorAvatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      status: 'approved',
    };
    comments.push(newComment);
    res.status(201).json(newComment);
  });

  // Settings API
  app.get('/api/settings', (req, res) => {
    res.json(settings);
  });

  app.put('/api/settings', (req, res) => {
    settings = { ...settings, ...req.body };
    res.json(settings);
  });

  // SEO Audit API
  app.post('/api/seo/audit', (req, res) => {
    const auditResult = auditPostSEO(req.body);
    res.json(auditResult);
  });

  // AI Assistant for SEO & Article Drafting
  app.post('/api/ai/generate-seo', async (req, res) => {
    const { title, topic, content, categoryName } = req.body;

    const ai = getAi();
    if (ai) {
      try {
        const prompt = `You are a world-class NestJS and TypeScript technical writer and SEO specialist.
Given the following article draft details:
Title: "${title || topic}"
Category: "${categoryName || 'NestJS'}"
Content snippet: "${(content || '').slice(0, 1000)}"

Generate high-converting SEO metadata and an outline in JSON format with exact keys:
- metaTitle: (45-60 characters, high CTR, mentions NestJS and key benefit)
- metaDescription: (130-155 characters, includes primary keyword, actionable snippet)
- focusKeyword: (2-4 words, e.g. "NestJS Microservices Architecture")
- tags: array of 4-6 relevant tech tags
- suggestedSlug: url-friendly slug
- keyTakeaways: array of 3 bullet points summary`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (err: any) {
        console.error('Gemini AI generation error:', err);
      }
    }

    // Smart algorithmic fallback if Gemini is offline or without key
    const baseSlug = generateSlug(title || topic || 'nestjs-enterprise-guide');
    res.json({
      metaTitle: `${title || topic || 'Building Enterprise Apps with NestJS'} | Complete Guide`,
      metaDescription: `Discover best practices for ${title || topic || 'NestJS architecture'}. Learn patterns, custom providers, error handling, and scalable TypeScript design.`,
      focusKeyword: title ? `NestJS ${title.split(' ')[0] || 'Architecture'}` : 'NestJS Framework',
      tags: ['NestJS', 'TypeScript', 'Node.js', categoryName || 'Backend', 'Architecture'],
      suggestedSlug: baseSlug,
      keyTakeaways: [
        'Follow modular dependency injection and single responsibility principles',
        'Implement structured guards, interceptors, and exception filters',
        'Optimize database queries and connection pooling for high throughput',
      ],
    });
  });

  // Sitemap XML route
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.send(generateSitemapXml(posts, categories, settings.siteUrl));
  });

  // RSS Feed XML route
  app.get('/rss.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.send(generateRssXml(posts, settings));
  });

  // Robots.txt route
  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${settings.siteUrl}/sitemap.xml`);
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NestJS Blog Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
