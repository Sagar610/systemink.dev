import { article } from './article';
import type { PostDraft } from './post-types';

const cover = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&h=900&fit=crop&q=80`;

export const ARCHIVE_POSTS: PostDraft[] = [
  {
    id: 'post-why-systemink',
    title: 'Why we started SystemInk',
    slug: 'why-we-started-systemink',
    excerpt:
      'April 2021. We wanted a place for working engineers to write about systems with the same care they give production, and without the launch-week tone.',
    coverImageUrl: cover('photo-1486312338219-ce68d2c6f44d'),
    publishedAt: '2021-04-19T08:00:00.000Z',
    viewsCount: 92140,
    featured: true,
    tagSlugs: ['architecture', 'system-design'],
    authorUsername: 'priyavenkatesh',
    contentHtml: article(
      'In the spring of 2021 we were tired of two kinds of writing. Vendor posts that promised a platform would remove the hard parts. Conference talks that ended before the on-call rotation began. SystemInk started as a small independent journal for the middle of that story: the year after the rewrite, the week after the incident, the design that had to live with last year’s choices.',
      [
        {
          id: 'what-we-publish',
          title: 'What we publish',
          paragraphs: [
            'We look for pieces an engineer can take back to a design review. That usually means a concrete failure mode, a constraint, and a decision someone can disagree with. We are not a news desk. We are not a changelog.',
          ],
          list: [
            'Systems that stayed up, and why.',
            'Systems that did not, and what changed after.',
            'The unfashionable topics: ownership, queues, eval, cost.',
          ],
        },
        {
          id: 'how-we-edit',
          title: 'How we edit',
          paragraphs: [
            'Every essay is edited for claims, not for personality. If a number cannot be checked, it comes out. If a tool is named, we say what we used it for. Writers keep their voice. The journal keeps a house style that prefers short sentences and named trade-offs.',
          ],
        },
        {
          id: 'still-here',
          title: 'Still here',
          paragraphs: [
            'Five years later the topics shifted from caches and feature stores toward retrieval and language models. The editorial test did not. If it will not help someone ship a safer system next quarter, it is not for this site.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-caches-fail-closed',
    title: 'Designing caches that fail closed',
    slug: 'designing-caches-that-fail-closed',
    excerpt:
      'A cache that serves stale authorization or a missing row as truth is worse than no cache. Fail closed, and measure the miss path like it is the product.',
    coverImageUrl: cover('photo-1558494949-ef010cbdcc31'),
    publishedAt: '2021-05-11T08:00:00.000Z',
    viewsCount: 77420,
    featured: false,
    tagSlugs: ['architecture', 'system-design', 'reliability'],
    authorUsername: 'marcuschen',
    contentHtml: article(
      'Most cache incidents I have been called for were not capacity problems. They were correctness problems. The cache returned something the origin would never have returned, and the application believed it.',
      [
        {
          id: 'stale-is-a-policy',
          title: 'Stale is a policy, not a default',
          paragraphs: [
            'TTL is a guess. For product copy, a slightly old page is fine. For permissions, prices, and feature flags, it is not. Write the policy in the code next to the key, not in a wiki. If the origin is down, decide in advance whether you serve last-known-good or you fail the request.',
          ],
        },
        {
          id: 'negative-caching',
          title: 'Negative caching is sharp',
          paragraphs: [
            'Caching “not found” stops a thundering herd. It also hides a row that was written a second later. Keep negative TTLs short. Never cache an error status as if it were a document. An origin 500 is not a 404.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['The miss path is part of the product. Load-test it. Alert on it. Do not discover it during a provider outage.'],
          list: [
            'Name the consistency you are buying with each key.',
            'Fail closed on auth and money.',
            'Treat origin errors as errors, not as cacheable facts.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-event-driven',
    title: 'Event-driven systems without the mystery',
    slug: 'event-driven-systems-without-the-mystery',
    excerpt:
      'Events are a transport. They are not an architecture. If you cannot draw the consumer, the retry, and the poison message, you do not have a design yet.',
    coverImageUrl: cover('photo-1518770660439-4636190af475'),
    publishedAt: '2021-07-02T08:00:00.000Z',
    viewsCount: 61280,
    featured: false,
    tagSlugs: ['architecture', 'system-design', 'distributed-systems'],
    authorUsername: 'danielokonkwo',
    contentHtml: article(
      'Teams adopt events because they want decoupling. What they often get is a graph nobody can operate. The publish looks clean in the diagram. The consumer is a two-year-old Lambda with a silent retry and a side effect that is not idempotent.',
      [
        {
          id: 'name-the-consumer',
          title: 'Name the consumer',
          paragraphs: [
            'Every event type needs an owner, a schema, and a documented failure mode. “Someone will pick it up” is how you get two writers and no reader. Put the consumer name in the event metadata. When it breaks, you should know who to call before you know why.',
          ],
        },
        {
          id: 'once-is-a-lie',
          title: 'Exactly once is a lie you can work around',
          paragraphs: [
            'Design for at-least-once. Make the handler idempotent. Use an inbox table or a natural unique key. If a payment event can be delivered twice, the ledger must not move twice. That is ordinary systems work. It is not a broker feature you turn on.',
          ],
        },
        {
          id: 'poison',
          title: 'Plan for the poison message',
          paragraphs: [
            'One bad payload will stall a partition. Give it a dead-letter path and a human runbook. If your “async architecture” has no place to look at a failed event, it is a queue with hope attached.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-service-ownership',
    title: 'A working model of service ownership',
    slug: 'a-working-model-of-service-ownership',
    excerpt:
      'Ownership is not a name in a spreadsheet. It is who can change the service, who is woken up, and who can say no to a dependency.',
    coverImageUrl: cover('photo-1497366216548-37526070297c'),
    publishedAt: '2021-09-14T08:00:00.000Z',
    viewsCount: 54810,
    featured: false,
    tagSlugs: ['architecture', 'system-design'],
    authorUsername: 'priyavenkatesh',
    contentHtml: article(
      'I have sat in reviews where six teams claimed a service and none of them could ship a one-line fix. Ownership had become a label. The on-call channel was a group chat. The deploy keys lived with a platform team that did not know the domain.',
      [
        {
          id: 'three-questions',
          title: 'Three questions that settle it',
          paragraphs: ['If you cannot answer these, you do not own the service yet.'],
          list: [
            'Who can merge and deploy without asking?',
            'Who is paged, and do they have a runbook that works at 3am?',
            'Who can refuse a new dependency because they will carry it?',
          ],
        },
        {
          id: 'shared-is-unowned',
          title: 'Shared is usually unowned',
          paragraphs: [
            'A “common library” with fourteen consumers and no steward will rot in public. Either give it a team with time, or copy the twenty lines and move on. Platform teams can own paved roads. They cannot own every shortcut.',
          ],
        },
        {
          id: 'write-it-down',
          title: 'Write it where deploys happen',
          paragraphs: [
            'Put the owning team in the service catalog and in the repo. Review it when people leave. Ownership that lives only in a slide will not survive a reorg.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-search-ranking',
    title: 'Search ranking is a product problem',
    slug: 'search-ranking-is-a-product-problem',
    excerpt:
      'Relevance is not a score you maximize. It is a promise about what the first ten results are for. Engineering cannot invent that promise alone.',
    coverImageUrl: cover('photo-1454165804606-c3d57bc86b40'),
    publishedAt: '2021-10-08T08:00:00.000Z',
    viewsCount: 48920,
    featured: true,
    tagSlugs: ['retrieval', 'system-design'],
    authorUsername: 'elenavarga',
    contentHtml: article(
      'I have watched teams spend a quarter tuning BM25 weights while the product question sat unanswered: is this search for navigation, for discovery, or for support? Those three jobs want different first results. A single nDCG number will not tell you which job you failed.',
      [
        {
          id: 'name-the-job',
          title: 'Name the job of the box',
          paragraphs: [
            'If users type an order ID, they want that order. If they type “refund,” they want a policy and a button. If they type a vague product name, they want a short list they can scan. Write those jobs down. Measure them separately. A ranking change that helps discovery can wreck navigation.',
          ],
        },
        {
          id: 'lexical-first',
          title: 'Start with lexical search you can explain',
          paragraphs: [
            'In 2021 we already had embeddings in research talks. In production, a well-analyzed lexical index with synonyms and filters still paid the rent. You can debug it. You can explain a miss. Add learning-to-rank when you have labeled sessions, not because a paper said to.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Engineering owns the index. Product owns the promise of the first page. Meet every week over real queries, not over a dashboard average.'],
        },
      ],
    ),
  },
  {
    id: 'post-feature-stores',
    title: 'Feature stores before they were fashionable',
    slug: 'feature-stores-before-they-were-fashionable',
    excerpt:
      'A feature store is a contract between training and serving. If that contract is a CSV in a bucket, you will spend the next incident proving the model saw different numbers than the service.',
    coverImageUrl: cover('photo-1551288049-bebda4e38f71'),
    publishedAt: '2021-12-06T09:00:00.000Z',
    viewsCount: 44110,
    featured: false,
    tagSlugs: ['mlops', 'architecture', 'system-design'],
    authorUsername: 'aisharahman',
    contentHtml: article(
      'By late 2021 every company I advised had a model in production and a spreadsheet explaining the features. The spreadsheet was wrong. Training had a join that serving approximated. The model was blamed. The join was guilty.',
      [
        {
          id: 'one-definition',
          title: 'One definition, two clocks',
          paragraphs: [
            'A feature needs a name, a type, a point-in-time rule, and an owner. Training reads history. Serving reads now. Those clocks must share the definition. If serving computes “days since last order” with a different timezone than training, you do not have a feature. You have two features with one name.',
          ],
        },
        {
          id: 'skew',
          title: 'Skew is the default',
          paragraphs: [
            'Assume training-serving skew until you prove otherwise. Log the feature vector on a sample of live requests and compare it to a batch rebuild. The first time you do this you will find a bug. The tenth time you will find another.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Buy or build the store later. Write the contract now. A documented feature with a test beats a platform nobody trusts.'],
        },
      ],
    ),
  },
  {
    id: 'post-data-contracts',
    title: 'Data contracts between teams',
    slug: 'data-contracts-between-teams',
    excerpt:
      'A pipeline without a contract is a rumor. Schema, freshness, and a pager belong on the table before the dashboard does.',
    coverImageUrl: cover('photo-1460925895917-afdab827c52f'),
    publishedAt: '2022-04-18T08:00:00.000Z',
    viewsCount: 31890,
    featured: false,
    tagSlugs: ['architecture', 'system-design', 'distributed-systems'],
    authorUsername: 'tomasherrera',
    contentHtml: article(
      'The warehouse looks shared. The pain is not. One team changes a column type on a Friday. Another team’s Monday job fails silently and a metric goes flat. Nobody is wrong in their own repo. The interface was never written down.',
      [
        {
          id: 'what-a-contract-is',
          title: 'What a contract actually contains',
          paragraphs: [
            'A name, a schema, a primary key, an allowed late window, and a person who is woken if freshness breaks. Optional fields need a policy. Breaking changes need a version. If this sounds like an API, that is because it is one, only slower.',
          ],
        },
        {
          id: 'consume-with-tests',
          title: 'Consume with tests',
          paragraphs: [
            'Downstream jobs should fail on unexpected nulls and type changes, not “cast and hope.” A contract test in CI on a fixture is cheap. A week of wrong revenue is not.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Treat tables like APIs. Version them. Page someone. The dashboard is a reader, not the design.'],
        },
      ],
    ),
  },
  {
    id: 'post-observability-engineers-use',
    title: 'Observability that engineers actually use',
    slug: 'observability-that-engineers-actually-use',
    excerpt:
      'A wall of dashboards is not observability. A trace you can open during an incident is. Start from the question, not from the vendor checklist.',
    coverImageUrl: cover('photo-1551288049-bebda4e38f71'),
    publishedAt: '2022-03-03T09:00:00.000Z',
    viewsCount: 38240,
    featured: false,
    tagSlugs: ['observability', 'reliability', 'system-design'],
    authorUsername: 'naomifeldman',
    contentHtml: article(
      'I joined a company in 2022 with 214 dashboards and a four-hour mean time to “we think it is DNS.” The charts were beautiful. Nobody trusted them. The useful work was a single request ID you could follow from the edge to the database.',
      [
        {
          id: 'three-signals',
          title: 'Three signals, used hard',
          paragraphs: [
            'RED or USE is enough for most services: rate, errors, duration, or utilization, saturation, errors. Add business signals next: checkout started, checkout paid. If a chart is not in a runbook, delete it or move it to a folder named archaeology.',
          ],
        },
        {
          id: 'traces',
          title: 'Traces beat folklore',
          paragraphs: [
            'Propagate a request ID. Sample enough of the slow path to debug p99. When an incident starts, the first ten minutes should be spent in a trace, not in a debate about which graph is the real one.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Observability is the ability to ask a new question during a failure. If you cannot do that, you have monitoring theater.'],
        },
      ],
    ),
  },
  {
    id: 'post-serving-models',
    title: 'Serving models without a research cluster',
    slug: 'serving-models-without-a-research-cluster',
    excerpt:
      'Most product models do not need a special fleet. They need a boring HTTP service, a pin, a rollback, and a latency budget.',
    coverImageUrl: cover('photo-1518770660439-4636190af475'),
    publishedAt: '2022-07-21T08:00:00.000Z',
    viewsCount: 29440,
    featured: false,
    tagSlugs: ['mlops', 'architecture', 'reliability'],
    authorUsername: 'kenjisato',
    contentHtml: article(
      'I have seen a 40MB classifier wrapped in a platform that needed three specialists to deploy. The model was not the hard part. The hard part was treating inference like a one-off science project instead of a service.',
      [
        {
          id: 'pin-the-artifact',
          title: 'Pin the artifact',
          paragraphs: [
            'A model is a build artifact with a hash. The service loads that hash. The previous hash stays around for rollback. “Latest” is not a version. If training and serving disagree about the file, you will not notice until a metric moves and nobody can reproduce it.',
          ],
        },
        {
          id: 'budget',
          title: 'Give it a latency budget',
          paragraphs: [
            'Decide the p99 before you pick a framework. Batch if you must, but do not surprise the request path with a 400ms stall while a batch fills. Shadow the new model. Compare scores. Then switch the pin.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Serve models the way you serve any other binary. The research cluster is for training. Production is for pins, budgets, and rollbacks.'],
        },
      ],
    ),
  },
  {
    id: 'post-privacy-ml',
    title: 'Privacy by construction in ML products',
    slug: 'privacy-by-construction-in-ml-products',
    excerpt:
      'If the model can see it, the logs will eventually keep it. Design the minimum record first. Access review is not a substitute for that.',
    coverImageUrl: cover('photo-1451187580459-43490279d0ef'),
    publishedAt: '2022-10-12T08:00:00.000Z',
    viewsCount: 27610,
    featured: false,
    tagSlugs: ['privacy', 'mlops', 'architecture'],
    authorUsername: 'leilahaddad',
    contentHtml: article(
      'The first ML privacy incident I worked was not a breach in the cinematic sense. A debug flag had been left on. Two weeks of raw user text sat in an object store with a wide IAM role. Nobody had been malicious. Nobody had designed the record either.',
      [
        {
          id: 'minimum-record',
          title: 'Start from the minimum record',
          paragraphs: [
            'Write down every field the model needs and why. Everything else is a future incident. Hash identifiers. Drop free text when a class label will do. If you must keep raw input, give it a TTL that is shorter than your curiosity.',
          ],
        },
        {
          id: 'training-data',
          title: 'Training data is production data',
          paragraphs: [
            'A notebook with an export is still a production store. Apply the same access rules. Track who pulled the set. Do not copy production into a laptop because the sample “looked small.”',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Privacy is a data-shape problem. Reviews help. Construction decides.'],
        },
      ],
    ),
  },
  {
    id: 'post-oncall-ml',
    title: 'On-call for machine learning systems',
    slug: 'on-call-for-machine-learning-systems',
    excerpt:
      'A silent model is an outage. Write pages for quality as well as for 500s, or the first person to notice will be a customer.',
    coverImageUrl: cover('photo-1504868584819-f8e8b4b6d7e3'),
    publishedAt: '2022-11-29T09:00:00.000Z',
    viewsCount: 25180,
    featured: false,
    tagSlugs: ['reliability', 'mlops', 'observability'],
    authorUsername: 'naomifeldman',
    contentHtml: article(
      'HTTP 200 with a useless score is the ML version of a hung lock. The service is up. The product is down. If your only page is on error rate, you will sleep through it.',
      [
        {
          id: 'page-quality',
          title: 'Page on quality, carefully',
          paragraphs: [
            'A sudden drop in prediction volume, a spike in a fallback class, or a score distribution that leaves its weekly band is worth a ticket. Do not page on every weekly wiggle. Do page when the live feature vector starts arriving empty.',
          ],
        },
        {
          id: 'runbooks',
          title: 'Runbooks for models',
          paragraphs: [
            'The runbook should say how to disable the model, how to pin the last good artifact, and who owns the training job. “Check the notebook” is not a step. A name and a rollback command are.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Treat model silence as an incident class. Write it down before the holiday week.'],
        },
      ],
    ),
  },
  {
    id: 'post-first-year',
    title: 'Notes from the first year of SystemInk',
    slug: 'notes-from-the-first-year-of-systemink',
    excerpt:
      'What we learned after twelve months of editing working engineers: shorter pieces, fewer slogans, and a bias toward systems that already shipped.',
    coverImageUrl: cover('photo-1486312338219-ce68d2c6f44d'),
    publishedAt: '2022-12-15T09:00:00.000Z',
    viewsCount: 19840,
    featured: false,
    tagSlugs: ['architecture', 'system-design'],
    authorUsername: 'priyavenkatesh',
    contentHtml: article(
      'We closed 2022 with 28 essays and a comment culture that was kinder than the internet usually manages. A few patterns were already obvious from the edit queue.',
      [
        {
          id: 'shipped-first',
          title: 'We prefer systems that shipped',
          paragraphs: [
            'Proposed architectures read well and age badly. The pieces readers still open are the ones with a date, a constraint, and a scar. We started asking writers for the incident that forced the design, even if the incident was small.',
          ],
        },
        {
          id: 'length',
          title: 'Length is not seriousness',
          paragraphs: [
            'The 4,000-word manifesto underperformed the 1,200-word note with a checklist. We still run long pieces when the subject needs room. We no longer confuse room with importance.',
          ],
        },
        {
          id: 'next',
          title: 'What we will do next',
          paragraphs: [
            'More writers outside one city. More pieces on data contracts and model serving. Less writing that could have been a product announcement. Thank you for reading through the first year.',
          ],
        },
      ],
    ),
  },
  {
    id: 'post-llm-dependency',
    title: 'What changed when LLM APIs became a dependency',
    slug: 'when-llm-apis-became-a-dependency',
    excerpt:
      'In 2023 a text API joined the critical path. The reliability story is older than the models: timeouts, budgets, fallbacks, and a vendor you do not control.',
    coverImageUrl: cover('photo-1677442136019-21780ecad995'),
    publishedAt: '2023-02-08T09:00:00.000Z',
    viewsCount: 52330,
    featured: true,
    tagSlugs: ['llms', 'system-design', 'reliability'],
    authorUsername: 'marcuschen',
    contentHtml: article(
      'I have spent most of my career treating other people’s APIs as unreliable. In 2023 a wave of products put a language model on the request path and were surprised when it behaved like every other network call: slow tails, changing defaults, and an outage that is not yours to fix.',
      [
        {
          id: 'same-rules',
          title: 'Same rules as payments and email',
          paragraphs: [
            'Give the call a deadline. Retry only the transport. Budget the tokens. Keep a fallback that is worse and available. If the feature cannot survive the provider’s bad afternoon, it is not a feature. It is a demo with a logo.',
          ],
        },
        {
          id: 'pin-defaults',
          title: 'Pin what you can',
          paragraphs: [
            'Model name, temperature, and max tokens belong in config you control. Provider “default” is a moving target. Read the changelog. I have seen a quiet default change move both cost and tone in the same week.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['The novelty is the model. The operations are not new. Apply the old discipline early, while the traffic is still kind.'],
        },
      ],
    ),
  },
  {
    id: 'post-prompting-not-strategy',
    title: 'Prompting is not a strategy',
    slug: 'prompting-is-not-a-strategy',
    excerpt:
      'A clever prompt can hide a missing retrieval path or a missing product rule. It cannot replace either for long.',
    coverImageUrl: cover('photo-1516321318423-f06f85e504b3'),
    publishedAt: '2023-03-22T09:00:00.000Z',
    viewsCount: 22140,
    featured: false,
    tagSlugs: ['prompt-engineering', 'llms', 'product'],
    authorUsername: 'owenbradley',
    contentHtml: article(
      'I watched a team spend six weeks lengthening a system prompt to stop refunds the model was not allowed to offer. The rule belonged in the tool layer. The prompt was a pamphlet the model could ignore under pressure.',
      [
        {
          id: 'rules-in-code',
          title: 'Put rules in code',
          paragraphs: [
            'If a behavior must never happen, do not ask the model to remember it. Disable the tool. Filter the output. Refuse the action. Prompts are for style and task framing. They are a weak control plane.',
          ],
        },
        {
          id: 'measure',
          title: 'Measure the prompt like a release',
          paragraphs: [
            'When you do change text, run the same 40 cases you ran last month. If you cannot name the cases, you are editing by vibe. That is fine in a prototype. It is not a strategy for a product with customers.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Use prompts. Do not hide architecture in them.'],
        },
      ],
    ),
  },
  {
    id: 'post-product-analytics-models',
    title: 'Product analytics for model features',
    slug: 'product-analytics-for-model-features',
    excerpt:
      'Accuracy is not adoption. Instrument the feature the way you instrument a checkout: started, completed, abandoned, complained.',
    coverImageUrl: cover('photo-1460925895917-afdab827c52f'),
    publishedAt: '2023-05-09T08:00:00.000Z',
    viewsCount: 18420,
    featured: false,
    tagSlugs: ['product', 'mlops', 'observability'],
    authorUsername: 'sofiaalvarez',
    contentHtml: article(
      'A model can be right in a notebook and unused in the product. I have shipped a recommender with a tidy offline metric and a UI so timid that people never saw the third item. We celebrated the AUC. Users did not change their path.',
      [
        {
          id: 'funnel',
          title: 'Give the model a funnel',
          paragraphs: [
            'Started, shown, accepted, rejected, reported. Those five events tell you more than a weekly accuracy export. If “shown” is high and “accepted” is flat, you have a product problem. If “started” never happens, you have a placement problem.',
          ],
        },
        {
          id: 'segments',
          title: 'Segment before you average',
          paragraphs: [
            'New users and power users will not treat the same suggestion the same way. A single acceptance rate will hide a segment you are failing. Look at the unhappy slice first. That is where the next design lives.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Pair every model metric with a product metric. If only one moves, you are not done.'],
        },
      ],
    ),
  },
  {
    id: 'post-label-drift',
    title: 'Evaluating classifiers after the labels drift',
    slug: 'evaluating-classifiers-after-the-labels-drift',
    excerpt:
      'Last year’s labels describe last year’s world. If you do not refresh the set, you will tune a model for a job that no longer exists.',
    coverImageUrl: cover('photo-1504868584819-f8e8b4b6d7e3'),
    publishedAt: '2023-07-17T08:00:00.000Z',
    viewsCount: 17660,
    featured: false,
    tagSlugs: ['evaluation', 'mlops'],
    authorUsername: 'henriknilsen',
    contentHtml: article(
      'A support classifier we inherited in 2023 had a 0.91 F1 on the original set and a 0.64 F1 on tickets from the last quarter. The model had not collapsed. The product had added three new issue types and renamed two old ones. The labels had drifted. The dashboard had not.',
      [
        {
          id: 'refresh',
          title: 'Refresh on a calendar',
          paragraphs: [
            'Pick a cadence. Quarterly is fine for many products. Sample live traffic. Relabel a few hundred rows. Compare old-set score and new-set score every time you train. If they diverge, you are overfitting history.',
          ],
        },
        {
          id: 'agreement',
          title: 'Measure the labelers',
          paragraphs: [
            'If two people cannot agree on a class, the model cannot learn it. Track inter-annotator agreement. Merge classes that humans fight over. A smaller, cleaner taxonomy beats a proud, noisy one.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Evaluation is a living dataset. Treat it like production data with an owner, not like a trophy from the first launch.'],
        },
      ],
    ),
  },
  {
    id: 'post-tool-use',
    title: 'Tool use without turning the model loose',
    slug: 'tool-use-without-turning-the-model-loose',
    excerpt:
      'An agent that can call tools is a privilege system. Schema, allow-lists, and a human step on irreversible actions are the design, not extras.',
    coverImageUrl: cover('photo-1677442136019-21780ecad995'),
    publishedAt: '2023-10-03T08:00:00.000Z',
    viewsCount: 16890,
    featured: false,
    tagSlugs: ['agents', 'llms', 'architecture'],
    authorUsername: 'amaradiallo',
    contentHtml: article(
      'The first tool-using demo I saw in 2023 booked a calendar slot by accident. The model had been helpful. The API had been real. Nobody had decided what “helpful” was allowed to touch.',
      [
        {
          id: 'allow-list',
          title: 'Allow-list the tools',
          paragraphs: [
            'The model should see a short menu: search, read, create-draft. It should not see delete, refund, or email-everyone. If a tool is irreversible, require a confirmation the model cannot click for the user.',
          ],
        },
        {
          id: 'schema',
          title: 'Parse, then act',
          paragraphs: [
            'Never send raw model text to a tool. Parse into a schema. Reject extra fields. Cap quantities. Log the arguments. This is the same discipline we already use for any untrusted input. The model is untrusted input.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Autonomy is a product choice. Most useful systems are scripted graphs with one or two tools and a verifier. That is enough for a year of real work.'],
        },
      ],
    ),
  },
  {
    id: 'post-queues-fanout',
    title: 'Queues, backpressure, and model fan-out',
    slug: 'queues-backpressure-and-model-fan-out',
    excerpt:
      'One user action that fans out into twenty model calls will teach you about queues whether you designed them or not.',
    coverImageUrl: cover('photo-1558494949-ef010cbdcc31'),
    publishedAt: '2023-11-20T09:00:00.000Z',
    viewsCount: 15940,
    featured: false,
    tagSlugs: ['system-design', 'cost-engineering', 'reliability'],
    authorUsername: 'owenbradley',
    contentHtml: article(
      'A “summarize this account” button looks like one request. Behind it you may embed forty documents, classify ten threads, and write three summaries. If that work sits on the user’s HTTP connection, a launch will take the site down and the bill up.',
      [
        {
          id: 'split-paths',
          title: 'Split interactive from batch',
          paragraphs: [
            'The click should enqueue work and return a job id. The UI can poll or subscribe. Batch the embeddings. Cap concurrency per tenant. This is 2014 queue design applied to 2023 tokens. It still works.',
          ],
        },
        {
          id: 'backpressure',
          title: 'Say no early',
          paragraphs: [
            'When the queue depth crosses a line, refuse new fan-out jobs with a clear message. A honest wait is better than a pile of half-finished summaries and a provider timeout storm.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Count model calls per user action before you ship the button. If the number surprises you, the queue is already late.'],
        },
      ],
    ),
  },
  {
    id: 'post-vector-not-magic',
    title: 'Vector indexes are not magic',
    slug: 'vector-indexes-are-not-magic',
    excerpt:
      'Approximate nearest neighbor is a recall tool with knobs. If you do not know your recall at k, you are buying a feeling, not a search system.',
    coverImageUrl: cover('photo-1558494949-ef010cbdcc31'),
    publishedAt: '2024-02-14T09:00:00.000Z',
    viewsCount: 21480,
    featured: false,
    tagSlugs: ['vector-search', 'retrieval', 'system-design'],
    authorUsername: 'jacobklein',
    contentHtml: article(
      'I like vector databases. I do not like the way they are sold as a replacement for thinking about retrieval. An ANN index returns neighbors in a space you chose. If the space is wrong, the neighbors are confidently wrong.',
      [
        {
          id: 'measure-recall',
          title: 'Measure recall on your corpus',
          paragraphs: [
            'Build a small set of queries with known documents. Measure recall at 10 and at 50. Change ef/nprobe until the curve makes sense for your latency budget. A default HNSW is a starting point, not a result.',
          ],
        },
        {
          id: 'filters',
          title: 'Filters are part of the index',
          paragraphs: [
            'Tenant, language, and document type should be first-class. If you retrieve 20 neighbors and throw 19 away, you will return empty pages that had matches. Pre-filter if the engine allows it.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Buy the index. Keep the evaluation. Magic is just an unmeasured default.'],
        },
      ],
    ),
  },
  {
    id: 'post-citation-first',
    title: 'A quiet case for citation-first answers',
    slug: 'a-quiet-case-for-citation-first-answers',
    excerpt:
      'Show the source before you show the prose. Users trust a short quote they can open more than a long paragraph they cannot check.',
    coverImageUrl: cover('photo-1454165804606-c3d57bc86b40'),
    publishedAt: '2024-05-06T08:00:00.000Z',
    viewsCount: 14210,
    featured: false,
    tagSlugs: ['rag', 'product', 'retrieval'],
    authorUsername: 'meilin',
    contentHtml: article(
      'We A/B tested a support assistant in 2024. One variant led with a fluent paragraph and a footnote. The other led with two short quotations and a one-sentence wrap. The second variant had more “this helped” clicks and fewer angry tickets. People wanted to see the policy, not a rewrite of it.',
      [
        {
          id: 'ui',
          title: 'The interface is part of retrieval',
          paragraphs: [
            'Citations that do not open the passage are decoration. Deep-link to the section. Highlight the span. If you cannot do that, you are asking the user to trust a stranger’s summary of their own contract.',
          ],
        },
        {
          id: 'refuse',
          title: 'Empty citations should block the answer',
          paragraphs: [
            'If the retriever found nothing, say so. Generating a paragraph and then failing to cite it trains users to ignore your footnotes.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Write less. Show the source. The model can still help. It does not have to perform.'],
        },
      ],
    ),
  },
  {
    id: 'post-tenant-retrieval',
    title: 'Tenant isolation for retrieval systems',
    slug: 'tenant-isolation-for-retrieval-systems',
    excerpt:
      'A missed filter in vector search is not a ranking bug. It is another customer’s file in the answer box.',
    coverImageUrl: cover('photo-1486406149926-2bfaafb2c5cd'),
    publishedAt: '2024-08-19T08:00:00.000Z',
    viewsCount: 11880,
    featured: false,
    tagSlugs: ['saas', 'retrieval', 'architecture'],
    authorUsername: 'faridalhassan',
    contentHtml: article(
      'I treat cross-tenant retrieval the way I treat a broken authorization check. The blast radius is trust, not just relevance. In 2024 I reviewed a system where the tenant id lived only in the prompt. The index was global. A similar question from two companies could surface the same chunk.',
      [
        {
          id: 'engine-filter',
          title: 'Put the tenant in the engine',
          paragraphs: [
            'Namespaces, partitions, or mandatory filters that the query planner cannot skip. Prompts are not an ACL. Tests should insert a canary document in tenant A and search from tenant B on every deploy.',
          ],
        },
        {
          id: 'cache',
          title: 'The cache is a tenant too',
          paragraphs: [
            'Semantic caches without a tenant key are a second index with worse discipline. Key by tenant and user. When in doubt, do not cache.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Isolation first. Quality second. A slightly worse private answer beats a better leaked one.'],
        },
      ],
    ),
  },
  {
    id: 'post-llm-runbooks',
    title: 'Runbooks for LLM operations',
    slug: 'runbooks-for-llm-operations',
    excerpt:
      'When the provider blinks, someone still has to know which pin to revert and which feature to disable. Write that down on a quiet day.',
    coverImageUrl: cover('photo-1516321318423-f06f85e504b3'),
    publishedAt: '2024-11-07T09:00:00.000Z',
    viewsCount: 9640,
    featured: false,
    tagSlugs: ['llms', 'reliability', 'observability'],
    authorUsername: 'clairemoreau',
    contentHtml: article(
      'We had a Tuesday in late 2024 when a provider raised error rates for ninety minutes. The product team asked if we should “switch models.” Nobody could say which features used which pin, or what the fallback looked like in the UI. The outage was short. The embarrassment was not.',
      [
        {
          id: 'inventory',
          title: 'Keep an inventory',
          paragraphs: [
            'Every feature, model pin, timeout, and fallback in one table. Update it when you ship. On-call should not grep the repo during an incident to learn what is in production.',
          ],
        },
        {
          id: 'disable',
          title: 'Know how to disable',
          paragraphs: [
            'A feature flag that turns the assistant into a search box is a gift. Practice it. If the only option is “hope the provider returns,” you do not have a runbook. You have a wish.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['LLM operations are still operations. Inventory, pin, disable, communicate. The model does not change that list.'],
        },
      ],
    ),
  },
  {
    id: 'post-warehouse-features',
    title: 'When the warehouse is the wrong place to serve features',
    slug: 'when-the-warehouse-is-the-wrong-place-to-serve-features',
    excerpt:
      'Batch truth and online truth are different jobs. A warehouse query on the request path is a latency incident waiting for traffic.',
    coverImageUrl: cover('photo-1460925895917-afdab827c52f'),
    publishedAt: '2024-12-02T09:00:00.000Z',
    viewsCount: 8120,
    featured: false,
    tagSlugs: ['mlops', 'architecture', 'system-design'],
    authorUsername: 'tomasherrera',
    contentHtml: article(
      'Warehouses are excellent at yesterday. They are a poor cache for the live request. I still see teams join seven tables at request time because “that is where the truth lives.” The truth arrives 40 minutes late and 800 milliseconds over budget.',
      [
        {
          id: 'two-stores',
          title: 'Two stores, one definition',
          paragraphs: [
            'Compute the feature in batch for training. Materialize a serving copy in a store with a known p99. The definition is shared. The engines are not. If you cannot afford two stores, you cannot afford request-time SQL either.',
          ],
        },
        {
          id: 'freshness',
          title: 'Name the freshness',
          paragraphs: [
            '“Last order amount as of 15 minutes ago” is a product sentence. “Whatever the warehouse has” is not. Users will accept a named delay. They will not accept a spinner.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Keep the warehouse for training and for analysis. Serve from something you can budget.'],
        },
      ],
    ),
  },
  {
    id: 'post-hybrid-search-explain',
    title: 'Hybrid search that a new engineer can explain',
    slug: 'hybrid-search-that-teams-can-explain',
    excerpt:
      'Lexical plus dense plus a reranker is enough for most internal corpora. The win is the diagram on the whiteboard, not a sixth stage nobody owns.',
    coverImageUrl: cover('photo-1454165804606-c3d57bc86b40'),
    publishedAt: '2025-03-04T09:00:00.000Z',
    viewsCount: 7340,
    featured: false,
    tagSlugs: ['retrieval', 'rag', 'vector-search'],
    authorUsername: 'rohaniyer',
    contentHtml: article(
      'I joined a retrieval project that had seven stages and one person who understood the third. When that person went on leave, quality dropped and nobody could say which stage to blame. We tore it down to three steps and wrote the diagram in the repo.',
      [
        {
          id: 'three-steps',
          title: 'Three steps is a system',
          paragraphs: [
            'Hybrid retrieve. Rerank a few dozen. Pack the context. Each step has an owner and a metric. Query rewrite is optional and comes later, when you can measure it.',
          ],
        },
        {
          id: 'explain',
          title: 'Explain a miss',
          paragraphs: [
            'A new engineer should be able to take a failed question and say: the lexical query missed, or the dense neighbor was wrong, or the reranker buried the right chunk. If they cannot, the stack is too clever for the team you have.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Clarity is a reliability feature. Draw the smallest pipeline that works. Add stages only when a metric asks for them.'],
        },
      ],
    ),
  },
  {
    id: 'post-architecture-reviews-ai',
    title: 'Architecture reviews for AI features',
    slug: 'architecture-reviews-for-ai-features',
    excerpt:
      'Review the data path, the failure path, and the bill. The model card can wait until those three are boring.',
    coverImageUrl: cover('photo-1497366216548-37526070297c'),
    publishedAt: '2025-07-01T08:00:00.000Z',
    viewsCount: 4120,
    featured: false,
    tagSlugs: ['architecture', 'system-design', 'llms'],
    authorUsername: 'hannahbrooks',
    contentHtml: article(
      'I sit in reviews where the first twenty minutes are spent on model choice and the last two minutes on “what if it is wrong.” That ratio should be reversed. An AI feature is still a feature. It has a data path, a user, a budget, and a way to be turned off.',
      [
        {
          id: 'questions',
          title: 'The questions I ask first',
          paragraphs: [],
          list: [
            'What is the source of truth, and who owns it?',
            'What does the UI do when the model is slow or empty?',
            'What is the cost at 10x traffic?',
            'How do we disable this without a deploy?',
          ],
        },
        {
          id: 'model-later',
          title: 'The model is a later slide',
          paragraphs: [
            'Once the path is clear, model choice is an optimization. Before the path is clear, model choice is a distraction. I have approved small models with good fallbacks and rejected large models with none.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Review AI features as systems. The novelty does not earn a skip on the old questions.'],
        },
      ],
    ),
  },
  {
    id: 'post-golden-sets-honest',
    title: 'Golden sets that stay honest',
    slug: 'golden-sets-that-stay-honest',
    excerpt:
      'A set you keep editing to make the score rise is a training set. Hold some questions back, or you will report a number that only you believe.',
    coverImageUrl: cover('photo-1504868584819-f8e8b4b6d7e3'),
    publishedAt: '2025-08-19T08:00:00.000Z',
    viewsCount: 5680,
    featured: false,
    tagSlugs: ['evaluation', 'rag', 'mlops'],
    authorUsername: 'henriknilsen',
    contentHtml: article(
      'I have been in rooms where a team celebrated a six-point jump on an eval they had rewritten that morning. The product had not changed for users. The rubric had become more generous. That is not evaluation. That is interior design.',
      [
        {
          id: 'holdout',
          title: 'Hold out a slice',
          paragraphs: [
            'Keep 20 to 30 questions you do not tune against. Run them after every change. Present that number in reviews. The rest of the set is for debugging. Both are useful. Only one is a claim.',
          ],
        },
        {
          id: 'version',
          title: 'Version the set',
          paragraphs: [
            'When you add a question, bump the set version. When you change a reference answer, say so. Comparing v3 and v7 as if they were the same exam is how legends start.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Honesty is a process. Holdout, version, and a named owner will do more than a fancier judge.'],
        },
      ],
    ),
  },
  {
    id: 'post-rebuild-embeddings',
    title: 'Rebuilding an embedding index in production',
    slug: 'rebuilding-an-embedding-index-in-production',
    excerpt:
      'A model upgrade is a migration. Dual-write, shadow-read, swap the alias. Users should not meet a half-built collection.',
    coverImageUrl: cover('photo-1558494949-ef010cbdcc31'),
    publishedAt: '2025-10-08T08:00:00.000Z',
    viewsCount: 4890,
    featured: false,
    tagSlugs: ['vector-search', 'retrieval', 'mlops'],
    authorUsername: 'jacobklein',
    contentHtml: article(
      'We changed embedding models in October 2025. The new space was better on the golden set. The cutover still took two weeks, because we refused to point production at an index that was 70% built. That patience was the work.',
      [
        {
          id: 'alias',
          title: 'Build behind an alias',
          paragraphs: [
            'Write the new collection under a new name. Keep the old alias live. When backfill and eval pass, swap. If something looks wrong in the first hour, swap back. This is how search teams have shipped analyzers for years.',
          ],
        },
        {
          id: 'do-not-mix',
          title: 'Do not mix spaces',
          paragraphs: [
            'Vectors from two models do not belong in one index. You will get neighbors that mean nothing and a week of confusing screenshots. Finish the backfill. Then switch the query embedder and the index together.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Treat embedding changes like schema migrations. They are. They just have more floating point.'],
        },
      ],
    ),
  },
  {
    id: 'post-prompt-logs',
    title: 'What not to put in a prompt log',
    slug: 'what-not-to-put-in-a-prompt-log',
    excerpt:
      'Prompt traces are useful and radioactive. Redact before they leave the request. Retention is a product decision, not a debug leftover.',
    coverImageUrl: cover('photo-1451187580459-43490279d0ef'),
    publishedAt: '2025-11-26T09:00:00.000Z',
    viewsCount: 3920,
    featured: false,
    tagSlugs: ['privacy', 'observability', 'llms'],
    authorUsername: 'leilahaddad',
    contentHtml: article(
      'By 2025 most teams I met had a trace of every prompt. Few had a policy for what that trace was allowed to contain. I have seen passwords, medical notes, and customer contracts sitting in a vendor’s “LLM observability” project with a 90-day default.',
      [
        {
          id: 'redact',
          title: 'Redact on the way out',
          paragraphs: [
            'Strip secrets, emails, and identifier patterns before the span is exported. Store hashes if you need to join later. If a field is not required to debug quality, it should not travel.',
          ],
        },
        {
          id: 'retention',
          title: 'Name the retention',
          paragraphs: [
            'Seven days is plenty for most quality work. Ninety days is a store. A year is an archive. Say which one you are building and who can query it. “We might need it” is how prompt logs become a second production database.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['Trace the path. Do not collect a parallel copy of the user’s life.'],
        },
      ],
    ),
  },
  {
    id: 'post-skew-2025',
    title: 'Training-serving skew in 2025',
    slug: 'training-serving-skew-in-2025',
    excerpt:
      'The old bug survived the new stack. Features still drift between the notebook and the live path. Log the vector. Compare it. Do it again after every pipeline change.',
    coverImageUrl: cover('photo-1551288049-bebda4e38f71'),
    publishedAt: '2025-12-14T09:00:00.000Z',
    viewsCount: 2780,
    featured: false,
    tagSlugs: ['mlops', 'evaluation', 'architecture'],
    authorUsername: 'aisharahman',
    contentHtml: article(
      'I wrote about feature contracts in 2021. I am writing about them again because language-model features did not abolish the problem. A RAG pipeline that chunks differently in the batch indexer and the live uploader is the same bug with a new costume.',
      [
        {
          id: 'same-bug',
          title: 'Same bug, new names',
          paragraphs: [
            'Chunker version, embedding model, and metadata filters must match between backfill and the incremental path. If they do not, your golden set was measured on a corpus users do not have.',
          ],
        },
        {
          id: 'habit',
          title: 'Make comparison a habit',
          paragraphs: [
            'Once a week, sample live retrieval IDs and rebuild them from the raw source with the batch job. Diff. The first unexpected line is the ticket. This habit has saved me more hours than any new vendor.',
          ],
        },
        {
          id: 'takeaways',
          title: 'Takeaways',
          paragraphs: ['New models do not retire old discipline. If two paths compute the same name, prove they compute the same value.'],
        },
      ],
    ),
  },
];
