import { Injectable } from '@nestjs/common';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

@Injectable()
export class MarkdownService {
  private purify: ReturnType<typeof DOMPurify>;

  constructor() {
    const window = new JSDOM('').window;
    this.purify = DOMPurify(window as any);

    // Configure marked
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }

  async toHtml(markdown: string): Promise<string> {
    // Convert markdown to HTML
    const rawHtml = await marked.parse(markdown);

    // Sanitize HTML to prevent XSS
    const cleanHtml = this.purify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'strong', 'em', 'del', 's',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel',
      ],
      ADD_ATTR: ['target'],
    });

    // Add target="_blank" to external links
    return this.processLinks(cleanHtml);
  }

  private processLinks(html: string): string {
    // Simple regex to add target="_blank" and rel="noopener" to external links
    return html.replace(
      /<a href="(https?:\/\/[^"]+)"([^>]*)>/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer"$2>',
    );
  }

  calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }

  extractHeadings(html: string): Array<{ id: string; text: string; level: number }> {
    const headingRegex = /<h([1-6])[^>]*(?:id="([^"]*)")?[^>]*>([^<]+)<\/h[1-6]>/gi;
    const headings: Array<{ id: string; text: string; level: number }> = [];
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1], 10);
      const text = match[3].trim();
      const id = match[2] || this.slugify(text);
      headings.push({ id, text, level });
    }

    return headings;
  }

  // Add IDs to headings for TOC linking
  addHeadingIds(html: string): string {
    return html.replace(
      /<h([1-6])([^>]*)>([^<]+)<\/h[1-6]>/gi,
      (match, level, attrs, text) => {
        const id = this.slugify(text.trim());
        if (attrs.includes('id=')) {
          return match;
        }
        return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
      },
    );
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
