<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Category;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::query()
            ->with('category')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::query()->orderBy('name')->get(['id','name']);
        return Inertia::render('Admin/Posts/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['is_published'] = $request->boolean('is_published');

        // Normalize published_at (HTML datetime-local uses "T") and cast category_id
        if (isset($data['published_at']) && is_string($data['published_at'])) {
            $data['published_at'] = str_replace('T', ' ', $data['published_at']);
        }
        if (array_key_exists('category_id', $data)) {
            $data['category_id'] = $data['category_id'] ? (int)$data['category_id'] : null;
        }

        if ($request->hasFile('featured_image')) {
            $data['featured_image_path'] = $request->file('featured_image')->store('posts', 'public');
        }

        unset($data['featured_image']);

        $post = Post::create($data);

        return redirect()->route('admin.posts.edit', $post)->with('success', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return redirect()->route('admin.posts.edit', $post);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        $categories = Category::query()->orderBy('name')->get(['id','name']);
        return Inertia::render('Admin/Posts/Edit', [
            'post' => $post,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['is_published'] = $request->boolean('is_published');

        // Normalize published_at (HTML datetime-local uses "T") and cast category_id
        if (isset($data['published_at']) && is_string($data['published_at'])) {
            $data['published_at'] = str_replace('T', ' ', $data['published_at']);
        }
        if (array_key_exists('category_id', $data)) {
            $data['category_id'] = $data['category_id'] ? (int)$data['category_id'] : null;
        }

        // Handle removal of existing image
        if ($request->boolean('remove_featured_image')) {
            if ($post->featured_image_path && Storage::disk('public')->exists($post->featured_image_path)) {
                Storage::disk('public')->delete($post->featured_image_path);
            }
            $data['featured_image_path'] = null;
        } elseif ($request->hasFile('featured_image')) {
            // Replace existing image if new one uploaded
            if ($post->featured_image_path && Storage::disk('public')->exists($post->featured_image_path)) {
                Storage::disk('public')->delete($post->featured_image_path);
            }
            $data['featured_image_path'] = $request->file('featured_image')->store('posts', 'public');
        }

        unset($data['featured_image'], $data['remove_featured_image']);

        $post->update($data);

        return redirect()->route('admin.posts.edit', $post)->with('success', 'Post updated successfully.');
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();
        return redirect()->route('admin.posts.index')->with('success', 'Post moved to Deleted Posts.');
    }

    /**
     * List deleted (trashed) posts.
     */
    public function deleted()
    {
        $posts = Post::onlyTrashed()
            ->with('category')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Posts/Deleted', [
            'posts' => $posts,
        ]);
    }

    /**
     * Restore a soft-deleted post.
     */
    public function restore($id): RedirectResponse
    {
        $post = Post::withTrashed()->findOrFail($id);
        $post->restore();

        // Ensure any restored post is moved to draft status
        $post->is_published = false;
        $post->published_at = null;
        $post->save();

        return redirect()->route('admin.posts.deleted')->with('success', 'Post restored successfully.');
    }

    /**
     * Permanently delete a trashed post.
     */
    public function forceDelete($id): RedirectResponse
    {
        $post = Post::withTrashed()->findOrFail($id);
        $post->forceDelete();

        return redirect()->route('admin.posts.deleted')->with('success', 'Post permanently deleted.');
    }
}
