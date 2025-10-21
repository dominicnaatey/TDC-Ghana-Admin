# Posts API

Base URL: `/api`

## List Posts
- **GET** `/api/posts`
- Returns published posts by default.
- Supports filtering, sorting, and pagination.

Query params:
- `q` (string) search in `title`, `excerpt`, `content`
- `category_id` (number) filter by category
- `is_published` (boolean) include unpublished when true/false; default true
- `from` (ISO date) lower bound for `date_field`
- `to` (ISO date) upper bound for `date_field`
- `date_field` (`published_at` | `created_at`) default: `published_at`
- `sort` (`published_at` | `created_at` | `updated_at` | `title`) default: `published_at`
- `order` (`asc` | `desc`) default: `desc`
- `per_page` (1–100) default: `10`

Response 200:
```json
{
  "data": [ { "id": 1, "title": "...", "slug": "...", "excerpt": "...", "content": "...", "is_published": true, "published_at": "...", "category_id": 2, "featured_image_path": null, "category": { "id": 2, "name": "News" } } ],
  "meta": { "current_page": 1, "per_page": 10, "total": 57, "last_page": 6, "sort": "published_at", "order": "desc" }
}
```

## Get Post
- **GET** `/api/posts/{id}`
- Returns a single post. If unauthenticated and the post is unpublished, returns 404.

Responses:
- `200` with `{ data: Post }`
- `404` `{ "message": "Not found" }`

## Create Post
- **POST** `/api/posts` (requires `auth:web`)
- Content-Type: `application/json` OR `multipart/form-data` when uploading `featured_image`
- Body fields (validated by `StorePostRequest`):
  - `title` (string, required)
  - `slug` (string, unique; auto-slugged from title if omitted)
  - `excerpt` (string, nullable)
  - `content` (string, nullable)
  - `is_published` (boolean)
  - `published_at` (ISO datetime string)
  - `category_id` (number, nullable)
  - `featured_image` (file, optional; only in multipart)

Responses:
- `201` `{ data: Post }`
- `422` validation errors
- `500` `{ message: "Failed to create post" }`

## Update Post
- **PUT** `/api/posts/{id}` (requires `auth:web`)
- Same body as Create; supports `remove_featured_image` (boolean) to delete existing image.

Responses:
- `200` `{ data: Post }`
- `422` validation errors
- `404` if post not found
- `500` `{ message: "Failed to update post" }`

## Delete Post (Soft Delete)
- **DELETE** `/api/posts/{id}` (requires `auth:web`)

Responses:
- `204` empty body
- `404` if post not found
- `500` `{ message: "Failed to delete post" }`

## Authentication
- Write endpoints are protected by `auth:web` (session-based). For Next.js running on the same domain, ensure cookies are included.
- For cross-origin SPAs, consider Laravel Sanctum and proper CORS setup.

## Next.js Examples
```ts
// List posts with pagination
export async function fetchPosts({ page = 1, q = '' }: { page?: number; q?: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts?page=${page}&q=${encodeURIComponent(q)}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 }, // optional caching in Next.js
  });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

// Read one post
export async function fetchPost(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts/${id}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

// Create (session-auth) from Next.js server actions or API routes
export async function createPost(formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts`, {
    method: 'POST',
    body: formData, // supports featured_image
    headers: { Accept: 'application/json' },
    credentials: 'include', // include session cookie
  });
  return res.json();
}
```

## Notes
- Include `Accept: application/json` in requests to ensure JSON error responses.
- Consider DB indexes on `slug`, `is_published`, `published_at`, and `category_id` for performance.