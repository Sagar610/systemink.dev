import {
  PostListItem,
  PostPublic,
  PostStatus,
  TagPublic,
  calculateReadingTime,
} from '@systemink/shared';
import { AUTHORS, getAuthor } from './authors';
import { ARCHIVE_POSTS } from './archive-posts';
import { SAGAR_POSTS } from './sagar-posts';
import { computeAuthorSocial, coverForSlug } from './media';
import type { PostDraft } from './post-types';

export type { PostDraft } from './post-types';
export { AUTHORS, getAuthor, staffAuthors } from './authors';

export const AUTHOR = getAuthor('sagargondaliya');

const TAG_DEFS: Array<[string, string, string]> = [
  ['rag', 'RAG', 'rag'],
  ['llm', 'LLMs', 'llms'],
  ['system-design', 'System Design', 'system-design'],
  ['ai', 'Artificial Intelligence', 'artificial-intelligence'],
  ['retrieval', 'Retrieval', 'retrieval'],
  ['evaluation', 'Evaluation', 'evaluation'],
  ['observability', 'Observability', 'observability'],
  ['architecture', 'Architecture', 'architecture'],
  ['agents', 'Agents', 'agents'],
  ['vector-search', 'Vector Search', 'vector-search'],
  ['cost', 'Cost Engineering', 'cost-engineering'],
  ['saas', 'SaaS', 'saas'],
  ['prompts', 'Prompt Engineering', 'prompt-engineering'],
  ['reliability', 'Reliability', 'reliability'],
  ['distributed-systems', 'Distributed Systems', 'distributed-systems'],
  ['mlops', 'MLOps', 'mlops'],
  ['privacy', 'Privacy', 'privacy'],
  ['product', 'Product', 'product'],
];

export const TAGS: TagPublic[] = TAG_DEFS.map(([id, name, slug]) => ({
  id: `tag-${id}`,
  name,
  slug,
}));

const tag = (slug: string): TagPublic => {
  const found = TAGS.find((item) => item.slug === slug);
  if (!found) {
    throw new Error(`Unknown tag: ${slug}`);
  }
  return found;
};

