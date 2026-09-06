import { Link } from 'react-router-dom';
import { AUTHORS } from '@/data/authors';
import { BLOG_LIST } from '@/data/blog-posts';

export default function AboutPage() {
  const firstYear = 2021;
  const writerCount = AUTHORS.length;
  const essayCount = BLOG_LIST.length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground mb-3">
        About the journal
      </p>
      <h1 className="text-4xl font-bold tracking-tight mb-6">SystemInk</h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        An independent engineering journal, published continuously since April {firstYear}. We write about
        systems, search, reliability, and applied AI — the work that happens after the demo.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-12 border border-border rounded-lg p-6">
        <div>
          <p className="text-2xl font-semibold">{firstYear}</p>
          <p className="text-sm text-muted-foreground">First issue</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{writerCount}</p>
          <p className="text-sm text-muted-foreground">Writers</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{essayCount}</p>
          <p className="text-sm text-muted-foreground">Essays in the archive</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-3">What we publish</h2>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Pieces an engineer can take into a design review. Named trade-offs, failure modes, and systems that
        already shipped. We are not a news desk and we are not a vendor changelog. Priya Venkatesh and Marcus
        Chen started the journal in London and San Francisco in 2021. The masthead is now twenty writers across
        twelve cities.
      </p>

      <h2 className="text-2xl font-semibold mb-3">How we edit</h2>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Claims over slogans. If a number cannot be checked, it comes out. Writers keep their voice. The house
        style prefers short sentences and a date on the scar. Sagar Gondaliya has been a contributing editor
        since 2022.
      </p>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link to="/authors" className="underline underline-offset-4">
          Meet the writers
        </Link>
        <Link to="/search" className="underline underline-offset-4">
          Browse the archive
        </Link>
        <Link to="/tags" className="underline underline-offset-4">
          Topics
        </Link>
      </div>
    </div>
  );
}
