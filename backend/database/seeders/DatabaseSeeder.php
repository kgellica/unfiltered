<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Entry;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ------------------------------------------------------------------
        // 1. DEBRA MORGAN
        // ------------------------------------------------------------------
        $deb = User::firstOrCreate(
            ['email' => 'deb.morgan@gmail.com'],
            [
                'name' => 'Debra Morgan',
                'password' => bcrypt('password'),
                'avatar_url' => null,
            ]
        );

        $debEntries = [
            [
                'title' => 'Too Much Damn Coffee Today',
                'entry' => 'Downed my fourth espresso by noon. Homicide department is absolute chaos as usual. If one more person leaves an unwashed mug in the sink, I might lose my mind.',
                'mood' => 'low',
                'bg_color' => '#FDF0F3', // strawberry
                'tags' => ['work', 'coffee', 'police-life']
            ],
            [
                'title' => 'Promoted to Detective',
                'entry' => 'Still can\'t believe it. Lieutenant rank feels surreal, but I worked my ass off for this. Dad would\'ve been proud of me today.',
                'mood' => 'great',
                'bg_color' => '#EBF7EE', // matcha
                'tags' => ['career', 'milestone', 'family']
            ],
            [
                'title' => 'Treadmill Vent Session',
                'entry' => 'Ran six miles until my lungs burned. Best way to clear out the sheer frustration after a bad case brief.',
                'mood' => 'good',
                'bg_color' => '#EAF3FA', // baby
                'tags' => ['fitness', 'workout', 'stress-relief']
            ],
            [
                'title' => 'Dinner with Dex',
                'entry' => 'Grabbed steak with Dexter. He barely said five words as usual, but it\'s nice having him around when everything else goes to hell.',
                'mood' => 'good',
                'bg_color' => '#F8F3E6', // warm
                'tags' => ['family', 'brother', 'dinner']
            ],
            [
                'title' => 'Cold Rainy Shift',
                'entry' => 'Stuck at a wet crime scene for three straight hours in the freezing rain. My boots are completely soaked.',
                'mood' => 'sad',
                'bg_color' => '#EFEFFA', // taro
                'tags' => ['weather', 'work', 'miserable']
            ],
            [
                'title' => 'Overthinking Late Night',
                'entry' => 'Staring at the ceiling at 2 AM wondering if I\'m making all the wrong calls in my personal life. Why is staying grounded so hard?',
                'mood' => 'low',
                'bg_color' => '#F2EBE5', // cozy
                'tags' => ['night-thoughts', 'reflections', 'insomnia']
            ],
            [
                'title' => 'Case Closed Finally',
                'entry' => 'Signed off on the final paperwork for the case. Time to buy a round of beers for the team and actually sleep tonight.',
                'mood' => 'great',
                'bg_color' => '#EBF7EE', // matcha
                'tags' => ['wins', 'work', 'relief']
            ],
            [
                'title' => 'Micromanaging Frustration',
                'entry' => 'Captain is riding my back about paperwork formatting. We\'re supposed to catch bad guys, not write essays.',
                'mood' => 'low',
                'bg_color' => '#FDF0F3', // strawberry
                'tags' => ['work', 'annoyed', 'bureaucracy']
            ],
            [
                'title' => 'Quiet Sunday on the Couch',
                'entry' => 'No phone calls, no emergencies, no case files. Just takeaway food and trash TV. Pure bliss.',
                'mood' => 'okay',
                'bg_color' => '#F2EBE5', // cozy
                'tags' => ['rest', 'weekend', 'chill']
            ],
            [
                'title' => 'Morning Jog by the Marina',
                'entry' => 'Crisp ocean air at sunrise. Reminded me why I love living in Miami despite all the crazy madness.',
                'mood' => 'good',
                'bg_color' => '#EAF3FA', // baby
                'tags' => ['morning', 'miami', 'peace']
            ],
        ];

        $this->seedUserEntries($deb, $debEntries);


        // ------------------------------------------------------------------
        // 2. DEXTER MORGAN
        // ------------------------------------------------------------------
        $dex = User::firstOrCreate(
            ['email' => 'dex.morgan@gmail.com'],
            [
                'name' => 'Dexter Morgan',
                'password' => bcrypt('password'),
                'avatar_url' => null,
            ]
        );

        $dexEntries = [
            [
                'title' => 'Blood Spatter Pattern Analysis',
                'entry' => 'Spent the morning analyzing high-velocity impact spatter from yesterday\'s crime scene. Blood never lies—it tells a precise, orderly story.',
                'mood' => 'good',
                'bg_color' => '#EAF3FA', // baby
                'tags' => ['forensics', 'work', 'science']
            ],
            [
                'title' => 'Night Out on the Slice of Life',
                'entry' => 'Took the boat out past the harbor under the moonlight. The water was calm, dark, and perfectly silent. Everything feels orderly again.',
                'mood' => 'great',
                'bg_color' => '#EFEFFA', // taro
                'tags' => ['boating', 'night', 'solitude']
            ],
            [
                'title' => 'Lunch with Deb',
                'entry' => 'Debra was venting about department politics. I nodded at the right intervals and offered sympathetic expressions. Social masks take effort.',
                'mood' => 'okay',
                'bg_color' => '#F8F3E6', // warm
                'tags' => ['family', 'mask', 'lunch']
            ],
            [
                'title' => 'Disruption in Routine',
                'entry' => 'An unexpected equipment calibration delayed my blood lab analysis by three hours. I dislike when carefully planned schedules get derailed.',
                'mood' => 'low',
                'bg_color' => '#F2EBE5', // cozy
                'tags' => ['lab', 'routine', 'minor-annoyance']
            ],
            [
                'title' => 'Order and Routine',
                'entry' => 'Cleaned and organized all lab slides in alphabetical sequence. Structure brings a comforting sense of control to an otherwise messy world.',
                'mood' => 'good',
                'bg_color' => '#EBF7EE', // matcha
                'tags' => ['organization', 'focus', 'lab']
            ],
            [
                'title' => 'Doughnuts for the Department',
                'entry' => 'Brought two dozen Boston cream doughnuts to the station. A simple gesture keeps colleagues friendly and unsuspicious.',
                'mood' => 'good',
                'bg_color' => '#F8F3E6', // warm
                'tags' => ['work', 'donuts', 'camouflage']
            ],
            [
                'title' => 'Rainy Evening at the Docks',
                'entry' => 'Watched the rain ripple against the ocean water. Rain washes away surface traces and resets the city landscape.',
                'mood' => 'okay',
                'bg_color' => '#EAF3FA', // baby
                'tags' => ['rain', 'miami', 'observations']
            ],
            [
                'title' => 'Reflections on Harry\'s Code',
                'entry' => 'Recalled an old lesson from Harry while reviewing evidence files tonight. Discipline and strict adherence to rules are the only safety nets.',
                'mood' => 'good',
                'bg_color' => '#EFEFFA', // taro
                'tags' => ['memories', 'code', 'discipline']
            ],
            [
                'title' => 'Late Lab Shift',
                'entry' => 'Working alone in the basement lab past 9 PM. The quiet hum of the centrifuge is remarkably soothing.',
                'mood' => 'good',
                'bg_color' => '#F2EBE5', // cozy
                'tags' => ['work', 'quiet', 'night-shift']
            ],
            [
                'title' => 'Unorganized Evidence Files',
                'entry' => 'Found misplaced blood report files left behind by an intern. Sloppiness in documentation is a habit I cannot stand.',
                'mood' => 'low',
                'bg_color' => '#FDF0F3', // strawberry
                'tags' => ['work', 'frustration', 'details']
            ],
        ];

        $this->seedUserEntries($dex, $dexEntries);
    }

    /**
     * Helper to attach entries and tags to a user.
     */
    private function seedUserEntries(User $user, array $entries): void
    {
        foreach ($entries as $index => $data) {
            $entry = Entry::create([
                'user_id' => $user->id,
                'title' => $data['title'],
                'content' => $data['entry'],
                'mood' => $data['mood'],
                'bg_color' => $data['bg_color'],
                'entry_date' => Carbon::now()->subDays(count($entries) - $index)->toDateString(),
                'photo_path' => null,
                'voice_path' => null,
            ]);

            $tagIds = [];
            foreach ($data['tags'] as $tagName) {
                $tag = Tag::firstOrCreate([
                    'user_id' => $user->id,
                    'name' => strtolower($tagName),
                ]);
                $tagIds[] = $tag->id;
            }

            $entry->tags()->sync($tagIds);
        }
    }
}