const recentDrafts: PostDraft[] = [
  {
    id: 'post-rag-vs-ft',
    title: 'RAG vs Fine-Tuning vs Agents: Choosing the Right Pattern',
    slug: 'rag-vs-fine-tuning-vs-agents',
    excerpt:
      'These three patterns solve different problems. Mixing them without a clear job for each one is how AI roadmaps stall and costs rise.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&h=900&fit=crop&q=80',
    publishedAt: '2023-10-20T08:00:00.000Z',
    viewsCount: 27640,
    featured: true,
    tagSlugs: ['rag', 'llms', 'agents', 'system-design'],
    authorUsername: 'amaradiallo',
    contentHtml: `
<p>Teams often ask which approach is "best": retrieval-augmented generation, fine-tuning, or agents. That question hides the real one. What job is the model being hired to do, and how often does the underlying knowledge change?</p>
<h2 id="use-rag-for-facts">Use RAG when the facts move</h2>
<p>RAG is the default for product docs, policies, tickets, and internal wikis. The knowledge changes weekly. You want citations. You want to add a document without training a model. If the failure mode is "wrong fact," start with retrieval.</p>
<p>RAG is a poor fit when the task is style, format, or a skill the model already lacks even with the right passage in context. Retrieval cannot teach a model to extract structured fields if it ignores instructions.</p>
<h2 id="fine-tune-for-behavior">Fine-tune when you need behavior, not knowledge</h2>
<p>Fine-tuning earns its keep on format, tone, classification, and domain language. A model that must emit a strict JSON schema, write in a house style, or label support tickets can improve with a few thousand clean examples.</p>
<p>It is the wrong tool for "keep this in sync with the latest policy PDF." Weights do not update when legal uploads a new file. Fine-tunes also need evaluation, versioning, and a rollback plan. Treat them like any other model release.</p>
<h2 id="agents-for-workflows">Use agents when the work is a workflow</h2>
<p>An agent is useful when the task needs tools and multiple steps: search, then read, then open a ticket, then confirm. It is not useful as a default wrapper around a single question-answer box. Each tool call adds latency, cost, and a new failure mode.</p>
<p>If you cannot draw the state machine, you are not ready for an agent. Start with a scripted graph: retrieve, reason, act, verify. Add autonomy only where the graph is too rigid.</p>
<h2 id="compose-them">Compose them on purpose</h2>
<p>The common production shape is simple. A fine-tuned or well-prompted model handles format. RAG supplies facts. A narrow agent calls two or three tools with a verifier at the end. That is a system, not a slogan.</p>
<h2 id="takeaways">Takeaways</h2>
<ul>
<li>RAG for changing knowledge and citations.</li>
<li>Fine-tuning for style, schema, and classification.</li>
<li>Agents for multi-step work with tools, not for every chat box.</li>
<li>Compose the three. Do not pick a winner for the whole company.</li>
</ul>
`,
  },
  {
    id: 'post-vector-search',
    title: 'A Practical Vector Search Pipeline for Product Teams',
    slug: 'practical-vector-search-pipeline',
    excerpt:
      'Vector search looks like a database feature. In a product it is a pipeline: ingest, embed, index, query, and rebuild without surprising users.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&h=900&fit=crop&q=80',
    publishedAt: '2022-07-24T08:00:00.000Z',
    viewsCount: 24110,
    featured: false,
    tagSlugs: ['vector-search', 'retrieval', 'system-design', 'rag'],
    authorUsername: 'elenavarga',
    contentHtml: `
<p>Buying a vector database does not give you search quality. It gives you an ANN index. Quality comes from the pipeline around it: what you embed, how you version those embeddings, and how you query under a latency budget.</p>
<h2 id="ingest-with-ids">Ingest with stable IDs</h2>
<p>Every chunk needs a stable primary key derived from the source document and the section path. When a page is edited, you upsert that key. When a page is deleted, you delete by prefix. Without stable IDs, rebuilds create duplicates and stale answers linger for weeks.</p>
<p>Keep the raw text, the embedding model name, and the chunker version next to the vector. You will need all three when you change models.</p>
<h2 id="embedding-model-changes">Treat embedding model changes as migrations</h2>
<p>You cannot compare vectors from two models in one index. A model upgrade is a backfill. Run the new index in shadow, compare recall on a golden set, then switch the query path. Dual-write if you must. Never mix dimensions and hope the database sorts it out.</p>
<h2 id="query-path">Keep the query path boring</h2>
<p>The live path should be short:</p>
<ol>
<li>Normalize and, if needed, expand the query.</li>
<li>Apply tenant and metadata filters first.</li>
<li>Run hybrid retrieval.</li>
<li>Rerank a small set.</li>
<li>Return IDs, scores, and the original text.</li>
</ol>
<p>Do not embed the query with a different model than the index. Do not apply filters after ANN if the engine supports pre-filtering. Post-filtering a top-20 list is how you return zero results for a query that had matches.</p>
<h2 id="rebuilds">Rebuilds should be invisible</h2>
<p>Nightly jobs, schema changes, and re-embeds will happen. Build the index behind an alias. Swap the alias when the job finishes and the eval gate passes. Users should never hit a half-built collection.</p>
<h2 id="takeaways">Takeaways</h2>
<ul>
<li>Stable chunk IDs make updates and deletes possible.</li>
<li>A new embedding model is a migration, not a config flip.</li>
<li>Filter before you search, then rerank a small list.</li>
<li>Ship index swaps behind an alias and an eval gate.</li>
</ul>
`,
  },
  {
    id: 'post-llm-cost',
    title: 'Cost and Latency Control for LLM APIs',
    slug: 'cost-and-latency-control-for-llm-apis',
    excerpt:
      'Token bills and tail latency will surprise you in the same week. The fix is queues, caches, model routing, and a budget that product can see.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop&q=80',
    publishedAt: '2023-07-12T08:00:00.000Z',
    viewsCount: 19840,
    featured: false,
    tagSlugs: ['cost-engineering', 'llms', 'system-design', 'architecture'],
    authorUsername: 'owenbradley',
    contentHtml: `
<p>The first month of an LLM feature often looks cheap. Traffic is low, prompts are short, and nobody is retrying. Then a launch, a long context, and a retry loop arrive together. The invoice and the p99 move on the same day.</p>
<h2 id="know-the-unit-cost">Know the unit cost</h2>
<p>Price the feature as a unit, not as a monthly guess. A support reply might cost a few cents. A "summarize this entire account" action can cost dollars if you stuff 80k tokens into the prompt. Put the estimated cost on the internal admin screen. Product owners change the feature when they can see the number.</p>
<p>Log input tokens, output tokens, model, cache hit, and user or tenant. Without those five fields you cannot explain a spike.</p>
<h2 id="cache-and-reuse">Cache what does not need a new thought</h2>
<p>Exact-match prompt caches help more than people expect: repeated system prompts, identical classifier inputs, and FAQ answers. Semantic caches are powerful and dangerous. A near-match on a policy question can return the wrong tenant's answer. Key the cache by tenant, model, and a normalized prompt. Set a short TTL on anything that can go stale.</p>
<h2 id="route-models">Route models on purpose</h2>
<p>Not every request needs the frontier model. Classification, routing, and tight extraction can run on a small model. Reserve the expensive model for open generation and hard reasoning. A simple router — rules first, model second — cuts cost without a research project.</p>
<h2 id="queue-the-spikes">Queue the spikes</h2>
<p>Synchronous HTTP to a model provider will fail during a launch. Put non-interactive work on a queue: batch summaries, nightly digests, re-embeds. For interactive chat, shed load with a wait state and a smaller model rather than letting every request time out.</p>
<h2 id="takeaways">Takeaways</h2>
<ul>
<li>Log tokens, model, cache, and tenant on every call.</li>
<li>Cache carefully, and never across tenants.</li>
<li>Route easy work to small models.</li>
<li>Queue batch work. Protect the interactive path.</li>
</ul>
`,
  },
  {
    id: 'post-llm-observability',
    title: 'Observability for LLM Applications',
    slug: 'observability-for-llm-applications',
    excerpt:
      'Request logs are not enough. You need traces across retrieval and generation, plus quality scores that tell you when the system drifted.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop&q=80',
    publishedAt: '2022-06-29T08:00:00.000Z',
    viewsCount: 22180,
    featured: false,
    tagSlugs: ['observability', 'llms', 'rag', 'system-design'],
    authorUsername: 'naomifeldman',
    contentHtml: `
<p>A 200 from the model provider means the bytes arrived. It does not mean the user got a useful, grounded answer. LLM products need a second kind of observability: traces of the reasoning path and a quality signal that can drop when the corpus or the prompt changes.</p>
<h2 id="trace-the-path">Trace the whole path</h2>
<p>A single chat turn may include rewrite, retrieve, rerank, generate, and tool calls. Put them on one trace with a shared conversation id. Record the retrieved chunk IDs, scores, token counts, and the final prompt version. When a user says "this is wrong," you should be able to open that turn in under a minute.</p>
<p>Redact secrets and personal data before the trace leaves the request path. Prompt logs are a compliance surface.</p>
<h2 id="separate-layers">Separate system health from answer quality</h2>
<p>System health is familiar: error rate, latency, timeout, token budget exceeded. Answer quality is different: groundedness, citation match, user thumbs, and task success. Do not average them into one "AI health" chart. A fast, cheap, wrong answer will look green.</p>
<h2 id="sample-for-review">Sample for human review</h2>
<p>You will not read every response. Sample by risk. Review a higher share of answers that mention money, legal language, or medical advice. Review a random slice of the rest. A weekly review of 50 traces teaches more than a dashboard with no examples.</p>
<h2 id="alert-on-drift">Alert on drift, not on vibes</h2>
<p>Set alerts on retrieval hit rate, refusal rate, and eval-set score after deploys. If citation coverage falls after an index rebuild, you have a real incident. If someone "feels" the model got worse, start from the eval set before you rewrite the prompt.</p>
<h2 id="takeaways">Takeaways</h2>
<ul>
<li>One trace per turn, including retrieval IDs and prompt version.</li>
<li>Keep reliability metrics and quality metrics apart.</li>
<li>Review a risk-weighted sample every week.</li>
<li>Alert on eval and retrieval drift after you ship changes.</li>
</ul>
`,
  },
  {
    id: 'post-multi-tenant-ai',
    title: 'Multi-Tenant Design for AI Products',
    slug: 'multi-tenant-design-for-ai-products',
    excerpt:
      'The hard part of an AI SaaS is not the model. It is making sure one customer never sees another customer’s context, cache, or bill.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1486406149926-2bfaafb2c5cd?w=1600&h=900&fit=crop&q=80',
    publishedAt: '2024-09-02T08:00:00.000Z',
    viewsCount: 8640,
    featured: false,
    tagSlugs: ['saas', 'architecture', 'system-design', 'artificial-intelligence'],
    authorUsername: 'faridalhassan',
    contentHtml: `
<p>Multi-tenancy is well understood for CRUD apps. AI products add new leak paths: embeddings, prompt caches, conversation memory, and batch jobs that re-embed an entire workspace. A single missed filter can surface another company's contract in a chat answer.</p>
<h2 id="isolate-the-index">Isolate the index</h2>
<p>Every vector and every lexical document needs a tenant key. Prefer engine-level filters that cannot be turned off by a bad query. For higher-risk customers, give them a separate collection or a separate namespace. The extra ops cost is cheaper than a cross-tenant retrieval incident.</p>
<p>Never put tenant identity only in the prompt. Prompts are not an access-control layer.</p>
<h2 id="isolate-the-cache">Isolate the cache and the memory</h2>
<p>Semantic caches, conversation summaries, and "memory" features must be keyed by tenant and user. A global similarity cache is a data breach waiting for two companies to ask a similar question. The same rule applies to batch workers. A job that pulls "recent documents" without a tenant clause will mix corpora.</p>
<h2 id="quota-per-tenant">Quota is part of isolation</h2>
<p>One customer can exhaust the provider budget for everyone else. Set per-tenant token quotas, concurrency limits, and queue priorities. Fairness is a reliability feature. It is also how you explain the invoice.</p>
<h2 id="audit">Audit the path that can leak</h2>
<p>Log tenant id on retrieve, cache hit, and generate. Add a test that inserts a canary document in tenant A and searches from tenant B. Run it in CI. This is the cheapest security test you will ever write for an AI product.</p>
<h2 id="takeaways">Takeaways</h2>
<ul>
<li>Tenant filters belong in the index, not in the prompt.</li>
<li>Cache and memory are as sensitive as the primary database.</li>
<li>Per-tenant quotas protect cost and latency for everyone else.</li>
<li>Automate a cross-tenant retrieval test and keep it green.</li>
</ul>
`,
  },
  {
    id: 'post-prompt-management',
    title: 'Prompt Management Is Engineering, Not Copywriting',
    slug: 'prompt-management-is-engineering',
    excerpt:
      'If the prompt lives in a chat window, you cannot roll it back. Treat prompts like code: version them, test them, and ship them through the same pipeline.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop&q=80',
    publishedAt: '2024-06-10T08:00:00.000Z',
    viewsCount: 9120,
    featured: false,
    tagSlugs: ['prompt-engineering', 'llms', 'architecture', 'evaluation'],
    authorUsername: 'meilin',
    contentHtml: `
<p>Early on, the prompt is a string in a file. That is fine. The problem starts when five people edit it in production because "the model sounded off today." You then have no version, no owner, and no way to prove the last change helped.</p>
<h2 id="version-everything">Version the prompt like a module</h2>
<p>Give each prompt an id, a version, and an owner. Store it in git or a prompt registry that can pin versions per environment. The application should request <code>support-reply@12</code>, not "whatever is in the database." When a change goes wrong, you roll back a version. You do not hunt through Slack.</p>
<h2 id="keep-policy-out-of-prose">Keep policy out of unbounded prose</h2>
<p>Long policy dumps inside a system prompt are hard to test and easy to contradict. Put stable rules in structured form: allowed tools, refusal cases, output schema. Use the prompt for style and task framing. When legal changes a rule, you want to change a record, not a paragraph that the model may ignore.</p>
<h2 id="test-before-ship">Test before you ship</h2>
<p>A prompt change is a behavior change. Run it against a fixed eval set: 30 to 100 real examples with expected properties. Check schema validity, citation presence, and a small set of must-not-say cases. If the score drops, the change does not ship. This is ordinary software practice applied to text.</p>
<h2 id="separate-env">Separate draft from production</h2>
<p>Editors need a sandbox. Production needs a pin. Feature flags help you roll a prompt to 5% of traffic and compare quality and cost. A global edit on the live prompt is a deploy without a review.</p>
<h2 id="takeaways">Takeaways</h2>
<ul>
<li>Pin prompt versions in every environment.</li>
<li>Put hard rules in structure, not only in prose.</li>
<li>Eval sets are the unit tests for prompt changes.</li>
<li>Ship prompts through flags, the same way you ship code.</li>
</ul>
`,
  },
  {
    id: 'post-eval-rag',
    title: 'How to Evaluate RAG Without Fooling Yourself',
    slug: 'evaluate-rag-without-fooling-yourself',
    excerpt:
      'Anecdotes and chat playgrounds hide regressions. A small, honest evaluation set will tell you if retrieval or generation actually got better.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1600&h=900&fit=crop&q=80',
    publishedAt: '2023-07-20T08:00:00.000Z',
    viewsCount: 18450,
    featured: true,
    tagSlugs: ['evaluation', 'rag', 'retrieval', 'llms'],
    authorUsername: 'henriknilsen',
    contentHtml: `
<p>The most common RAG evaluation is a hallway test. Someone asks three questions, likes the answers, and the team ships. Two weeks later support reports that a high-traffic question now cites the wrong policy. Nobody can say which change caused it.</p>
<p>You do not need a research bench. You need a set of questions the product must not regress on.</p>
<h2 id="split-the-score">Split retrieval from generation</h2>
<p>If the right passage never entered the context, the generator cannot be blamed. Score retrieval first: recall at k, and whether the gold chunk was present. Score generation second: faithfulness to the provided context, completeness, and citation validity.</p>
<p>Mixing both into one "LLM-as-judge" score makes every incident look like a prompt problem. Many are index problems.</p>
<h2 id="build-a-golden-set">Build a golden set from real traffic</h2>
<p>Start with 40 to 80 questions from tickets, search logs, and sales calls. For each item store:</p>
<ul>
<li>The question in the user's words, including typos.</li>
<li>The document IDs that must be retrieved.</li>
<li>A short reference answer or a list of must-include facts.</li>
<li>A tag for risk: billing, security, medical, or general.</li>
</ul>
<p>Refresh the set when the product changes. A golden set that never grows becomes a souvenir.</p>
<h2 id="do-not-overfit">Do not evaluate only the questions you just fixed</h2>
<p>After you patch a failure, add it to the set, then run the whole set. Local wins are how teams destroy two other answers. Hold out a slice you do not tune against. That slice is the only number you should present as quality.</p>
<h2 id="judge-with-care">Use judges with care</h2>
<p>Model judges are useful for fluency and rough faithfulness. They are weak on domain facts and easy to bias with the rubric. Pair them with exact checks: schema, citation IDs, banned phrases, and numeric equality where it matters. A judge can assist. It should not be the only gate.</p>
<h2 id="takeaways">Takeaways</h2>
<ul>
<li>Score retrieval and generation on different axes.</li>
<li>Use real user questions, not only clean demo prompts.</li>
<li>Run the full set after every index, model, or prompt change.</li>
<li>Keep exact checks next to any LLM judge.</li>
</ul>
`,
  },
];

