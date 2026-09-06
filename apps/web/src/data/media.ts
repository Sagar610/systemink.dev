function photo(id: string, size: 'cover' | 'face'): string {
  if (size === 'face') {
    return `https://images.unsplash.com/${id}?w=256&h=256&fit=crop&crop=faces&q=80`;
  }
  return `https://images.unsplash.com/${id}?w=1600&h=900&fit=crop&q=80`;
}

export const COVER_BY_SLUG: Record<string, string> = {
  'why-we-started-systemink': photo('photo-1486312338219-ce68d2c6f44d', 'cover'),
  'designing-caches-that-fail-closed': photo('photo-1558494949-ef010cbdcc31', 'cover'),
  'event-driven-systems-without-the-mystery': photo('photo-1550751827-4bd374c3f58b', 'cover'),
  'a-working-model-of-service-ownership': photo('photo-1497366216548-37526070297c', 'cover'),
  'search-ranking-is-a-product-problem': photo('photo-1454165804606-c3d57bc86b40', 'cover'),
  'feature-stores-before-they-were-fashionable': photo('photo-1551288049-bebda4e38f71', 'cover'),
  'data-contracts-between-teams': photo('photo-1450101499163-c8848c66ca85', 'cover'),
  'observability-that-engineers-actually-use': photo('photo-1460925895917-afdab827c52f', 'cover'),
  'serving-models-without-a-research-cluster': photo('photo-1461749280684-dccba630e2f6', 'cover'),
  'privacy-by-construction-in-ml-products': photo('photo-1563986768609-322da13575f3', 'cover'),
  'on-call-for-machine-learning-systems': photo('photo-1504384308090-c894fdcc538d', 'cover'),
  'notes-from-the-first-year-of-systemink': photo('photo-1432888498266-38ffec3eaf0a', 'cover'),
  'when-llm-apis-became-a-dependency': photo('photo-1677442136019-21780ecad995', 'cover'),
  'prompting-is-not-a-strategy': photo('photo-1455390582262-044cdead277a', 'cover'),
  'product-analytics-for-model-features': photo('photo-1543286386-713bdd548da4', 'cover'),
  'evaluating-classifiers-after-the-labels-drift': photo('photo-1504868584819-f8e8b4b6d7e3', 'cover'),
  'tool-use-without-turning-the-model-loose': photo('photo-1485827404703-89b55fcc595e', 'cover'),
  'queues-backpressure-and-model-fan-out': photo('photo-1517430816045-df4b7de11d1d', 'cover'),
  'vector-indexes-are-not-magic': photo('photo-1518770660439-4636190af475', 'cover'),
  'a-quiet-case-for-citation-first-answers': photo('photo-1481627834876-b7833e8f5570', 'cover'),
  'tenant-isolation-for-retrieval-systems': photo('photo-1441986300917-64674bd600d8', 'cover'),
  'runbooks-for-llm-operations': photo('photo-1586281380349-632531db7ed4', 'cover'),
  'when-the-warehouse-is-the-wrong-place-to-serve-features': photo('photo-1504639725590-34d0984388bd', 'cover'),
  'hybrid-search-that-teams-can-explain': photo('photo-1517245386807-bb43f82c33c4', 'cover'),
  'architecture-reviews-for-ai-features': photo('photo-1556761175-5973dc0f32e7', 'cover'),
  'golden-sets-that-stay-honest': photo('photo-1434030216411-0b793f4b4173', 'cover'),
  'rebuilding-an-embedding-index-in-production': photo('photo-1555066931-4365d14bab8c', 'cover'),
  'what-not-to-put-in-a-prompt-log': photo('photo-1488590528505-98d2b5aba04b', 'cover'),
  'training-serving-skew-in-2025': photo('photo-1519389950473-47ba0277781c', 'cover'),
  'the-request-path-is-the-product': photo('photo-1531297484001-80022131f5a1', 'cover'),
  'rag-in-production-chunking-retrieval-evaluation': photo('photo-1515879218367-8466d910aaa4', 'cover'),
  'queues-idempotency-and-async-truth': photo('photo-1526374965328-7f61d4dc18c5', 'cover'),
  'designing-llm-systems-that-fail-safely': photo('photo-1517694712202-14dd9538aa97', 'cover'),
  'building-a-retrieval-platform-search-teams-trust': photo('photo-1498050108023-c5249f4df085', 'cover'),
  'incident-reviews-that-change-the-next-design': photo('photo-1552664730-d307ca884978', 'cover'),
  'rag-vs-fine-tuning-vs-agents': photo('photo-1620712943543-bcc4688e7485', 'cover'),
  'practical-vector-search-pipeline': photo('photo-1633356122544-f134324a6cee', 'cover'),
  'cost-and-latency-control-for-llm-apis': photo('photo-1611974789855-9c2a0a7236a3', 'cover'),
  'observability-for-llm-applications': photo('photo-1542744173-8e7e53415bb0', 'cover'),
  'multi-tenant-design-for-ai-products': photo('photo-1522071820081-009f0129c71c', 'cover'),
  'prompt-management-is-engineering': photo('photo-1516321318423-f06f85e504b3', 'cover'),
  'evaluate-rag-without-fooling-yourself': photo('photo-1573164713988-8665fc963095', 'cover'),
};

