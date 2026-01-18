import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  html: string;
  className?: string;
}

export default function TableOfContents({ html, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Try to get headings from the actual DOM first (if content is rendered)
    // Otherwise, parse from HTML string
    const getHeadingsFromDOM = () => {
      const contentElement = document.querySelector('[data-post-content], .prose, article');
      if (contentElement) {
        const headingElements = contentElement.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
        if (headingElements.length > 0) {
          const extractedHeadings: Heading[] = [];
          headingElements.forEach((heading) => {
            const id = heading.id;
            if (id) {
              extractedHeadings.push({
                id,
                text: heading.textContent || '',
                level: parseInt(heading.tagName.substring(1), 10),
              });
            }
          });
          if (extractedHeadings.length > 0) {
            setHeadings(extractedHeadings);
            return true;
          }
        }
      }
      return false;
    };

    // If DOM headings found, use them; otherwise parse HTML string
    if (!getHeadingsFromDOM()) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extractedHeadings: Heading[] = [];

      headingElements.forEach((heading) => {
        let id = heading.id;
        // If no ID exists, generate one from text content
        if (!id && heading.textContent) {
          id = heading.textContent
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();
        }
        
        // If still no ID, use a fallback
        if (!id) {
          id = `heading-${extractedHeadings.length}`;
        }
        
        extractedHeadings.push({
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.substring(1), 10),
        });
      });

      setHeadings(extractedHeadings);
      
      // Also ensure headings in actual DOM have IDs
      setTimeout(() => {
        const contentElement = document.querySelector('[data-post-content], .prose, article');
        if (contentElement) {
          headingElements.forEach((heading, index) => {
            const element = contentElement.querySelector(
              `${heading.tagName.toLowerCase()}:nth-of-type(${index + 1})`
            );
            if (element && !element.id && extractedHeadings[index]) {
              element.id = extractedHeadings[index].id;
            }
          });
        }
      }, 100);
    }

    // Listen for content updates and re-scan
    const observer = new MutationObserver(() => {
      getHeadingsFromDOM();
    });

    const contentElement = document.querySelector('[data-post-content], .prose, article');
    if (contentElement) {
      observer.observe(contentElement, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [html]);

  useEffect(() => {
    const updateActiveId = () => {
      const headerOffset = 100;
      const scrollPosition = window.pageYOffset + headerOffset;

      // Find the heading that's currently at or just above the scroll position
      let activeHeading = headings[0]?.id || '';
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element) {
          const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
          if (elementTop <= scrollPosition) {
            activeHeading = headings[i].id;
            break;
          }
        }
      }

      setActiveId(activeHeading);
    };

    // Update on scroll
    window.addEventListener('scroll', updateActiveId, { passive: true });
    window.addEventListener('resize', updateActiveId);
    
    // Initial update
    updateActiveId();

    // Also use IntersectionObserver as a fallback
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top of the viewport
        const sortedEntries = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => {
            const aTop = a.boundingClientRect.top;
            const bTop = b.boundingClientRect.top;
            return Math.abs(aTop - 100) - Math.abs(bTop - 100);
          });
        
        if (sortedEntries.length > 0) {
          setActiveId(sortedEntries[0].target.id);
        }
      },
      { 
        rootMargin: '-100px 0px -60%',
        threshold: [0, 0.1, 0.2, 0.5]
      },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => {
      window.removeEventListener('scroll', updateActiveId);
      window.removeEventListener('resize', updateActiveId);
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className={cn('flex flex-col h-full overflow-visible', className)}>
      <div className="border-l-2 border-border pl-6 space-y-1 flex flex-col h-full overflow-visible">
        <h3 className="text-sm font-semibold mb-4 text-foreground flex-shrink-0 pl-1">Table of Contents</h3>
        <ul className="space-y-1 overflow-y-auto flex-1 pr-3 overscroll-contain min-h-0 overflow-x-visible" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {headings.map((heading) => (
            <li key={heading.id} className="flex-shrink-0 overflow-visible">
              <a
                href={`#${heading.id}`}
                className={cn(
                  'text-sm block py-1 pr-2 transition-all duration-200 break-words relative overflow-visible',
                  heading.level === 1 && 'pl-3 font-medium',
                  heading.level === 2 && 'pl-6',
                  heading.level === 3 && 'pl-9',
                  heading.level === 4 && 'pl-12',
                  activeId === heading.id
                    ? 'text-black dark:text-white font-bold'
                    : 'text-muted-foreground hover:text-foreground/70',
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    // Calculate offset for sticky header
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    });
                    
                    // Update URL hash without scrolling
                    window.history.replaceState(null, '', `#${heading.id}`);
                  }
                }}
                title={heading.text}
              >
                {activeId === heading.id && (
                  <span 
                    className="absolute top-0 bottom-0 w-0.5 bg-black dark:bg-white"
                    style={{ left: '-1.5rem' }}
                  />
                )}
                <span className="inline-block">{heading.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
