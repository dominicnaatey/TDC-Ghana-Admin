<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Throwable;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::query()
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        try {
            Category::create($request->validated());
            return redirect()->route('admin.categories.index')
                ->with('success', 'Category created successfully');
        } catch (Throwable $e) {
            return redirect()->back()->withErrors(['category' => $e->getMessage()]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        try {
            $category->update($request->validated());
            return redirect()->route('admin.categories.index')
                ->with('success', 'Category updated successfully');
        } catch (Throwable $e) {
            return redirect()->back()->withErrors(['category' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        try {
            $category->delete();
            return redirect()->route('admin.categories.index')
                ->with('success', 'Category deleted successfully');
        } catch (Throwable $e) {
            return redirect()->back()->withErrors(['category' => $e->getMessage()]);
        }
    }
}