# Integrate the Posts API into Next.js

A step-by-step guide to fetch and display posts from your Laravel API in a Next.js application, covering development and production scenarios with code examples.

## 1) Prerequisites
- Node.js 18+ and npm or yarn installed
- A basic Next.js project (Pages Router or App Router)
- Backend API running:
  - Base URL (dev): `http://127.0.0.1:8000`
  - Endpoints:
    - List posts: `GET /api/posts` (public)
    - Get post by ID: `GET /api/posts/{id}` (public)
    - Query params (optional): `search`, `sort` (`title|published_at|created_at`), `order` (`asc|desc`), `page`, `per_page`
  - Auth: Read endpoints are public; write endpoints require `auth:web` and are not needed for display.

## 2) Implementation Steps

### Step A: Environment variables
Create `/.env.local` in your Next.js project:
```
# For client-side fetches
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8004

# For server-only fetches (optional alternative)
API_BASE_URL=http://127.0.0.1:8004
```

### Step B: Install dependencies (optional)
- Native `fetch` is built into Next.js/node; no dependency needed.
- If you prefer axios:
```
npm install axios
# or
yarn add axios
```

### Step C: Define TypeScript types (recommended)
Create `src/types/posts.ts`:
```ts
export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  is_published: boolean;
  published_at: string | null; // ISO datetime
  category_id: number | null;
  featured_image_path: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Meta = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
  sort: string;
  order: 'asc' | 'desc';
};

export type PostsResponse = {
  data: Post[];
  meta: Meta;
};
```

### Step D: Create an API service layer
Create `src/lib/api.ts` using native `fetch`:
```ts
const serverBase = process.env.API_BASE_URL;
const publicBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_URL = serverBase ?? publicBase ?? 'http://127.0.0.1:8004';

export type ListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: 'title' | 'published_at' | 'created_at';
  order?: 'asc' | 'desc';
};

export async function fetchPosts(params: ListParams = {}, options?: RequestInit) {
  const url = new URL('/api/posts', API_BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    // For SSR that shouldn't cache in dev
    cache: 'no-store',
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return (await res.json()) as import('../types/posts').PostsResponse;
}
```

Axios alternative `src/lib/api-axios.ts`:
```ts
import axios from 'axios';
import type { PostsResponse } from '../types/posts';

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8004';
export const api = axios.create({ baseURL: API_BASE_URL, headers: { Accept: 'application/json' } });

export async function fetchPostsAxios(params: Record<string, any> = {}): Promise<PostsResponse> {
  const { data } = await api.get('/api/posts', { params });
  return data as PostsResponse;
}
```

### Step E: Fetch data in Next.js

#### Pages Router (SSR) — `pages/posts/index.tsx`
```tsx
import type { GetServerSideProps } from 'next';
import type { PostsResponse } from '../../src/types/posts';
import { fetchPosts } from '../../src/lib/api';
import PostsList from '../../src/components/PostsList';

export const getServerSideProps: GetServerSideProps<{ payload: PostsResponse }> = async (ctx) => {
  const page = Number(ctx.query.page ?? 1);
  const payload = await fetchPosts({ page, per_page: 10, sort: 'published_at', order: 'desc' });
  return { props: { payload } };
};

export default function PostsPage({ payload }: { payload: PostsResponse }) {
  return <PostsList posts={payload.data} meta={payload.meta} />;
}
```

#### Pages Router (SSG/ISR) — `pages/posts/index.tsx`
```tsx
import type { GetStaticProps } from 'next';
import type { PostsResponse } from '../../src/types/posts';
import { fetchPosts } from '../../src/lib/api';
import PostsList from '../../src/components/PostsList';

export const getStaticProps: GetStaticProps<{ payload: PostsResponse }> = async () => {
  const payload = await fetchPosts({ page: 1, per_page: 10, sort: 'published_at', order: 'desc' });
  return { props: { payload }, revalidate: 60 }; // ISR: revalidate every 60s
};

export default function PostsPage({ payload }: { payload: PostsResponse }) {
  return <PostsList posts={payload.data} meta={payload.meta} />;
}
```