export const AVATAR_BY_USERNAME: Record<string, string> = {
  priyavenkatesh: photo('photo-1573496359142-b8d87734a5a2', 'face'),
  marcuschen: photo('photo-1560250097-0b93528c311a', 'face'),
  danielokonkwo: photo('photo-1506794778202-cad84cf45f1d', 'face'),
  elenavarga: photo('photo-1494790108377-be9c29b29330', 'face'),
  aisharahman: photo('photo-1531123897727-8f129e1688ce', 'face'),
  sagargondaliya: 'https://github.com/sagar-gondaliya.png',
  naomifeldman: photo('photo-1580489944761-15a19d654956', 'face'),
  tomasherrera: photo('photo-1500648767791-00dcc994a43e', 'face'),
  kenjisato: photo('photo-1507003211169-0a1dd7228f2d', 'face'),
  leilahaddad: photo('photo-1544005313-94ddf0286df2', 'face'),
  owenbradley: photo('photo-1472099645785-5658abf4ff4e', 'face'),
  sofiaalvarez: photo('photo-1534528741775-53994a69daeb', 'face'),
  henriknilsen: photo('photo-1519085360753-af0119f7cbe7', 'face'),
  amaradiallo: photo('photo-1524504388940-b1c1722653e1', 'face'),
  jacobklein: photo('photo-1463453091185-61582044d556', 'face'),
  meilin: photo('photo-1438761681033-6461ffad8d80', 'face'),
  faridalhassan: photo('photo-1504257432389-52343af06ae3', 'face'),
  clairemoreau: photo('photo-1573497019940-1c28c88b4f3e', 'face'),
  rohaniyer: photo('photo-1539571696357-5a69c17a67c6', 'face'),
  hannahbrooks: photo('photo-1487412720507-e7ab37603c6f', 'face'),
};

const coverValues = Object.values(COVER_BY_SLUG);
if (new Set(coverValues).size !== coverValues.length) {
  throw new Error('Duplicate cover images assigned');
}

export function coverForSlug(slug: string): string {
  const url = COVER_BY_SLUG[slug];
  if (!url) {
    throw new Error(`Missing unique cover for ${slug}`);
  }
  return url;
}

export function computeAuthorSocial(views: number, posts: number, createdAt: string) {
  const years = Math.max(0.35, (Date.now() - +new Date(createdAt)) / (365.25 * 86400000));
  return {
    followersCount: Math.round(26 + views / 240 + years * 22 + posts * 14),
    followingCount: Math.round(8 + years * 5 + posts * 3),
  };
}
