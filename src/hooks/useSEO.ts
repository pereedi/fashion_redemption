import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const useSEO = ({ 
  title, 
  description = "Fashion Redemption - Luxury Reimagined. Discover our exclusive collection of high-end fashion and accessories.", 
  keywords = "fashion, luxury, clothing, accessories, premium, shopping", 
  image = "/logo.png",
  url = window.location.href
}: SEOProps) => {
  useEffect(() => {
    // Update title
    const fullTitle = `${title} | Fashion Redemption`;
    document.title = fullTitle;

    // Helper to update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };

    // Standard Meta
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph (Facebook, LinkedIn, etc.)
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', 'website', true);

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

  }, [title, description, keywords, image, url]);
};
