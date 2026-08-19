import { Post, Category, SiteSettings, SEOAuditResult, SEOCheckItem } from '../types';

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
}

export function auditPostSEO(post: Partial<Post>): SEOAuditResult {
  const checks: SEOCheckItem[] = [];
  let score = 100;

  const title = post.title || '';
  const metaTitle = post.seo?.metaTitle || title;
  const metaDescription = post.seo?.metaDescription || post.excerpt || '';
  const focusKeyword = (post.seo?.focusKeyword || '').toLowerCase().trim();
  const slug = post.slug || '';
  const content = post.content || '';
  const coverImage = post.coverImage || '';

  // 1. Title Length Check (Optimal: 40 - 65 characters)
  const titleLen = metaTitle.length;
  if (titleLen === 0) {
    score -= 18;
    checks.push({
      id: 'title-empty',
      title: 'Meta Title',
      status: 'fail',
      message: 'Title is missing.',
      recommendation: 'Add an engaging title between 45 and 60 characters for optimal search visibility.',
    });
  } else if (titleLen < 35) {
    score -= 8;
    checks.push({
      id: 'title-short',
      title: 'Meta Title Length',
      status: 'warning',
      message: `Title is short (${titleLen} chars). Google shows up to 60 characters.`,
      recommendation: 'Expand the title to 40-60 characters to include key benefits.',
    });
  } else if (titleLen > 70) {
    score -= 6;
    checks.push({
      id: 'title-long',
      title: 'Meta Title Length',
      status: 'warning',
      message: `Title is long (${titleLen} chars) and may be truncated on search result pages.`,
      recommendation: 'Shorten to under 65 characters so it fits without ellipsis.',
    });
  } else {
    checks.push({
      id: 'title-pass',
      title: 'Meta Title Length',
      status: 'pass',
      message: `Title length is optimal (${titleLen} characters).`,
    });
  }

  // 2. Meta Description Check (Optimal: 120 - 160 characters)
  const metaDescLen = metaDescription.length;
  if (metaDescLen === 0) {
    score -= 16;
    checks.push({
      id: 'meta-empty',
      title: 'Meta Description',
      status: 'fail',
      message: 'Meta description is missing.',
      recommendation: 'Write a compelling meta description between 130-160 characters with your focus keyword.',
    });
  } else if (metaDescLen < 90) {
    score -= 7;
    checks.push({
      id: 'meta-short',
      title: 'Meta Description Length',
      status: 'warning',
      message: `Meta description is too brief (${metaDescLen} chars).`,
      recommendation: 'Expand to 130-160 characters for higher click-through rates (CTR).',
    });
  } else if (metaDescLen > 165) {
    score -= 5;
    checks.push({
      id: 'meta-long',
      title: 'Meta Description Length',
      status: 'warning',
      message: `Meta description is slightly long (${metaDescLen} chars). Google truncates at ~160 chars.`,
      recommendation: 'Keep between 130-160 characters for crisp search snippets.',
    });
  } else {
    checks.push({
      id: 'meta-pass',
      title: 'Meta Description',
      status: 'pass',
      message: `Meta description is within the ideal range (${metaDescLen} characters).`,
    });
  }

  // 3. Focus Keyword Checks
  if (!focusKeyword) {
    score -= 15;
    checks.push({
      id: 'kw-empty',
      title: 'Focus Keyword',
      status: 'fail',
      message: 'No focus keyword defined for this post.',
      recommendation: 'Specify a primary focus keyword (e.g. "NestJS Microservices") to benchmark relevance.',
    });
  } else {
    // Focus keyword in Title
    if (metaTitle.toLowerCase().includes(focusKeyword)) {
      checks.push({
        id: 'kw-title-pass',
        title: 'Focus Keyword in Title',
        status: 'pass',
        message: `Focus keyword "${focusKeyword}" appears in the meta title.`,
      });
    } else {
      score -= 10;
      checks.push({
        id: 'kw-title-fail',
        title: 'Focus Keyword in Title',
        status: 'fail',
        message: `Focus keyword "${focusKeyword}" is missing from the title.`,
        recommendation: 'Include your focus keyword near the beginning of your title.',
      });
    }

    // Focus keyword in Meta Description
    if (metaDescription.toLowerCase().includes(focusKeyword)) {
      checks.push({
        id: 'kw-desc-pass',
        title: 'Focus Keyword in Meta Description',
        status: 'pass',
        message: `Focus keyword appears in the meta description snippet.`,
      });
    } else {
      score -= 8;
      checks.push({
        id: 'kw-desc-fail',
        title: 'Focus Keyword in Meta Description',
        status: 'warning',
        message: `Focus keyword is missing in the meta description.`,
        recommendation: 'Add the focus keyword naturally inside the description to increase search bolding.',
      });
    }

    // Focus keyword in Slug
    const cleanSlug = slug.toLowerCase().replace(/-/g, ' ');
    if (cleanSlug.includes(focusKeyword.replace(/-/g, ' '))) {
      checks.push({
        id: 'kw-slug-pass',
        title: 'Focus Keyword in URL Slug',
        status: 'pass',
        message: `URL slug contains the focus keyword.`,
      });
    } else {
      score -= 5;
      checks.push({
        id: 'kw-slug-warn',
        title: 'Focus Keyword in URL Slug',
        status: 'warning',
        message: 'The URL slug does not contain the exact focus keyword.',
        recommendation: 'Include your target keyword in the permalink slug.',
      });
    }
  }

  // 4. Content Word Count
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount < 150) {
    score -= 20;
    checks.push({
      id: 'content-thin',
      title: 'Content Depth',
      status: 'fail',
      message: `Content is too short (${wordCount} words). Search engines prioritize comprehensive articles.`,
      recommendation: 'Aim for at least 600-1200 words of substantive technical explanation.',
    });
  } else if (wordCount < 450) {
    score -= 8;
    checks.push({
      id: 'content-short',
      title: 'Content Depth',
      status: 'warning',
      message: `Article has moderate length (${wordCount} words).`,
      recommendation: 'Adding practical code examples and architectural notes can elevate ranking potential.',
    });
  } else {
    checks.push({
      id: 'content-pass',
      title: 'Content Depth',
      status: 'pass',
      message: `Great content length (${wordCount} words). Well-detailed for technical readers.`,
    });
  }

  // 5. Heading Structure
  const h1Count = (content.match(/^#\s+/gm) || []).length;
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;

  if (h2Count < 2) {
    score -= 8;
    checks.push({
      id: 'headings-sparse',
      title: 'Heading Hierarchy (H2 / H3)',
      status: 'warning',
      message: `Only found ${h2Count} H2 subheadings in content.`,
      recommendation: 'Break content down with descriptive H2 and H3 subheadings for readability and featured snippets.',
    });
  } else {
    checks.push({
      id: 'headings-pass',
      title: 'Heading Hierarchy',
      status: 'pass',
      message: `Structured with ${h2Count} H2 and ${h3Count} H3 subheadings.`,
    });
  }

  // 6. Cover Image & Media
  if (!coverImage) {
    score -= 10;
    checks.push({
      id: 'cover-missing',
      title: 'Social Share / OG Image',
      status: 'warning',
      message: 'No cover or OpenGraph preview image provided.',
      recommendation: 'Add a high-resolution 1200x630px cover image for rich previews on social feeds.',
    });
  } else {
    checks.push({
      id: 'cover-pass',
      title: 'Social Share / OG Image',
      status: 'pass',
      message: 'High quality cover image configured for OpenGraph & Twitter cards.',
    });
  }

  // 7. Keyword Density Calculation
  let kwCount = 0;
  let kwPercentage = 0;
  if (focusKeyword && wordCount > 0) {
    const regex = new RegExp(`\\b${focusKeyword}\\b`, 'gi');
    kwCount = (content.match(regex) || []).length;
    kwPercentage = Number(((kwCount / wordCount) * 100).toFixed(2));

    if (kwCount === 0) {
      score -= 10;
      checks.push({
        id: 'kw-density-zero',
        title: 'Keyword Density',
        status: 'fail',
        message: 'Focus keyword does not appear in body content.',
        recommendation: 'Mention your focus keyword naturally in the introductory and body paragraphs.',
      });
    } else if (kwPercentage > 4.5) {
      score -= 8;
      checks.push({
        id: 'kw-density-high',
        title: 'Keyword Density',
        status: 'warning',
        message: `Keyword density is high (${kwPercentage}%). Risk of keyword stuffing.`,
        recommendation: 'Lower the repetition of exact keyword and use synonyms or semantic variations.',
      });
    } else {
      checks.push({
        id: 'kw-density-pass',
        title: 'Keyword Density',
        status: 'pass',
        message: `Keyword density is healthy (${kwPercentage}%, mentioned ${kwCount} times).`,
      });
    }
  }

  const finalScore = Math.max(10, Math.min(100, score));
  const passedCount = checks.filter((c) => c.status === 'pass').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;

  return {
    score: finalScore,
    passedCount,
    warningCount,
    failCount,
    checks,
    wordCount,
    readingTimeMinutes: estimateReadingTime(content),
    headings: { h1: h1Count, h2: h2Count, h3: h3Count },
    keywordDensity: {
      keyword: focusKeyword,
      count: kwCount,
      percentage: kwPercentage,
    },
  };
}

export function generateJsonLdSchema(post: Post, siteUrl: string): object {
  const postUrl = `${siteUrl}/post/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': post.seo?.metaTitle || post.title,
    'description': post.seo?.metaDescription || post.excerpt,
    'image': [post.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200'],
    'datePublished': post.publishedAt,
    'dateModified': post.updatedAt || post.publishedAt,
    'author': {
      '@type': 'Person',
      'name': post.author.name,
      'jobTitle': post.author.role,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'NestJS Developer Hub',
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/nestjs-logo.png`,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    'keywords': post.tags.join(', '),
    'articleSection': 'Software Engineering',
    'inLanguage': 'en-US',
  };
}

export function generateSitemapXml(posts: Post[], categories: Category[], siteUrl: string): string {
  const publishedPosts = posts.filter((p) => p.status === 'published');
  
  const postEntries = publishedPosts
    .map(
      (p) => `  <url>
    <loc>${siteUrl}/post/${p.slug}</loc>
    <lastmod>${(p.updatedAt || p.publishedAt).split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  const categoryEntries = categories
    .map(
      (c) => `  <url>
    <loc>${siteUrl}/category/${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${categoryEntries}
${postEntries}
</urlset>`;
}

export function generateRssXml(posts: Post[], settings: SiteSettings): string {
  const publishedPosts = posts.filter((p) => p.status === 'published').slice(0, 20);

  const items = publishedPosts
    .map(
      (p) => `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${settings.siteUrl}/post/${p.slug}</link>
      <guid isPermaLink="true">${settings.siteUrl}/post/${p.slug}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <author>${p.author.name}</author>
      <category><![CDATA[${p.tags.join(', ')}]]></category>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${settings.siteName}</title>
    <link>${settings.siteUrl}</link>
    <description>${settings.description}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${settings.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}
