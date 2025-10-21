<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function actingAsVerifiedUser(): User
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $this->actingAs($user);
        return $user;
    }

    public function test_index_returns_published_posts_by_default(): void
    {
        Post::create([
            'title' => 'Published 1',
            'slug' => 'published-1',
            'excerpt' => '...',
            'content' => '...',
            'is_published' => true,
            'published_at' => now(),
        ]);
        Post::create([
            'title' => 'Draft 1',
            'slug' => 'draft-1',
            'is_published' => false,
            'published_at' => null,
        ]);

        $response = $this->get('/api/posts', [ 'Accept' => 'application/json' ]);
        $response->assertStatus(200);

        $json = $response->json();
        $this->assertArrayHasKey('data', $json);
        $this->assertArrayHasKey('meta', $json);
        $this->assertCount(1, $json['data']);
        $this->assertTrue($json['data'][0]['is_published']);
    }

    public function test_index_supports_search_category_sort_and_pagination(): void
    {
        $news = Category::create(['name' => 'News', 'description' => 'General news']);
        $tech = Category::create(['name' => 'Tech', 'description' => 'Tech news']);

        Post::create(['title' => 'Alpha', 'slug' => 'alpha', 'excerpt' => 'alpha', 'content' => 'alpha', 'is_published' => true, 'published_at' => now(), 'category_id' => $news->id]);
        Post::create(['title' => 'Beta', 'slug' => 'beta', 'excerpt' => 'beta', 'content' => 'beta', 'is_published' => true, 'published_at' => now(), 'category_id' => $tech->id]);
        Post::create(['title' => 'Alpha Two', 'slug' => 'alpha-two', 'excerpt' => 'alpha two', 'content' => 'alpha two', 'is_published' => true, 'published_at' => now(), 'category_id' => $news->id]);

        $response = $this->get('/api/posts?q=Alpha&sort=title&order=asc&per_page=1', [ 'Accept' => 'application/json' ]);
        $response->assertStatus(200);
        $json = $response->json();
        $this->assertSame(1, $json['meta']['per_page']);
        $this->assertSame('title', $json['meta']['sort']);
        $this->assertSame('asc', $json['meta']['order']);
        $this->assertCount(1, $json['data']);
        $this->assertSame('Alpha', $json['data'][0]['title']);
    }

    public function test_show_returns_404_for_unpublished_when_unauthenticated(): void
    {
        $post = Post::create(['title' => 'Hidden', 'slug' => 'hidden', 'is_published' => false]);
        $response = $this->get('/api/posts/'.$post->id, [ 'Accept' => 'application/json' ]);
        $response->assertStatus(404);
        $response->assertJson(['message' => 'Not found']);
    }

    public function test_show_returns_unpublished_for_authenticated_user(): void
    {
        $this->actingAsVerifiedUser();
        $post = Post::create(['title' => 'Hidden', 'slug' => 'hidden', 'is_published' => false]);
        $response = $this->get('/api/posts/'.$post->id, [ 'Accept' => 'application/json' ]);
        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => ['id', 'title', 'slug', 'is_published']]);
        $this->assertSame(false, $response->json('data.is_published'));
    }

    public function test_store_creates_post_and_returns_201(): void
    {
        $this->actingAsVerifiedUser();

        $payload = [
            'title' => 'Create Title',
            // slug omitted -> auto-slug from title
            'excerpt' => 'Create excerpt',
            'content' => 'Create content',
            'is_published' => true,
            'published_at' => '2025-10-21T12:00',
            'category_id' => null,
        ];

        $response = $this->postJson('/api/posts', $payload, [ 'Accept' => 'application/json' ]);
        $response->assertStatus(201);
        $response->assertJsonStructure(['data' => ['id', 'title', 'slug', 'is_published', 'published_at']]);

        $post = Post::first();
        $this->assertNotNull($post);
        $this->assertSame('create-title', $post->slug);
        $this->assertTrue($post->is_published);
        $this->assertNotNull($post->published_at);
        $this->assertSame('2025-10-21 12:00', $post->published_at->format('Y-m-d H:i'));
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAsVerifiedUser();
        $response = $this->postJson('/api/posts', [ 'excerpt' => 'no title' ], [ 'Accept' => 'application/json' ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    public function test_update_updates_post_and_handles_image_removal(): void
    {
        $this->actingAsVerifiedUser();
        Storage::fake('public');

        Storage::disk('public')->put('posts/to-remove.jpg', 'file');
        $post = Post::create([
            'title' => 'Original',
            'slug' => 'original',
            'excerpt' => 'e',
            'content' => 'c',
            'is_published' => false,
            'published_at' => null,
            'featured_image_path' => 'posts/to-remove.jpg',
        ]);

        $payload = [
            'title' => 'Updated',
            'excerpt' => 'updated e',
            'content' => 'updated c',
            'is_published' => true,
            'published_at' => '2025-10-21T13:45',
            'remove_featured_image' => true,
        ];

        $response = $this->putJson('/api/posts/'.$post->id, $payload, [ 'Accept' => 'application/json' ]);
        $response->assertStatus(200);

        $post->refresh();
        $this->assertSame('Updated', $post->title);
        $this->assertTrue($post->is_published);
        $this->assertSame('2025-10-21 13:45', $post->published_at->format('Y-m-d H:i'));
        $this->assertNull($post->featured_image_path);
        $this->assertFalse(Storage::disk('public')->exists('posts/to-remove.jpg'));
    }

    public function test_update_replaces_featured_image_on_new_upload(): void
    {
        $this->actingAsVerifiedUser();
        Storage::fake('public');

        Storage::disk('public')->put('posts/old.jpg', 'old');
        $post = Post::create([
            'title' => 'Original',
            'slug' => 'original',
            'featured_image_path' => 'posts/old.jpg',
        ]);

        $payload = [
            'title' => 'New',
            'is_published' => false,
            'featured_image' => UploadedFile::fake()->create('new.jpg', 10, 'image/jpeg'),
        ];

        $response = $this->put('/api/posts/'.$post->id, $payload, [ 'Accept' => 'application/json' ]);
        $response->assertStatus(200);

        $post->refresh();
        $this->assertNotNull($post->featured_image_path);
        $this->assertStringStartsWith('posts/', $post->featured_image_path);
        $this->assertTrue(Storage::disk('public')->exists($post->featured_image_path));
        $this->assertFalse(Storage::disk('public')->exists('posts/old.jpg'));
    }

    public function test_delete_soft_deletes_and_returns_204(): void
    {
        $this->actingAsVerifiedUser();
        $post = Post::create(['title' => 'ToDelete', 'slug' => 'todelete']);

        $response = $this->delete('/api/posts/'.$post->id, [], [ 'Accept' => 'application/json' ]);
        $response->assertStatus(204);

        $deleted = Post::withTrashed()->find($post->id);
        $this->assertNotNull($deleted->deleted_at);
    }

    public function test_write_endpoints_require_auth(): void
    {
        $post = Post::create(['title' => 'Unauth', 'slug' => 'unauth']);

        $create = $this->postJson('/api/posts', ['title' => 'X'], [ 'Accept' => 'application/json' ]);
        $create->assertStatus(401);

        $update = $this->putJson('/api/posts/'.$post->id, ['title' => 'Y'], [ 'Accept' => 'application/json' ]);
        $update->assertStatus(401);

        $delete = $this->delete('/api/posts/'.$post->id, [], [ 'Accept' => 'application/json' ]);
        $delete->assertStatus(401);
    }
}