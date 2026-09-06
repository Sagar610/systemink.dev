import { article } from './article';
import type { PostDraft } from './post-types';

const cover = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&h=900&fit=crop&q=80`;

export const SAGAR_POSTS: PostDraft[] = [
  {
    id: 'post-request-path',
    title: 'The request path is the product: a working model of online systems',
    slug: 'the-request-path-is-the-product',
    excerpt:
      'Most architecture diagrams start with boxes. Users start with a click. This is the model I have used since 2022 to design, review, and debug anything that has to answer in time.',
    coverImageUrl: cover('photo-1518770660439-4636190af475'),
    publishedAt: '2022-03-29T08:00:00.000Z',
    viewsCount: 64180,
    featured: true,
    tagSlugs: ['system-design', 'architecture', 'reliability'],
    authorUsername: 'sagargondaliya',
    contentHtml: article(
      'I joined SystemInk in March 2022 after a winter of incident reviews that all sounded different and were all the same. A cache, a queue, a new model, a rewritten checkout. The user had clicked. Something downstream had a long tail. We argued about the box that was fashionable that quarter. We should have started from the request.',
      [
        {
          id: 'start-from-the-click',
          title: 'Start from the click, not from the box',
          paragraphs: [
            'A product is a promise about time and correctness. The click will be answered, or it will not. It will be answered with the right number, or it will not. Everything else — the store, the model, the bus — is a means. When we start from a box we inherit that box’s concerns. When we start from the click we inherit the user’s.',
            'I draw the path as a single line first: edge, auth, the service that owns the verb, the stores it must read, the stores it must write, and the side effects that can wait. Then I mark each hop with a budget. If the sum of the budgets is larger than the user timeout, the design is already wrong. You can hide that on a slide. You cannot hide it on a launch day.',
            'This sounds obvious. It is not how most reviews run. Reviews wander into framework choice, into a new database, into a platform that will “remove the undifferentiated heavy lifting.” Those conversations have a place. They are not the first conversation. The first conversation is: what must be true when the response is written, and how long may we take to make it true?',
          ],
        },
        {
          id: 'synchronous-vs-async',
          title: 'What must be synchronous',
          paragraphs: [
            'If the user cannot see the next screen without a fact, that fact is synchronous. Payment captured. Permission checked. Inventory reserved. Search results for the query they typed. These reads and writes sit on the line. They get a deadline, a fallback, and an owner who is paged.',
            'If the user can see the next screen without a fact, that fact is asynchronous. Email. Recommendations refresh. “People also viewed.” Embedding a new document. Nightly digests. These belong on a queue with a job id and a way to see progress. Putting them on the line is how a launch turns a nice-to-have into an outage.',
            'Teams blur this line because the async work is more interesting. A model that rewrites a summary feels like the product. The product, for that click, was “show the thread.” The summary can arrive two seconds later in a slot that already has a skeleton. I have watched groups fight this for a quarter and then ship the skeleton anyway after the first timeout storm.',
          ],
        },
        {
          id: 'budgets',
          title: 'Budgets are design, not monitoring',
          paragraphs: [
            'A latency budget written after the service exists is a wish. A budget written before the service exists is a constraint the design can use. I keep a table: hop, p50, p99, owner, fallback. The p99 column is the one that changes architecture. A store that is fine at 8ms p50 and 400ms p99 cannot sit on a 300ms page budget. You will not fix that with a cache that misses on the cold keys users actually have.',
            'People treat p99 as a tail that “the platform will handle.” The tail is the product for anyone on a slow network, a large account, or a bad deploy. If you only watch the average you will ship a system that is fast in the office and rude in the world.',
            'When the sum does not fit, you do not add hardware first. You remove work from the line. Precompute. Denormalize. Return a partial. Move the model off the click. Those are design changes. They are cheaper than a larger instance type that still does the same seven sequential calls.',
          ],
        },
        {
          id: 'ownership-on-the-path',
          title: 'Ownership follows the path',
          paragraphs: [
            'A hop without an owner is a future incident with a group chat. The service that performs the verb owns the deadline for that hop. If it calls a store it does not own, it still owns the user-visible failure. That is uncomfortable. It is also the only model that produces a runbook a human can follow at 3am.',
            'Shared libraries do not own hops. Platforms do not own hops unless they are literally on the line and paged. I have been in reviews where six teams “shared” a client and none of them could change a timeout. The timeout was 30 seconds. The user had left after eight. Ownership that cannot change a number is not ownership.',
          ],
        },
        {
          id: 'failure-is-a-screen',
          title: 'Failure is a screen you have to design',
          paragraphs: [
            'The unhappy path is not an HTTP code. It is a sentence the UI can render. “We could not load your orders. Retry, or see yesterday’s list.” “Search is slow. Here are the last filters you used.” “The assistant is unavailable. Here is the policy page.” If you cannot write that sentence, you do not have a fallback. You have a spinner that becomes an apology tweet.',
            'I ask for the sentence in the review. If the room cannot produce it, we are not ready to talk about retries. Retries without a designed failure multiply load and delay the only honest answer the user needed: we cannot do this right now.',
          ],
        },
        {
          id: 'how-i-review',
          title: 'How I review a path in practice',
          paragraphs: [
            'I walk the line with four questions. What is the user trying to finish? What must be true for that finish? What can be wrong and still let them finish something smaller? Who is paged when the line breaks? If any answer is a shrug, we stop and write it down. The rest of the review — store choice, framework, model — waits.',
            'This is the piece I have sent to new teammates since the spring of 2022. The boxes change. The click does not. Design for the click and the boxes have to earn their place.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-rag-production',
    title: 'RAG in production: chunking, retrieval, and evaluation',
    slug: 'rag-in-production-chunking-retrieval-evaluation',
    excerpt:
      'A retrieval demo is a weekend. A retrieval system is a year of chunking policy, hybrid search, refusal, and an evaluation set you actually rerun. This is the long version of that year.',
    coverImageUrl: cover('photo-1515879218367-8466d910aaa4'),
    publishedAt: '2022-04-18T08:00:00.000Z',
    viewsCount: 58740,
    featured: true,
    tagSlugs: ['rag', 'retrieval', 'evaluation', 'llms'],
    authorUsername: 'sagargondaliya',
    contentHtml: article(
      'In April 2022 I was asked to “add a question box” to a corpus that already had a search team, a wiki, and a support org that did not trust either. The demo took three days. The first week with real users took the shine off it. People typed the way they talk. Documents contradicted each other. The model sounded sure. That is the gap this essay is about. Not the paper. The year after the paper meets a ticket queue.',
      [
        {
          id: 'the-demo-is-not-the-system',
          title: 'The demo is not the system',
          paragraphs: [
            'A retrieval-augmented generation demo has a comforting shape. You embed a folder. You ask a question. You get a paragraph and a citation. Stakeholders nod. The loop is real. It is also incomplete. It assumes the corpus is clean, the question is well formed, and the user will forgive a miss. None of those hold after launch.',
            'The first production users arrive with half a ticket ID, a product name that exists in three versions, and a policy that changed last Tuesday. They do not care that your recall@10 looked fine on a Wikipedia slice. They care that the answer told a customer the wrong refund window. At that point you do not have a model problem. You have a retrieval and measurement problem that the model is loudly amplifying.',
            'I treat the demo as a spike that must be thrown away in pieces. Keep the question of whether retrieval helps at all. Discard the chunker you copied from a tutorial. Discard the habit of stuffing the first five hits into a prompt and hoping. Build the system as if search engineers were going to review it, because they should.',
          ],
        },
        {
          id: 'chunking-is-a-product-decision',
          title: 'Chunking is a product decision',
          paragraphs: [
            'Chunk size looks like a preprocessing detail. It is not. It decides what the generator is allowed to see. A large chunk keeps the surrounding paragraph that made a sentence true, and dilutes the match so the right section never enters the top k. A small chunk matches cleanly and arrives without the exception clause that sat in the next heading. Both failures look like “the model hallucinated.” Both started in the splitter.',
            'I do not pick a token number and walk away. I split on document structure first: titles, headings, tables, API blocks, and the captions that explain them. I keep identifiers with the claim they describe. A policy ID without the rule is a retrieval hit that cannot be used. A table cell without its column header is a number with no meaning. Those are product decisions. Different desks in the same company should not share one splitter.',
            'Metadata is part of the chunk. Product, region, version, language, and last-updated time are not nice-to-haves. They are the difference between answering from last year’s policy and this year’s. If your index cannot filter, your prompt will try to, and the prompt will lose. Store the raw text, the chunker version, and the embedding model name next to the vector. You will change all three, and you will need to know which answer came from which combination.',
            'Re-chunk when the corpus changes shape. A one-time job against a dump of HTML will rot as soon as someone starts publishing in a new template. Treat the chunker as a versioned component with a backfill, not as a script that ran once on a laptop.',
          ],
        },
        {
          id: 'retrieval-is-more-than-top-k',
          title: 'Retrieval is more than top-k',
          paragraphs: [
            'Vector search is a recall tool. It is not a ranking system. Approximate neighbors in an embedding space will surface related language. They will also surface the wrong tenant’s contract if you were sloppy, and they will bury an exact identifier match that lexical search would have put first. For internal docs, tickets, and policies, hybrid search — lexical plus dense — has beaten either method alone in every corpus I have been allowed to measure.',
            'A reranker on the top twenty to fifty hits is often the cheapest quality win available. It is also the step teams skip because the demo looked fine without it. The demo used questions written by the people who wrote the documents. Production uses questions written by people who are lost. Those are different distributions. The reranker is how you spend a little more compute on the difference.',
          ],
        },
        {
          id: 'the-pipeline',
          title: 'A pipeline I will defend in a review',
          paragraphs: [
            'The live path I want is short enough to draw from memory. Normalize the query. Expand it if the query is a fragment. Apply tenant and metadata filters before you search. Run hybrid retrieval. Rerank a small set. Pack the context into a token budget you have measured. Generate. Cite. If nothing cleared a score, refuse.',
          ],
        },
        {
          id: 'ground-or-refuse',
          title: 'Ground the answer or refuse',
          paragraphs: [
            'Users forgive a clear “I do not have this in the source set.” They do not forgive a fluent paragraph that invents a number. Require citations that map to retrieved chunk IDs, not to a decoration at the bottom of the page. If the generator cannot point at a span, the UI should not show the prose. That is a product rule, not a model preference.',
            'Refusal is a feature. It is also a metric. If refusal rate jumps after an index rebuild, you have a retrieval incident. If refusal rate is near zero on a messy corpus, you have a honesty incident. I would rather explain a refusal to a stakeholder than explain a fabricated policy to a customer.',
          ],
        },
        {
          id: 'evaluate-on-your-questions',
          title: 'Evaluate on your own questions',
          paragraphs: [
            'Public leaderboards measure someone else’s corpus and someone else’s idea of a good answer. They are useful as a smell test. They are useless as a ship gate. Build a golden set from real tickets, search logs, and sales calls. Keep the typos. Keep the angry phrasing. Those are the queries you will get.',
            'Score retrieval and generation on different axes. Did the right passage appear in the context? That is retrieval. Did the answer stay faithful to the context it was given? That is generation. A pretty answer with the wrong source is a retrieval failure. Mixing both into one “AI quality” number will send you to rewrite a prompt when you needed to fix the index.',
            'Hold out a slice you do not tune against. Present that number in reviews. Version the set when you add a question. Comparing last month’s score to this month’s after you rewrote the rubric is how teams talk themselves into a launch. I have done this. It is why I now treat the holdout as the only number that counts as a claim.',
          ],
        },
        {
          id: 'operations',
          title: 'Operations that retrieval teams skip',
          paragraphs: [
            'An index is a production store. It needs an alias, a backfill, a rollback, and a person who is paged when freshness breaks. Dual-write when you change embedding models. Never mix two spaces in one collection. Swap the alias when eval passes. Users should not meet a half-built set of neighbors.',
            'Log the retrieved IDs, scores, chunker version, and prompt version on every turn. When someone says the answer was wrong, you should be able to open that turn in a minute. If you cannot, you are debugging folklore.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['I still use this list when a team asks me to look at their question box.'],
          list: [
            'Chunk for how people ask, and for the structure the document actually has.',
            'Hybrid search and a reranker before you fine-tune anything.',
            'Refuse when evidence is weak. Silence is better than a clean hallucination.',
            'Score retrieval and generation separately, on questions you did not write in a hallway.',
            'Treat the index like a database: alias, backfill, rollback, owner.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-queues-and-truth',
    title: 'Queues, idempotency, and the stories we tell about async',
    slug: 'queues-idempotency-and-async-truth',
    excerpt:
      'An event is a rumor until a consumer, a retry, and a poison path exist. This is a long look at the async work that sits next to the request path — and how it quietly becomes the product.',
    coverImageUrl: cover('photo-1558494949-ef010cbdcc31'),
    publishedAt: '2022-05-16T08:00:00.000Z',
    viewsCount: 49210,
    featured: false,
    tagSlugs: ['distributed-systems', 'system-design', 'architecture', 'reliability'],
    authorUsername: 'sagargondaliya',
    contentHtml: article(
      'By May 2022 I had sat in enough “we will just emit an event” reviews to write this down. Events are a transport. They are not a design. The design is the consumer, the schema, the retry, the inbox, and the human who opens the dead letter at 11:40 on a Thursday. If you cannot name those, you do not have an architecture. You have a publish call and optimism.',
      [
        {
          id: 'why-async-exists',
          title: 'Why the work left the request',
          paragraphs: [
            'We move work off the click for three honest reasons: it is slow, it is bursty, or it is someone else’s deadline. Email is someone else’s deadline. Re-embedding a corpus is slow. A fan-out that touches twenty accounts is bursty. Those belong on a queue. We also move work off the click for a dishonest reason: the review was running long and “async” ended the argument. That is how you get a payment capture that is “eventually consistent” with a customer who is not.',
            'Write the reason next to the topic name. If the reason is “the request was getting fat,” say what you removed and what the user sees instead. If you cannot describe the user-visible state while the job is in flight, you are not ready to enqueue it.',
          ],
        },
        {
          id: 'at-least-once',
          title: 'At-least-once is the contract. Design for it.',
          paragraphs: [
            'Brokers deliver again. Networks replay. A crash after the side effect and before the ack will replay. This is not a defect. It is the world. Exactly-once is a phrase that belongs in a paper and in a very small number of ledgers that still have to be idempotent underneath. For the rest of us, the handler must be safe to run twice.',
            'Idempotency is not a header you turn on. It is a unique key and a place you record that the work finished. An inbox table keyed by event id. A natural key: this order, this email template, this day. If a payment event can arrive twice, the ledger must not move twice. If a welcome email can arrive twice, the user must not get two. Those are different keys. Write them down before you pick the broker.',
            'People ask for “dedupe at the bus.” The bus does not know your domain. It can help with delivery. It cannot know that two different event ids describe the same refund. That knowledge lives in your table.',
          ],
        },
        {
          id: 'poison',
          title: 'The poison message is a certainty',
          paragraphs: [
            'One bad payload will stall a partition if you let it. Give it a retry budget with jitter, then a dead-letter path, then a runbook that names a person. “We will look at CloudWatch” is not a path. A queue you can browse, a schema error you can read, and a way to skip or fix the record are a path.',
            'I have lost mornings to a consumer that retried a null pointer into the same poison for six hours while the good messages behind it aged out of an SLA. The fix was not a smarter retry. The fix was a dead letter we should have built in the first week.',
          ],
        },
        {
          id: 'ordering',
          title: 'Ordering is a product sentence',
          paragraphs: [
            '“Events are ordered” is not a sentence a product owner can use. “A user’s profile updates apply in the order they were saved” is. “Payments for one merchant are processed in sequence; payments across merchants are not” is. Write the sentence. Then see whether your partitions actually give you that. If they do not, either change the key or change the promise. Do not leave a gap for an incident to fill.',
            'Global order is expensive and usually unnecessary. Per-entity order is often enough. No order plus idempotent folding is sometimes enough. The mistake is to assume you have the first while implementing the third.',
          ],
        },
        {
          id: 'schema',
          title: 'Schema is how teams stay polite',
          paragraphs: [
            'A payload without a version is a future argument. Add fields as optional. Remove fields only after the last consumer that reads them is gone. Name an owner for the event type. When someone wants a new field “real quick,” the owner can say no, or can add it in a way that does not break Friday’s job.',
            'I want the consumer name in the metadata. When the thing breaks I want to know who to call before I know why. “Someone will pick it up” is how you get two writers and no reader, or seven readers and a schema nobody will change.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Async work is still product work. It just has a worse debugger.'],
          list: [
            'Name why the work left the request, and what the user sees while it is in flight.',
            'Design handlers for at-least-once. Put the unique key in your database.',
            'Dead-letter is part of the design, not an afterthought.',
            'Write the ordering promise in product language, then check the partition key.',
            'Version the schema. Name the consumer. Page a human.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-llm-fail-safe',
    title: 'Designing LLM systems that fail safely',
    slug: 'designing-llm-systems-that-fail-safely',
    excerpt:
      'Language models fail in ways that look successful. Timeouts, budgets, fallbacks, and a schema in front of every side effect are not extras. They are the product.',
    coverImageUrl: cover('photo-1518770660439-4636190af475'),
    publishedAt: '2022-06-14T08:00:00.000Z',
    viewsCount: 53460,
    featured: true,
    tagSlugs: ['llms', 'system-design', 'architecture', 'artificial-intelligence'],
    authorUsername: 'sagargondaliya',
    contentHtml: article(
      'Classical services fail loudly. A payment API returns 502. A cache miss is measurable. A language model can fail while still producing a complete, well-formed paragraph. That is the design problem I have been circling since mid-2022: the happy path and the failure path look the same at the HTTP layer. If you treat the model as a reliable function, you will ship a product that is confident at the worst possible moment.',
      [
        {
          id: 'define-the-contract',
          title: 'Define the contract before the prompt',
          paragraphs: [
            'Write down what the system is allowed to do. A summarizer may compress. It may not invent a figure. A support assistant may quote policy. It may not offer a refund. A coding helper may propose a patch. It may not apply it without a review step. Those sentences belong in product and policy first. Then they belong in the orchestration layer. Then, and only then, they may also appear in a system prompt.',
            'A prompt is a weak control plane. Users can talk around it. A long context can bury it. A model update can change how it is followed. If a behavior must never happen, do not ask the model to remember it. Disable the tool. Filter the output. Refuse the action. I have watched teams lengthen a prompt for six weeks to stop a refund the model was never supposed to be able to issue. The rule belonged in the tool layer on day one.',
          ],
        },
        {
          id: 'timeouts-and-budgets',
          title: 'Timeouts, retries, and budgets',
          paragraphs: [
            'Model latency has a long tail. A p95 of two seconds and a p99 of twelve is a common shape, and it will move without asking you. Set a deadline that the rest of the page can live with. Retry only on transport failures, not on low-quality text. A retry of a bad answer is a second bill and a second chance to be wrong.',
            'Cap tokens per request and per user. A single runaway conversation should not drain the monthly budget. Deduplicate with a request id so a client retry does not become two complete generations. Log input tokens, output tokens, model, cache hit, and tenant. Without those five fields you cannot explain a spike, and you will have a spike.',
            'Retries that resend the same prompt after a slow success will double cost and confuse traces. I have done this. The fix is boring: an idempotency key and a cache of in-flight work. Boring is the point.',
          ],
        },
        {
          id: 'fallback-paths',
          title: 'Design the fallback path as a real product',
          paragraphs: [
            'When the model is down, slow, or ungrounded, the product still has to do something. Return a structured “cannot complete” state the UI already knows how to render. Fall back to a smaller model or a deterministic template. Hand the user a search result or a human queue. Do not hand them an empty spinner and a hope that the provider recovers before they close the tab.',
            'A fallback that is slightly worse and always available beats a premium model that vanishes under load. I would rather ship a lexical search box that works on the worst Tuesday than an assistant that is magical on Monday and silent on Tuesday. Feature flags that disable the model without a deploy are part of this design. Practice them. If the only option is hope, you do not have a runbook.',
          ],
        },
        {
          id: 'never-trust-raw-text',
          title: 'Never trust raw model text as a side effect',
          paragraphs: [
            'If the output can trigger a tool, a refund, or a database write, parse it into a schema first. Reject unknown fields. Cap quantities. Keep a human or policy check on irreversible actions. Tool use without validation is remote code execution with extra steps. The model is untrusted input. We already know how to treat untrusted input. We should not forget because the input is eloquent.',
            'I want an allow-list of tools, not a toolbox the model can see in full. Search, read, create-draft. Not delete, refund, or email-everyone. If a tool is irreversible, require a confirmation the model cannot click for the user. This is not a lack of ambition. It is how you still have a company after the first helpful accident.',
          ],
        },
        {
          id: 'observe-the-right-thing',
          title: 'Observe faithfulness, not only HTTP success',
          paragraphs: [
            'A 200 from the provider means the bytes arrived. It does not mean the user got a useful, grounded answer. Trace the whole turn: rewrite, retrieve, generate, tools. Record chunk IDs and the prompt version. Sample by risk. Review money, legal, and medical answers at a higher rate. Alert on eval drift after you ship a change, not on a feeling that “the model got worse.”',
            'Keep reliability metrics and quality metrics apart. A fast, cheap, wrong answer will look green on a single “AI health” chart. That chart will lie to you until a customer does not.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['I keep this next to the request-path essay. They are the same discipline applied to a noisier dependency.'],
          list: [
            'Write the contract in product language before you write the prompt.',
            'Deadline, token budget, request id. Retry transport, not taste.',
            'Ship a fallback the UI can render without the model.',
            'Schema-validate anything that can change state.',
            'Measure faithfulness and retrieval, not only status codes.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-retrieval-platform',
    title: 'Building a retrieval platform a search team will not hate',
    slug: 'building-a-retrieval-platform-search-teams-trust',
    excerpt:
      'Retrieval is not a wrapper around a vector database. It is an ingest path, an identity scheme, a query contract, and an eval gate. This is how I would start that platform in 2022 — and how I would refuse to start it.',
    coverImageUrl: cover('photo-1454165804606-c3d57bc86b40'),
    publishedAt: '2022-07-25T08:00:00.000Z',
    viewsCount: 41890,
    featured: false,
    tagSlugs: ['retrieval', 'vector-search', 'system-design', 'architecture'],
    authorUsername: 'sagargondaliya',
    contentHtml: article(
      'July 2022. Every conversation about “AI search” wanted a new database. Almost none wanted to talk about document identity, filters, or who would own a miss. I had come up through systems work, not through a lab, and I was tired of watching search teams get handed an index they were not allowed to debug. This is the platform I will defend: small, measured, and boring in the places search has already been boring for twenty years.',
      [
        {
          id: 'identity',
          title: 'Identity first, embeddings second',
          paragraphs: [
            'Every chunk needs a stable primary key derived from the source document and the section path. When a page is edited, you upsert that key. When a page is deleted, you delete by prefix. Without stable IDs, rebuilds create duplicates and stale answers linger until someone notices a citation that no longer opens. I have seen that linger for weeks. Users do not describe it as an index problem. They describe it as the product lying.',
            'The key is also how you explain a miss. If you cannot go from a bad answer to a chunk id to a source URL to a version, you are not operating a platform. You are operating a pile of floats.',
          ],
        },
        {
          id: 'two-indexes',
          title: 'Plan for two indexes from day one',
          paragraphs: [
            'Lexical and dense solve different misses. An order ID, an error code, a precise product name — lexical. A vague “why was I charged twice” — dense, then a rerank. If you only build the dense path you will fail the first class of query and call it a model limitation. If you only build the lexical path you will fail the second and call it a synonym problem. Build both. Share the filters. Share the IDs. Argue about weights with a golden set, not with a vibe.',
            'Filters belong in the engine. Tenant, language, product, and document type should be applied before you spend the approximate search. Post-filtering a top-20 list is how you return zero results for a query that had matches. Search people have been saying this since before embeddings were a product. Listen to them.',
          ],
        },
        {
          id: 'ingest',
          title: 'Ingest is a product surface',
          paragraphs: [
            'Writers, legal, and support will publish in formats you did not design for. The ingest path must accept a document, reject it with a reason, or accept it with a warning. Silent drop is how a policy update never reaches the index and a model keeps quoting the old one. Freshness is a promise. Name it. “Searchable within fifteen minutes of publish” is a sentence you can page on. “We re-embed nightly” is a sentence you should say out loud so nobody is surprised.',
            'Keep a raw store. The index is a projection. When the chunker changes, you replay from raw. When a lawyer asks what the assistant could have seen last Tuesday, you have an answer. If the only copy is the vector, you have a story.',
          ],
        },
        {
          id: 'query-contract',
          title: 'The query contract',
          paragraphs: [
            'Callers should not know which engine won. They send a query, a tenant, filters, and a budget. They receive IDs, scores, text, and a debug payload that is off by default. The debug payload is how you teach a new engineer to explain a miss in one sitting. If the platform cannot explain a miss, it will be bypassed, and you will have seven private indexes again.',
            'Do not embed the query with a different model than the index. Do not change the chunker on ingest and leave the query path on last month’s assumptions. Those two sentences have prevented more incidents than any dashboard I have added later.',
          ],
        },
        {
          id: 'eval-gate',
          title: 'Nothing ships without the gate',
          paragraphs: [
            'A model upgrade is a migration. A chunker change is a migration. An analyzer change is a migration. Dual-write or build behind an alias. Run the golden set. Swap. If the holdout drops, you do not swap. This is how search teams have shipped analyzers for years. Retrieval platforms that skip it are not faster. They are unaudited.',
            'I will not accept “the demo looked better” as a gate. I will accept a table: question, old IDs, new IDs, a human note on the misses. That table takes an afternoon. The incident it prevents takes a week.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['If a vector database is the first purchase, you are starting in the middle.'],
          list: [
            'Stable IDs, raw store, named freshness.',
            'Lexical and dense, shared filters, rerank a small set.',
            'A query contract that can explain a miss.',
            'Alias, eval, swap. No mixing of embedding spaces.',
            'Give search engineers a seat. They have already paid for these lessons.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-incident-reviews',
    title: 'Incident reviews that change the next design',
    slug: 'incident-reviews-that-change-the-next-design',
    excerpt:
      'A review that ends in “we will be more careful” will visit you again. This is the format I have used since 2022: timeline, constraint, decision, and a change that would have made this incident boring.',
    coverImageUrl: cover('photo-1504868584819-f8e8b4b6d7e3'),
    publishedAt: '2022-08-15T08:00:00.000Z',
    viewsCount: 38620,
    featured: false,
    tagSlugs: ['reliability', 'observability', 'architecture', 'system-design'],
    authorUsername: 'sagargondaliya',
    contentHtml: article(
      'August 2022 closed a summer of incidents that were not novel. A timeout we had never written down. A retry that amplified a dependency. A cache that served a deleted permission. A model that was “up” and useless. The write-ups were long. The designs did not move. I got tired of reading my own adjectives. This is the shorter ritual I wanted instead — and the longer reasoning behind it.',
      [
        {
          id: 'what-a-review-is-for',
          title: 'What a review is for',
          paragraphs: [
            'An incident review is not a performance. It is not a court. It is a design meeting with a date attached. The only output that matters is a change to a path, a budget, a fallback, or an owner. If the output is a reminder to be careful, you have written a blog comment, not a review.',
            'I keep blamelessness because it is practical, not because it is fashionable. People who expect punishment will hide the half of the timeline that would have taught you something. You need that half. You can still be clear about a missing test, a missing owner, a timeout that was never set. Clarity is not blame. It is how the next person does not repeat you.',
          ],
        },
        {
          id: 'the-timeline',
          title: 'The timeline is the artifact',
          paragraphs: [
            'Write what the user saw, then what the system did, then what the humans did, in order, with clocks. Not a narrative of how we felt. A sequence. “14:02 checkout p99 crossed 4s. 14:06 on-call opened the trace. 14:11 we saw the new retry on the recommendation hop. 14:19 we disabled the hop. 14:27 p99 returned.” That sequence is enough to find the decision that was missing beforehand: the hop should never have been on the line, or the retry should have had a budget.',
            'If you cannot write the timeline, you do not have observability. That is a finding. It is often the finding. Do not skip it to get to the “root cause” slide. Root cause is usually a story we tell after we already know what we wish we had built.',
          ],
        },
        {
          id: 'one-constraint',
          title: 'Name the constraint that was violated',
          paragraphs: [
            'Every serious incident I still remember violated a constraint we had not written: a page budget, a consistency policy, an ownership line, a freshness promise. Write the constraint as it should have existed. “Authz data may not be served stale.” “The assistant may not answer without a citation.” “p99 of checkout stays under 800ms including dependencies.” Then ask whether the current design can keep that constraint on a bad day. If it cannot, the action item is a design change, not a dashboard.',
            'Multiple constraints can break at once. Pick the one that, if it had been enforced, would have made this incident small. You can file the others. You cannot fix a culture in one review. You can add a deadline to one hop.',
          ],
        },
        {
          id: 'the-change',
          title: 'The change should make this boring next time',
          paragraphs: [
            'Good actions are mechanical. A timeout. A flag. A filter in the index. An inbox table. A holdout set. A page on freshness. Bad actions are attitudinal. “Improve awareness.” “Document best practices.” “Sync with the vendor.” I have written those. They do not survive a reorg. A timeout does.',
            'Assign the change to a service, not to a slack channel. Give it a date that is close. If it cannot be done this month, say what smaller change can. A review with a six-month action and no this-week action is a pause button.',
          ],
        },
        {
          id: 'connect-to-design',
          title: 'Connect it back to the path',
          paragraphs: [
            'I read incidents against the same model I use in design reviews: the click, the hops, the budgets, the fallback sentence. If the incident does not change one of those, it will return wearing a different box. A new model, a new store, a new bus. Same click. Same missing sentence.',
            'That is why I wanted this journal to exist. Not to collect postmortems. To keep a public record of the constraints we keep relearning. The boxes will keep changing. The click will not. Write the constraint down, change the path, and move on.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['This is the checklist I print when I am the scribe.'],
          list: [
            'Timeline first, with user-visible symptoms on the clock.',
            'Name the constraint that should have existed.',
            'One mechanical change that would have made this incident small.',
            'Owner and a near date. No “be more careful.”',
            'Update the request-path diagram, or you will meet this again.',
          ],
        },
      ],
    ),
  },
];
