import { CommentPublic, CommentStatus } from '@systemink/shared';
import { getAuthor } from './authors';

function comment(
  id: string,
  username: string,
  body: string,
  createdAt: string,
  likesCount: number,
  replies: CommentPublic[] = [],
): CommentPublic {
  const user = getAuthor(username);
  return {
    id,
    body,
    status: CommentStatus.VISIBLE,
    parentId: null,
    likesCount,
    createdAt,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      links: user.links,
      createdAt: user.createdAt,
    },
    replies: replies.map((reply) => ({ ...reply, parentId: id })),
  };
}

function reply(
  id: string,
  username: string,
  body: string,
  createdAt: string,
  likesCount: number,
): CommentPublic {
  const user = getAuthor(username);
  return {
    id,
    body,
    status: CommentStatus.VISIBLE,
    parentId: null,
    likesCount,
    createdAt,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      links: user.links,
      createdAt: user.createdAt,
    },
  };
}

export const COMMENTS_BY_POST: Record<string, CommentPublic[]> = {
  'post-why-systemink': [
    comment(
      'c-why-1',
      'marcuschen',
      'Still proud of this first note. The “no launch-week tone” rule is the reason I keep sending drafts here instead of a company blog.',
      '2021-04-20T14:22:00.000Z',
      48,
    ),
    comment(
      'c-why-2',
      'danielokonkwo',
      'I found this journal in 2021 after the event-driven piece. Five years on, the edit still feels like a design review, which is rare.',
      '2023-02-11T09:14:00.000Z',
      31,
    ),
    comment(
      'c-why-3',
      'sagargondaliya',
      'Came back to this after writing the RAG production essay. The test has not changed: if it will not help someone ship next quarter, it does not belong here.',
      '2026-08-29T18:03:00.000Z',
      19,
    ),
  ],
  'post-caches-fail-closed': [
    comment(
      'c-cache-1',
      'priyavenkatesh',
      'We still point new platform hires at this one. The “stale is a policy” line has shown up in more than one incident write-up.',
      '2021-06-02T11:40:00.000Z',
      62,
      [
        reply(
          'c-cache-1r',
          'marcuschen',
          'That line came out of a permissions cache that served a deleted role for eleven minutes. I still think about those eleven minutes.',
          '2021-06-02T16:08:00.000Z',
          27,
        ),
      ],
    ),
    comment(
      'c-cache-2',
      'naomifeldman',
      'The miss-path load test advice aged well. We finally ran one in 2022 and found the origin timeout was longer than the user timeout. Ugly, useful.',
      '2022-03-08T10:21:00.000Z',
      24,
    ),
  ],
  'post-search-ranking': [
    comment(
      'c-search-1',
      'rohaniyer',
      'I read this before I started writing here. Naming the job of the box is still the first question I ask in a ranking review.',
      '2025-03-05T08:44:00.000Z',
      16,
    ),
    comment(
      'c-search-2',
      'jacobklein',
      'The 2021 “lexical first” take was right then and is still right as a default. Embeddings helped. They did not replace the product question.',
      '2024-02-16T13:05:00.000Z',
      21,
    ),
  ],
  'post-llm-dependency': [
    comment(
      'c-llmdep-1',
      'owenbradley',
      'I quote the “demo with a logo” line more than I should. Timeouts and budgets are still the unglamorous win.',
      '2023-02-09T19:12:00.000Z',
      44,
    ),
    comment(
      'c-llmdep-2',
      'clairemoreau',
      'We added an inventory of pins after this. When a provider blinked last year, we actually knew which features to disable. Thank you.',
      '2024-11-08T07:55:00.000Z',
      18,
    ),
    comment(
      'c-llmdep-3',
      'sagargondaliya',
      'This is the essay I send people before the fail-safe piece. Same discipline, earlier in the hype cycle.',
      '2026-08-18T21:10:00.000Z',
      12,
    ),
  ],
  'post-rag-production': [
    comment(
      'c-rag-1',
      'elenavarga',
      'The chunking-as-product-decision framing is exactly right. We wasted a quarter treating splitter settings as a library default.',
      '2026-08-28T15:36:00.000Z',
      14,
    ),
    comment(
      'c-rag-2',
      'henriknilsen',
      'Please keep scoring retrieval and generation apart. I still see teams average them into one “AI quality” chart and then tune the prompt.',
      '2026-08-29T09:02:00.000Z',
      22,
    ),
  ],
  'post-eval-rag': [
    comment(
      'c-eval-1',
      'aisharahman',
      'The holdout warning should be on the wall. We fooled ourselves on a classifier in 2023 the same way. Different stack, same vanity.',
      '2026-05-21T10:18:00.000Z',
      17,
    ),
    comment(
      'c-eval-2',
      'meilin',
      'Pairing exact checks with a judge is the part I wish I had written first. Fluency is easy to score and easy to overfit.',
      '2026-05-22T08:41:00.000Z',
      9,
    ),
  ],
  'post-feature-stores': [
    comment(
      'c-fs-1',
      'tomasherrera',
      'Twelve years of warehouses and this is still the conversation. One definition, two clocks. I stole that sentence for a design doc.',
      '2022-01-14T12:03:00.000Z',
      29,
    ),
  ],
  'post-privacy-ml': [
    comment(
      'c-priv-1',
      'clairemoreau',
      'The prompt-log follow-up in 2025 is the sibling of this piece. Same instinct: the debug leftover becomes the store.',
      '2025-11-27T11:20:00.000Z',
      11,
    ),
  ],
  'post-architecture-reviews-ai': [
    comment(
      'c-arch-1',
      'priyavenkatesh',
      'Welcome, Hannah. These are the same four questions we have asked since 2021. Glad they still have a home.',
      '2025-07-02T09:30:00.000Z',
      8,
    ),
  ],
};

export function commentsForPost(postId: string): CommentPublic[] {
  return COMMENTS_BY_POST[postId] || [];
}
