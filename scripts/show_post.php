<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

$id = (int)($argv[1] ?? 0);
if (!$id) {
    fwrite(STDERR, "Usage: php scripts/show_post.php <id>\n");
    exit(1);
}

$post = \App\Models\Post::find($id);
if (!$post) {
    fwrite(STDERR, "Post not found: {$id}\n");
    exit(2);
}

echo json_encode([
    'id' => $post->id,
    'title' => $post->title,
    'slug' => $post->slug,
    'content_length' => strlen($post->content ?? ''),
    'content_sample' => mb_substr(strip_tags($post->content ?? ''), 0, 120),
], JSON_PRETTY_PRINT) . PHP_EOL;