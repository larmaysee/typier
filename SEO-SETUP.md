# SEO Setup Documentation

This document explains the comprehensive SEO implementation for Typoria.

## 📋 Overview

Typoria uses Next.js 15's App Router with a complete SEO strategy including:

- Meta tags and Open Graph configuration
- Dynamic sitemap generation
- Robots.txt configuration
- PWA manifest
- JSON-LD structured data
- Social media preview images

## 🗂️ SEO Files Structure

```
src/app/
├── layout.tsx              # Enhanced metadata + JSON-LD structured data
├── robots.ts              # Search engine crawler directives
├── sitemap.ts             # Dynamic XML sitemap
├── manifest.ts            # PWA manifest + app metadata
├── opengraph-image.tsx    # Dynamic Open Graph image (1200x630)
└── twitter-image.tsx      # Dynamic Twitter Card image
```

## 🔧 Configuration Files

### 1. robots.ts - Crawler Directives

**Location**: `src/app/robots.ts`

Controls how search engine crawlers interact with your site:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/build/", "/_next/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/", "/build/"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/api/", "/build/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

**Accessible at**: `https://typoria.sites.codibyte.io/robots.txt`

**What it does**:

- Allows all crawlers to index main content
- Blocks indexing of API routes, build artifacts, and Next.js internals
- References sitemap location for efficient crawling

### 2. sitemap.ts - Dynamic Sitemap

**Location**: `src/app/sitemap.ts`

Provides search engines with site structure and update frequency:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://typoria.sites.codibyte.io";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    // Add more pages here as your app grows
  ];
}
```

**Accessible at**: `https://typoria.sites.codibyte.io/sitemap.xml`

**What it does**:

- Lists all public pages with metadata (last modified, change frequency, priority)
- Updates automatically when pages are added or modified
- Helps search engines discover and index content efficiently

**To add new pages**:

```typescript
return [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${baseUrl}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  // Add more pages...
];
```

### 3. manifest.ts - PWA Manifest

**Location**: `src/app/manifest.ts`

Provides app metadata and PWA capabilities:

```typescript
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Typoria - Multilingual Typing Test",
    short_name: "Typoria",
    description: "Test your typing speed and accuracy...",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#3b82f6",
    categories: ["education", "productivity", "utilities"],
    icons: [
      /* ... */
    ],
  };
}
```

**Accessible at**: `https://typoria.sites.codibyte.io/manifest.json`

**What it does**:

- Enables Progressive Web App (PWA) features
- Allows users to "install" the app on their devices
- Provides app metadata for mobile browsers and app stores

### 4. layout.tsx - Enhanced Metadata

**Location**: `src/app/layout.tsx`

Contains comprehensive metadata and JSON-LD structured data.

#### Meta Tags

```typescript
export const metadata: Metadata = {
  title: {
    default: "Typoria - Multilingual Typing Test & Practice",
    template: "%s | Typoria",
  },
  description: "...",
  keywords: ["typing test", "WPM test", ...],
  // ... comprehensive metadata
};
```

#### JSON-LD Structured Data

Embedded in the `<head>` section for rich search results:

**WebApplication Schema**:

```json
{
  "@type": "WebApplication",
  "name": "Typoria",
  "applicationCategory": "EducationalApplication",
  "offers": { "@type": "Offer", "price": "0" },
  "featureList": [...]
}
```

**Organization Schema**:

```json
{
  "@type": "Organization",
  "name": "Typoria",
  "logo": {...},
  "contactPoint": {...}
}
```

**WebSite Schema**:

```json
{
  "@type": "WebSite",
  "url": "https://typoria.sites.codibyte.io",
  "name": "Typoria"
}
```

**BreadcrumbList Schema**:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

## 🌐 Social Media Integration

### Open Graph Tags

For Facebook, LinkedIn, Discord, Slack, etc.:

```typescript
openGraph: {
  type: "website",
  locale: "en_US",
  url: "/",
  title: "Typoria - Multilingual Typing Test & Practice",
  description: "...",
  images: [{
    url: "/og-image.png",
    width: 1200,
    height: 630
  }]
}
```

### Twitter Cards

For Twitter/X:

```typescript
twitter: {
  card: "summary_large_image",
  title: "Typoria - Multilingual Typing Test & Practice",
  description: "...",
  images: ["/og-image.png"],
  creator: "@typoria"
}
```

### Dynamic Image Generation

- `opengraph-image.tsx` - Generates Open Graph images dynamically
- `twitter-image.tsx` - Generates Twitter Card images dynamically
- Images are generated at build time using Next.js Image API
- 1200x630 dimensions (optimal for social sharing)

## 🚀 Deployment Checklist

### Before Deployment

1. **Set Environment Variable**:

```bash
NEXT_PUBLIC_APP_URL=https://typoria.sites.codibyte.io
```

2. **Verify Metadata**:

- Check `metadataBase` in `layout.tsx` matches production URL
- Ensure all URLs in structured data use the correct domain

3. **Test Build**:

```bash
npm run build
```

### After Deployment

1. **Test SEO Files**:

   - Visit `https://typoria.sites.codibyte.io/robots.txt`
   - Visit `https://typoria.sites.codibyte.io/sitemap.xml`
   - Visit `https://typoria.sites.codibyte.io/manifest.json`

2. **Test Social Media Previews**:

   - Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

3. **Submit to Search Engines**:

   - [Google Search Console](https://search.google.com/search-console)
   - [Bing Webmaster Tools](https://www.bing.com/webmasters)

4. **Verify Structured Data**:
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema.org Validator](https://validator.schema.org/)

## 📊 SEO Best Practices Implemented

### ✅ Technical SEO

- [x] Robots.txt configuration
- [x] XML sitemap generation
- [x] Canonical URLs
- [x] Proper meta tags
- [x] Open Graph protocol
- [x] Twitter Cards
- [x] PWA manifest
- [x] JSON-LD structured data
- [x] Mobile-friendly design (responsive)
- [x] Fast loading times (static export)

### ✅ On-Page SEO

- [x] Descriptive title tags with template
- [x] Compelling meta descriptions
- [x] Relevant keywords
- [x] Semantic HTML structure
- [x] Alt text for images (in components)
- [x] Internal linking structure

### ✅ Schema Markup

- [x] WebApplication schema
- [x] Organization schema
- [x] WebSite schema
- [x] BreadcrumbList schema

## 🔍 Search Engine Verification

### Google Search Console Setup

1. Visit [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://typoria.sites.codibyte.io`
3. Verify ownership using one of these methods:
   - HTML file upload
   - Meta tag (add to `layout.tsx` verification field)
   - DNS verification
4. Submit sitemap: `https://typoria.sites.codibyte.io/sitemap.xml`

**Add verification code to layout.tsx**:

```typescript
verification: {
  google: 'your-google-verification-code',
}
```

### Bing Webmaster Tools Setup

1. Visit [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site: `https://typoria.sites.codibyte.io`
3. Verify ownership
4. Submit sitemap: `https://typoria.sites.codibyte.io/sitemap.xml`

**Add verification code to layout.tsx**:

```typescript
verification: {
  bing: 'your-bing-verification-code',
}
```

## 📈 Monitoring & Analytics

### Recommended Tools

1. **Google Analytics 4** - Track user behavior and traffic sources
2. **Google Search Console** - Monitor search performance and indexing
3. **Bing Webmaster Tools** - Monitor Bing search performance
4. **Lighthouse** - Audit performance, accessibility, SEO
5. **PageSpeed Insights** - Measure Core Web Vitals

### Core Web Vitals to Monitor

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## 🎯 Future SEO Enhancements

### When Adding New Pages

1. Update `sitemap.ts` with new routes
2. Add page-specific metadata in page.tsx
3. Implement breadcrumb navigation
4. Add internal links from existing pages

### Potential Additions

- [ ] Blog/Articles with Article schema
- [ ] FAQ schema for help/documentation pages
- [ ] VideoObject schema if adding tutorial videos
- [ ] Review/Rating schema for user testimonials
- [ ] Multilingual support (hreflang tags for Lisu, Myanmar)
- [ ] AMP pages for mobile optimization
- [ ] RSS feed for content updates

### Content Strategy

- Create educational content about typing improvement
- Write guides for each language (English, Lisu, Myanmar)
- Add keyboard layout tutorials
- Publish typing tips and best practices
- Create case studies or user success stories

## 🛠️ Troubleshooting

### Issue: Sitemap not accessible

**Solution**: Ensure build was successful and files are in `build/` directory

### Issue: Social media preview not showing

**Solution**:

1. Clear cache on social media platform
2. Use debugger tools to refresh
3. Verify image paths are absolute URLs

### Issue: Structured data errors

**Solution**:

1. Test with [Rich Results Test](https://search.google.com/test/rich-results)
2. Validate JSON-LD syntax
3. Check schema.org documentation for required fields

### Issue: Pages not indexed

**Solution**:

1. Check robots.txt is not blocking pages
2. Verify sitemap is submitted to search engines
3. Ensure pages are linked from homepage
4. Check for noindex meta tags

## 📚 Resources

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Google Search Central](https://developers.google.com/search)
- [Web.dev SEO Guide](https://web.dev/learn/seo/)

## 🎉 Summary

Typoria now has a complete, production-ready SEO setup that includes:

- ✅ Search engine optimization with robots.txt and sitemap
- ✅ Rich social media previews with dynamic images
- ✅ Comprehensive structured data for rich search results
- ✅ PWA capabilities with manifest
- ✅ Proper metadata configuration
- ✅ Mobile-friendly, fast-loading architecture

The app is ready for search engine indexing and social media sharing!