#### App Router (Server Component) — `app/posts/page.tsx`
```tsx
import { fetchPosts } from '../../src/lib/api';
import PostsList from '../../src/components/PostsList';

export default async function PostsPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const page = Number(searchParams?.page ?? 1);
  const payload = await fetchPosts({ page, per_page: 10, sort: 'published_at', order: 'desc' });
  return <PostsList posts={payload.data} meta={payload.meta} />;
}
```

### Step F: Build the post display component
Create `src/components/PostsList.tsx`:
```tsx
import type { Post, Meta } from '../types/posts';
import Link from 'next/link';

export default function PostsList({ posts, meta }: { posts: Post[]; meta: Meta }) {
  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong>
            {p.published_at && <span> — {new Date(p.published_at).toLocaleDateString()}</span>}
            <div>{p.excerpt ?? ''}</div>
          </li>
        ))}
      </ul>
      <Pagination meta={meta} />
    </div>
  );
}

function Pagination({ meta }: { meta: Meta }) {
  const prevPage = meta.page - 1;
  const nextPage = meta.page + 1;
  return (
    <nav style={{ display: 'flex', gap: 8 }}>
      {meta.page > 1 && (
        <Link href={`/posts?page=${prevPage}`} prefetch>
          Prev
        </Link>
      )}
      {meta.page < meta.last_page && (
        <Link href={`/posts?page=${nextPage}`} prefetch>
          Next
        </Link>
      )}
    </nav>
  );
}
```

### Step G: Handle loading and error states

- Pages Router SSR/SSG: wrap calls in `try/catch` in data functions and render a basic fallback.
- App Router: use `app/posts/loading.tsx` and `app/posts/error.tsx` for route-level states.

Example SSR error handling:
```tsx
export const getServerSideProps = async () => {
  try {
    const payload = await fetchPosts({ page: 1 });
    return { props: { payload } };
  } catch (err) {
    return { props: { payload: { data: [], meta: { page: 1, per_page: 10, total: 0, last_page: 1, sort: 'published_at', order: 'desc' } }, error: String(err) } } as any;
  }
};
```

## 3) Best Practices

### Environment variables
- Use `NEXT_PUBLIC_API_BASE_URL` for client-side code; use `API_BASE_URL` for server-only code.
- Configure per environment:
  - Dev: `http://127.0.0.1:8004`
  - Prod: `https://your-domain.com`

### Error handling strategies
- Map non-OK responses to typed errors; show user-friendly messages.
- Handle `404` (missing) and `422` (validation) explicitly if adding create/update flows.
- Consider centralized logging for API errors in production.

### Performance optimization
- Prefer SSR or ISR for public content to avoid CORS and improve SEO.
- Use ISR (`revalidate`) for content that changes occasionally.
- Avoid client-side fetch for initial page load where SEO matters.
- Cache responses strategically; consider `next: { revalidate }` in App Router.
- Paginate (`per_page`, `page`) to limit payload size.

### Type safety (TypeScript)
- Define `Post`, `Meta`, and `PostsResponse` interfaces and use them across service and UI.
- Narrow the `sort` and `order` union types to the API-supported values.
- Ensure your component props are typed to prevent runtime mismatches.

## Development vs Production

### Development
- Start Laravel dev server: `php artisan serve --port 8004`
- Start Next dev server: `npm run dev`
- Verify in browser: `http://localhost:3000/posts` fetching from `http://127.0.0.1:8004/api/posts`

### Production
- Set `API_BASE_URL` and/or `NEXT_PUBLIC_API_BASE_URL` to your public backend domain.
- If client-side fetching from a different origin, configure CORS on the backend.
- Prefer server-side fetching (SSR/ISR) to simplify CORS and hide backend details.
- Ensure HTTPS for both frontend and backend.

## API Response Reference
- Endpoint: `GET /api/posts`
- Shape:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Alpha",
      "slug": "alpha",
      "excerpt": "...",
      "content": "...",
      "is_published": true,
      "published_at": "2025-10-21T12:34:56.000000Z",
      "category_id": 2,
      "featured_image_path": null
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 27,
    "last_page": 3,
    "sort": "published_at",
    "order": "desc"
  }
}
```

For additional API details (filtering, sorting, pagination), see `docs/api/posts.md`.