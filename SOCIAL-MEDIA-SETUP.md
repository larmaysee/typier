# Social Media Preview Setup

This document explains the social media preview configuration for Typoria.

## What's Configured

### 1. Open Graph Tags (Facebook, LinkedIn, etc.)

- **Title**: Typoria - Multilingual Typing Test & Practice
- **Description**: Test your typing speed and accuracy in English, Lisu, and Myanmar languages
- **Image**: Dynamically generated 1200x630 image at `/opengraph-image`
- **Type**: website
- **URL**: Automatic based on deployment

### 2. Twitter Card

- **Card Type**: summary_large_image
- **Image**: Dynamically generated 1200x630 image at `/twitter-image`
- **Title & Description**: Same as Open Graph

### 3. Dynamic Image Generation

The preview images are generated using Next.js Image Generation API:

- Dark theme with gradient background
- Typoria branding with blue-purple gradient
- Feature highlights (Real-time Feedback, Detailed Stats, Multiple Languages)
- Responsive to theme changes

## Files Modified/Created

1. **src/app/layout.tsx** - Enhanced metadata with full Open Graph and Twitter Card configuration
2. **src/app/opengraph-image.tsx** - Dynamic OG image generator
3. **src/app/twitter-image.tsx** - Dynamic Twitter card image generator
4. **.env.example** - Added `NEXT_PUBLIC_APP_URL` variable

## Environment Variables

Add to your `.env.local` and production environment:

```env
# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3002

# For production (replace with your actual domain)
NEXT_PUBLIC_APP_URL=https://typoria.yourdomain.com
```

## Testing Social Media Previews

### Facebook

1. Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter your URL
3. Click "Scrape Again" to refresh the cache

### Twitter/X

1. Go to [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Enter your URL
3. Preview the card

### LinkedIn

1. Go to [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
2. Enter your URL
3. Inspect the preview

### General OG Tag Tester

- [OpenGraph.xyz](https://www.opengraph.xyz/)
- [Meta Tags](https://metatags.io/)

## Customization

### Change Preview Image Design

Edit `src/app/opengraph-image.tsx` and `src/app/twitter-image.tsx`:

- Modify colors, gradients, and styling
- Update text content
- Change layout and features

### Update Metadata

Edit `src/app/layout.tsx`:

- Update title, description, keywords
- Change Twitter handle (@typoria)
- Modify image dimensions if needed

### Add Static Image (Alternative)

If you prefer a static image instead of dynamic generation:

1. Create image: `public/og-image.png` (1200x630)
2. Update metadata to use: `images: [{ url: '/og-image.png' }]`
3. Remove `opengraph-image.tsx` and `twitter-image.tsx`

## What Gets Shared

When someone shares your link on social media, they'll see:

- **Large preview image** with Typoria branding
- **Bold title**: "Typoria - Multilingual Typing Test & Practice"
- **Description**: Brief overview of features
- **Clean, professional appearance** matching your brand

## SEO Benefits

The configuration also improves SEO with:

- Structured metadata for search engines
- Mobile-friendly meta tags
- Robots directives for optimal crawling
- Canonical URLs
- Proper keywords and author information

## Deployment Notes

For **Appwrite deployment**:

- Set `NEXT_PUBLIC_APP_URL` in Appwrite environment variables
- Use your production domain (e.g., `https://typoria-function.appwrite.io`)
- The images will be generated on-the-fly at build time

For **Vercel/Netlify**:

- Set environment variable in platform settings
- Preview deployments will use preview URLs automatically
- Production uses your custom domain
