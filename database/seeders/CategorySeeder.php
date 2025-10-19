<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'News', 'description' => 'General updates and news'],
            ['name' => 'Events', 'description' => 'Upcoming and past events'],
            ['name' => 'Announcements', 'description' => 'Official announcements and notices'],
        ];

        foreach ($items as $item) {
            Category::firstOrCreate(['name' => $item['name']], ['description' => $item['description']]);
        }
    }
}