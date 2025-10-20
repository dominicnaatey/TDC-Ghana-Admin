<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostUpdateTest extends TestCase
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

    public function test_updates_fields_without_changing_featured_image(): void
    {
        $this->actingAsVerifiedUser();
        Storage::fake('public');

        // Seed an existing post with an existing featured image
        Storage::disk('public')->put('posts/existing.jpg', 'fake');
        $post = Post::create([
            'title' => 'Original Title',
            'slug' => 'original-title',
            'excerpt' => 'Original excerpt',
            'content' => 'Original content',
            'category_id' => null,
            'is_published' => false,
            'published_at' => null,
            'featured_image_path' => 'posts/existing.jpg',
        ]);

        $payload = [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'excerpt' => 'Updated excerpt',
            'content' => 'Updated content',
            'is_published' => true,
            'published_at' => '2025-10-20 12:34',
            // no featured_image provided
        ];

        $response = $this->put(route('admin.posts.update', $post), $payload);
        $response->assertRedirect(route('admin.posts.edit', $post, absolute: false));

        $post->refresh();
        $this->assertSame('Updated Title', $post->title);
        $this->assertSame('updated-title', $post->slug);
        $this->assertSame('Updated excerpt', $post->excerpt);
        $this->assertSame('Updated content', $post->content);
        $this->assertTrue($post->is_published);
        $this->assertNotNull($post->published_at);
        $this->assertSame('posts/existing.jpg', $post->featured_image_path, 'Featured image should be unchanged');
        $this->assertTrue(Storage::disk('public')->exists('posts/existing.jpg'), 'Existing image file should still exist');
    }

    public function test_replaces_featured_image_on_new_upload(): void
    {
        $this->actingAsVerifiedUser();
        Storage::fake('public');

        // Seed an existing post with an existing featured image
        Storage::disk('public')->put('posts/old.jpg', 'oldfile');
        $post = Post::create([
            'title' => 'Original Title',
            'slug' => 'original-title',
            'excerpt' => 'Original excerpt',
            'content' => 'Original content',
            'category_id' => null,
            'is_published' => false,
            'published_at' => null,
            'featured_image_path' => 'posts/old.jpg',
        ]);

        $payload = [
            'title' => 'New Title',
            'slug' => 'new-title',
            'excerpt' => 'New excerpt',
            'content' => 'New content',
            'is_published' => false,
            'published_at' => null,
            'featured_image' => UploadedFile::fake()->create('new.jpg', 10, 'image/jpeg'),
        ];

        $response = $this->put(route('admin.posts.update', $post), $payload);
        $response->assertRedirect(route('admin.posts.edit', $post, absolute: false));

        $post->refresh();
        $this->assertSame('New Title', $post->title);
        $this->assertSame('new-title', $post->slug);
        $this->assertSame('New excerpt', $post->excerpt);
        $this->assertSame('New content', $post->content);
        $this->assertFalse($post->is_published);
        $this->assertNull($post->published_at);

        // New image stored, old deleted
        $this->assertNotNull($post->featured_image_path);
        $this->assertStringStartsWith('posts/', $post->featured_image_path);
        $this->assertTrue(Storage::disk('public')->exists($post->featured_image_path));
        $this->assertFalse(Storage::disk('public')->exists('posts/old.jpg'));
    }

    public function test_removes_featured_image_when_flagged(): void
    {
        $this->actingAsVerifiedUser();
        Storage::fake('public');

        // Seed an existing post with an existing featured image
        Storage::disk('public')->put('posts/remove.jpg', 'toremove');
        $post = Post::create([
            'title' => 'Original Title',
            'slug' => 'original-title',
            'excerpt' => 'Original excerpt',
            'content' => 'Original content',
            'category_id' => null,
            'is_published' => false,
            'published_at' => null,
            'featured_image_path' => 'posts/remove.jpg',
        ]);

        $payload = [
            'title' => 'Keep Title',
            'slug' => 'keep-title',
            'excerpt' => 'Keep excerpt',
            'content' => 'Keep content',
            'is_published' => false,
            'published_at' => null,
            'remove_featured_image' => true,
        ];

        $response = $this->put(route('admin.posts.update', $post), $payload);
        $response->assertRedirect(route('admin.posts.edit', $post, absolute: false));

        $post->refresh();
        $this->assertNull($post->featured_image_path);
        $this->assertFalse(Storage::disk('public')->exists('posts/remove.jpg'));
    }

    public function test_normalizes_published_at_and_casts_category_id(): void
    {
        $this->actingAsVerifiedUser();
        Storage::fake('public');

        $category = Category::create([
            'name' => 'News',
            'description' => 'General news',
        ]);

        $post = Post::create([
            'title' => 'Original Title',
            'slug' => 'original-title',
            'excerpt' => 'Original excerpt',
            'content' => 'Original content',
            'category_id' => null,
            'is_published' => false,
            'published_at' => null,
            'featured_image_path' => null,
        ]);

        $payload = [
            'title' => 'Normalized Title',
            'slug' => 'normalized-title',
            'excerpt' => 'Normalized excerpt',
            'content' => 'Normalized content',
            'is_published' => true,
            // HTML datetime-local often sends with T separator
            'published_at' => '2025-10-20T12:34',
            'category_id' => (string) $category->id, // casts to int
        ];

        $response = $this->put(route('admin.posts.update', $post), $payload);
        $response->assertRedirect(route('admin.posts.edit', $post, absolute: false));

        $post->refresh();
        $this->assertTrue($post->is_published);
        $this->assertNotNull($post->published_at);
        $this->assertSame('2025-10-20 12:34', $post->published_at->format('Y-m-d H:i'));
        $this->assertSame($category->id, $post->category_id);
    }
}