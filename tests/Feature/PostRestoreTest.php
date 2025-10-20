<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostRestoreTest extends TestCase
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

    public function test_restore_sets_post_to_draft_and_preserves_content(): void
    {
        $this->actingAsVerifiedUser();
        Storage::fake('public');

        // Seed a published post with content and metadata
        Storage::disk('public')->put('posts/restore.jpg', 'imagecontent');
        $post = Post::create([
            'title' => 'Published Title',
            'slug' => 'published-title',
            'excerpt' => 'Published excerpt',
            'content' => 'Published content',
            'category_id' => null,
            'is_published' => true,
            'published_at' => '2025-10-20 10:00',
            'featured_image_path' => 'posts/restore.jpg',
        ]);

        // Soft delete then restore via route
        $post->delete();
        $response = $this->post(route('admin.posts.restore', $post));
        $response->assertRedirect(route('admin.posts.deleted', absolute: false));

        $post->refresh();
        // Not trashed anymore
        $this->assertNull($post->deleted_at);
        // Draft status enforced
        $this->assertFalse($post->is_published);
        $this->assertNull($post->published_at);
        // Content and metadata preserved
        $this->assertSame('Published Title', $post->title);
        $this->assertSame('published-title', $post->slug);
        $this->assertSame('Published excerpt', $post->excerpt);
        $this->assertSame('Published content', $post->content);
        $this->assertSame('posts/restore.jpg', $post->featured_image_path);
        $this->assertTrue(Storage::disk('public')->exists('posts/restore.jpg'));
    }
}