<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $posts = Post::with('category:id,name')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10);

        $posts->getCollection()->transform(function (Post $post) {
            return $this->transformPost($post);
        });

        return response()->json($posts);
    }

    public function show(Post $post, Request $request): JsonResponse
    {
        if (! $request->user() && ! $post->is_published) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $post->loadMissing('category:id,name');

        return response()->json([
            'data' => $this->transformPost($post),
        ]);
    }

    private function transformPost(Post $post): array
    {
        $data = $post->toArray();

        $data['featured_image_url'] = $post->featured_image_path
            ? url(Storage::url($post->featured_image_path))
            : null;

        if (! empty($data['content'])) {
            $base = rtrim(config('app.url'), '/');

            $data['content'] = str_replace(
                ['src="/admin/storage/', 'src="/storage/'],
                ['src="' . $base . '/admin/storage/', 'src="' . $base . '/storage/'],
                $data['content']
            );
        }

        return $data;
    }
}
