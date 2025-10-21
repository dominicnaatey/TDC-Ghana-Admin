<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class PostController extends Controller
{
    /**
     * List posts with filtering, sorting, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::query()->with(['category:id,name']);

        // Default: only published posts unless explicitly requested otherwise
        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        } else {
            $query->where('is_published', true);
        }

        // Search query across title, excerpt, content
        $q = trim((string) $request->query('q', ''));
        if ($q !== '') {
            $query->where(function ($q2) use ($q) {
                $q2->where('title', 'like', "%$q%")
                   ->orWhere('excerpt', 'like', "%$q%")
                   ->orWhere('content', 'like', "%$q%");
            });
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->query('category_id'));
        }

        // Date range filters
        $from = $request->query('from');
        $to = $request->query('to');
        $dateField = $request->query('date_field', 'published_at'); // or created_at
        if ($from) {
            $query->where($dateField, '>=', $from);
        }
        if ($to) {
            $query->where($dateField, '<=', $to);
        }

        // Sorting
        $sort = $request->query('sort', 'published_at');
        $order = strtolower((string) $request->query('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['published_at', 'created_at', 'updated_at', 'title'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'published_at';
        }
        $query->orderBy($sort, $order)->orderBy('id', 'desc');

        // Pagination
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min(100, $perPage));
        $paginator = $query->paginate($perPage)->appends($request->query());

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'sort' => $sort,
                'order' => $order,
            ],
        ]);
    }

    /**
     * Retrieve a single post.
     */
    public function show(Post $post, Request $request): JsonResponse
    {
        // Hide unpublished posts from unauthenticated requests
        if (!$request->user() && !$post->is_published) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json([
            'data' => $post->loadMissing('category:id,name'),
        ]);
    }

    /**
     * Create a new post.
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
            $data['is_published'] = $request->boolean('is_published');

            if (isset($data['published_at']) && is_string($data['published_at'])) {
                $data['published_at'] = str_replace('T', ' ', $data['published_at']);
            }
            if (array_key_exists('category_id', $data)) {
                $data['category_id'] = $data['category_id'] ? (int) $data['category_id'] : null;
            }

            if ($request->hasFile('featured_image')) {
                $data['featured_image_path'] = $request->file('featured_image')->store('posts', 'public');
            }
            unset($data['featured_image']);

            $post = Post::create($data);

            return response()->json(['data' => $post], 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to create post', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing post.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
            $data['is_published'] = $request->boolean('is_published');

            if (isset($data['published_at']) && is_string($data['published_at'])) {
                $data['published_at'] = str_replace('T', ' ', $data['published_at']);
            }
            if (array_key_exists('category_id', $data)) {
                $data['category_id'] = $data['category_id'] ? (int) $data['category_id'] : null;
            }

            // Handle image updates
            if ($request->boolean('remove_featured_image')) {
                if ($post->featured_image_path && Storage::disk('public')->exists($post->featured_image_path)) {
                    Storage::disk('public')->delete($post->featured_image_path);
                }
                $data['featured_image_path'] = null;
            } elseif ($request->hasFile('featured_image')) {
                if ($post->featured_image_path && Storage::disk('public')->exists($post->featured_image_path)) {
                    Storage::disk('public')->delete($post->featured_image_path);
                }
                $data['featured_image_path'] = $request->file('featured_image')->store('posts', 'public');
            }
            unset($data['featured_image'], $data['remove_featured_image']);

            $post->update($data);

            return response()->json(['data' => $post]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to update post', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Soft-delete a post.
     */
    public function destroy(Post $post): JsonResponse
    {
        try {
            $post->delete();
            return response()->json(null, 204);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to delete post', 'error' => $e->getMessage()], 500);
        }
    }
}