const drafts: PostDraft[] = [...ARCHIVE_POSTS, ...SAGAR_POSTS, ...recentDrafts];

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const postCountByAuthor = drafts.reduce<Record<string, number>>((counts, draft) => {
  counts[draft.authorUsername] = (counts[draft.authorUsername] || 0) + 1;
  return counts;
}, {});

const viewsByAuthor = drafts.reduce<Record<string, number>>((counts, draft) => {
  counts[draft.authorUsername] = (counts[draft.authorUsername] || 0) + draft.viewsCount;
  return counts;
}, {});

function authorForDraft(username: string) {
  const author = getAuthor(username);
  const posts = postCountByAuthor[username] || 0;
  const views = viewsByAuthor[username] || 0;
  return {
    ...author,
    postCount: posts,
    ...computeAuthorSocial(views, posts, author.createdAt),
  };
}

function toPost(draft: PostDraft): PostPublic {
  const tags = draft.tagSlugs.map(tag);
  const publishedAt = draft.publishedAt;
  return {
    id: draft.id,
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    contentHtml: draft.contentHtml.trim(),
    coverImageUrl: coverForSlug(draft.slug),
    readingTime: calculateReadingTime(stripHtml(draft.contentHtml)),
    viewsCount: draft.viewsCount,
    status: PostStatus.PUBLISHED,
    scheduledAt: null,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    author: authorForDraft(draft.authorUsername),
    tags,
  };
}

function toListItem(post: PostPublic): PostListItem {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    firstContentImageUrl: post.coverImageUrl,
    readingTime: post.readingTime,
    viewsCount: post.viewsCount,
    status: post.status,
    scheduledAt: post.scheduledAt,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    author: post.author,
    tags: post.tags,
  };
}

export const BLOG_POSTS: PostPublic[] = drafts
  .map(toPost)
  .sort((a, b) => +new Date(b.publishedAt || b.createdAt) - +new Date(a.publishedAt || a.createdAt));

export const BLOG_LIST: PostListItem[] = BLOG_POSTS.map(toListItem);

export const FEATURED_SLUGS = drafts.filter((draft) => draft.featured).map((draft) => draft.slug);

export function authorsWithCounts() {
  return AUTHORS.map((author) => authorForDraft(author.username)).sort(
    (a, b) => (b.followersCount || 0) - (a.followersCount || 0),
  );
}

export function tagsWithCounts(): TagPublic[] {
  return TAGS.map((item) => ({
    ...item,
    postCount: BLOG_POSTS.filter((post) => post.tags.some((t) => t.slug === item.slug)).length,
  }))
    .filter((item) => (item.postCount || 0) > 0)
    .sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
}
