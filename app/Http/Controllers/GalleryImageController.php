<?php

namespace App\Http\Controllers;

use App\Models\GalleryImage;
use App\Http\Requests\StoreGalleryImageRequest;
use App\Http\Requests\UpdateGalleryImageRequest;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class GalleryImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $images = GalleryImage::query()
            ->orderBy('sort_order')
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/Gallery/Index', [
            'images' => $images,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Gallery/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGalleryImageRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $path = $request->file('image')->store('gallery', 'public');

        GalleryImage::create([
            'title' => $data['title'],
            'image_path' => $path,
            'caption' => $data['caption'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_published' => (bool)($data['is_published'] ?? false),
            'published_at' => $data['published_at'] ?? null,
        ]);

        return redirect()->route('admin.gallery.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(GalleryImage $galleryImage)
    {
        return redirect()->route('admin.gallery.edit', $galleryImage);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GalleryImage $galleryImage)
    {
        return Inertia::render('Admin/Gallery/Edit', [
            'image' => $galleryImage,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGalleryImageRequest $request, GalleryImage $galleryImage): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($galleryImage->image_path && Storage::disk('public')->exists($galleryImage->image_path)) {
                Storage::disk('public')->delete($galleryImage->image_path);
            }
            $galleryImage->image_path = $request->file('image')->store('gallery', 'public');
        }

        $galleryImage->title = $data['title'];
        $galleryImage->caption = $data['caption'] ?? null;
        $galleryImage->sort_order = $data['sort_order'] ?? 0;
        $galleryImage->is_published = (bool)($data['is_published'] ?? false);
        $galleryImage->published_at = $data['published_at'] ?? null;
        $galleryImage->save();

        return redirect()->route('admin.gallery.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GalleryImage $galleryImage): RedirectResponse
    {
        if ($galleryImage->image_path && Storage::disk('public')->exists($galleryImage->image_path)) {
            Storage::disk('public')->delete($galleryImage->image_path);
        }
        $galleryImage->delete();
        return redirect()->route('admin.gallery.index');
    }
}
