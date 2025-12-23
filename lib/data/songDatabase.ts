/**
 * Song Database
 * 
 * Phase 6C: Database of beginner songs with chord progressions
 * Used for fragment matching to identify what song a child might be playing
 */

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'beginner' | 'easy' | 'intermediate';
  /** Main chord progression (simplified) */
  chords: string[];
  /** Key the song is commonly played in */
  key: string;
  /** Mode of the key */
  mode: 'major' | 'minor';
  /** Optional: tempo category */
  tempo?: 'slow' | 'medium' | 'fast';
  /** Tags for categorization */
  tags: string[];
  /** Fun fact or coaching hook */
  funFact?: string;
}

/**
 * Curated database of beginner-friendly songs
 * Focused on songs kids commonly learn in piano/guitar lessons
 */
export const SONG_DATABASE: Song[] = [
  // ===== CLASSIC BEGINNER PIANO =====
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    difficulty: 'beginner',
    chords: ['C', 'F', 'C', 'G', 'C', 'F', 'C', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'slow',
    tags: ['nursery', 'classic', 'first-song'],
    funFact: 'Mozart wrote 12 variations on this melody when he was just a young man!',
  },
  {
    id: 'mary-had-a-little-lamb',
    title: 'Mary Had a Little Lamb',
    artist: 'Traditional',
    difficulty: 'beginner',
    chords: ['C', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'medium',
    tags: ['nursery', 'classic', 'first-song'],
    funFact: 'This was one of the first songs ever recorded by Thomas Edison!',
  },
  {
    id: 'hot-cross-buns',
    title: 'Hot Cross Buns',
    artist: 'Traditional',
    difficulty: 'beginner',
    chords: ['C', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'medium',
    tags: ['nursery', 'classic', 'first-song'],
    funFact: 'This song is about Easter treats that were sold on the streets of London!',
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    difficulty: 'beginner',
    chords: ['C', 'G', 'C', 'F', 'C', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'medium',
    tags: ['celebration', 'classic'],
    funFact: 'This is the most recognized song in the English language!',
  },
  {
    id: 'jingle-bells',
    title: 'Jingle Bells',
    artist: 'James Lord Pierpont',
    difficulty: 'beginner',
    chords: ['C', 'F', 'C', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'fast',
    tags: ['christmas', 'holiday', 'classic'],
    funFact: 'This was originally written for Thanksgiving, not Christmas!',
  },
  {
    id: 'old-macdonald',
    title: 'Old MacDonald Had a Farm',
    artist: 'Traditional',
    difficulty: 'beginner',
    chords: ['G', 'C', 'G', 'D', 'G'],
    key: 'G',
    mode: 'major',
    tempo: 'medium',
    tags: ['nursery', 'animals', 'classic'],
    funFact: 'Make animal sounds between verses for extra fun!',
  },
  {
    id: 'london-bridge',
    title: 'London Bridge Is Falling Down',
    artist: 'Traditional',
    difficulty: 'beginner',
    chords: ['C', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'medium',
    tags: ['nursery', 'classic', 'game-song'],
  },

  // ===== EASY POP/ROCK =====
  {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    difficulty: 'easy',
    chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'slow',
    tags: ['beatles', 'pop', 'classic-rock'],
    funFact: 'Paul McCartney wrote this after dreaming about his mother Mary.',
  },
  {
    id: 'imagine',
    title: 'Imagine',
    artist: 'John Lennon',
    difficulty: 'easy',
    chords: ['C', 'F', 'C', 'F', 'Am', 'Dm', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'slow',
    tags: ['beatles', 'pop', 'peace'],
    funFact: 'One of the most covered songs of all time with a simple chord progression.',
  },
  {
    id: 'hey-jude',
    title: 'Hey Jude',
    artist: 'The Beatles',
    difficulty: 'easy',
    chords: ['C', 'G', 'G', 'C', 'F', 'C', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'medium',
    tags: ['beatles', 'pop', 'classic-rock'],
    funFact: 'Originally "Hey Jules" - written for John Lennon\'s son Julian.',
  },
  {
    id: 'stand-by-me',
    title: 'Stand By Me',
    artist: 'Ben E. King',
    difficulty: 'easy',
    chords: ['C', 'Am', 'F', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'medium',
    tags: ['soul', 'classic', 'easy-guitar'],
    funFact: 'Uses the famous "50s progression" - you can play dozens of songs with these chords!',
  },
  {
    id: 'house-of-the-rising-sun',
    title: 'House of the Rising Sun',
    artist: 'The Animals',
    difficulty: 'easy',
    chords: ['Am', 'C', 'D', 'F', 'Am', 'C', 'E', 'Am'],
    key: 'A',
    mode: 'minor',
    tempo: 'slow',
    tags: ['folk', 'classic-rock', 'guitar-classic'],
    funFact: 'One of the most popular songs to learn fingerpicking guitar!',
  },
  {
    id: 'love-me-do',
    title: 'Love Me Do',
    artist: 'The Beatles',
    difficulty: 'easy',
    chords: ['G', 'C', 'G', 'C', 'G', 'D', 'C', 'G'],
    key: 'G',
    mode: 'major',
    tempo: 'medium',
    tags: ['beatles', 'pop', '60s'],
    funFact: 'The Beatles\' first single - only two chords for most of the song!',
  },
  {
    id: 'knockin-on-heavens-door',
    title: 'Knockin\' on Heaven\'s Door',
    artist: 'Bob Dylan',
    difficulty: 'easy',
    chords: ['G', 'D', 'Am', 'G', 'D', 'C'],
    key: 'G',
    mode: 'major',
    tempo: 'slow',
    tags: ['folk', 'classic', 'guitar-classic'],
    funFact: 'Written for the movie Pat Garrett and Billy the Kid.',
  },
  {
    id: 'wonderwall',
    title: 'Wonderwall',
    artist: 'Oasis',
    difficulty: 'easy',
    chords: ['Em', 'G', 'D', 'A'],
    key: 'E',
    mode: 'minor',
    tempo: 'medium',
    tags: ['90s', 'britpop', 'guitar-classic'],
    funFact: 'Every guitarist learns this one - it\'s practically a rite of passage!',
  },
  {
    id: 'hallelujah',
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    difficulty: 'easy',
    chords: ['C', 'Am', 'C', 'Am', 'F', 'G', 'C', 'G'],
    key: 'C',
    mode: 'major',
    tempo: 'slow',
    tags: ['folk', 'emotional', 'classic'],
    funFact: 'Cohen wrote over 80 verses before settling on the final lyrics!',
  },

  // ===== INTERMEDIATE =====
  {
    id: 'fur-elise',
    title: 'Für Elise',
    artist: 'Beethoven',
    difficulty: 'intermediate',
    chords: ['Am', 'E', 'Am', 'C', 'G', 'Am', 'E', 'Am'],
    key: 'A',
    mode: 'minor',
    tempo: 'medium',
    tags: ['classical', 'beethoven', 'piano-classic'],
    funFact: 'We still don\'t know for sure who "Elise" was!',
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D',
    artist: 'Pachelbel',
    difficulty: 'intermediate',
    chords: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'],
    key: 'D',
    mode: 'major',
    tempo: 'slow',
    tags: ['classical', 'wedding', 'baroque'],
    funFact: 'The "Pachelbel progression" - you\'ll hear it in countless pop songs!',
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    difficulty: 'beginner',
    chords: ['C', 'G', 'C', 'G', 'C'],
    key: 'C',
    mode: 'major',
    tempo: 'medium',
    tags: ['classical', 'beethoven', 'simple-melody'],
    funFact: 'Part of Beethoven\'s 9th Symphony - composed when he was completely deaf!',
  },

  // ===== MODERN KIDS FAVORITES =====
  {
    id: 'let-it-go',
    title: 'Let It Go',
    artist: 'Frozen',
    difficulty: 'intermediate',
    chords: ['Am', 'F', 'G', 'C', 'Am', 'F', 'G', 'Em'],
    key: 'A',
    mode: 'minor',
    tempo: 'medium',
    tags: ['disney', 'frozen', 'movie'],
    funFact: 'This song won the Academy Award for Best Original Song!',
  },
  {
    id: 'shallow',
    title: 'Shallow',
    artist: 'Lady Gaga & Bradley Cooper',
    difficulty: 'intermediate',
    chords: ['Em', 'D', 'G', 'C', 'Em', 'D', 'Am'],
    key: 'G',
    mode: 'major',
    tempo: 'medium',
    tags: ['pop', 'movie', 'modern'],
    funFact: 'Another Academy Award winner with a beautiful chord progression.',
  },
  {
    id: 'a-thousand-years',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    difficulty: 'easy',
    chords: ['C', 'G', 'Em', 'D'],
    key: 'C',
    mode: 'major',
    tempo: 'slow',
    tags: ['pop', 'twilight', 'romantic'],
    funFact: 'Written for the Twilight movies - uses the "sensitive" pop progression.',
  },
  {
    id: 'counting-stars',
    title: 'Counting Stars',
    artist: 'OneRepublic',
    difficulty: 'easy',
    chords: ['Am', 'C', 'G', 'F'],
    key: 'A',
    mode: 'minor',
    tempo: 'medium',
    tags: ['pop', 'modern', '2010s'],
    funFact: 'The same 4 chords repeat throughout the whole song!',
  },
  {
    id: 'someone-like-you',
    title: 'Someone Like You',
    artist: 'Adele',
    difficulty: 'easy',
    chords: ['A', 'E', 'F#m', 'D'],
    key: 'A',
    mode: 'major',
    tempo: 'slow',
    tags: ['pop', 'emotional', 'piano'],
    funFact: 'Uses the classic I-V-vi-IV progression that works for hundreds of songs.',
  },

  // ===== GUITAR CAMPFIRE CLASSICS =====
  {
    id: 'horse-with-no-name',
    title: 'A Horse with No Name',
    artist: 'America',
    difficulty: 'beginner',
    chords: ['Em', 'D'],
    key: 'E',
    mode: 'minor',
    tempo: 'medium',
    tags: ['folk-rock', '70s', 'two-chord'],
    funFact: 'Only two chords the whole song - perfect for beginners!',
  },
  {
    id: 'leaving-on-a-jet-plane',
    title: 'Leaving on a Jet Plane',
    artist: 'John Denver',
    difficulty: 'easy',
    chords: ['G', 'C', 'G', 'C', 'G', 'D'],
    key: 'G',
    mode: 'major',
    tempo: 'slow',
    tags: ['folk', 'campfire', '70s'],
    funFact: 'John Denver wrote this in a hotel room waiting for a plane.',
  },
  {
    id: 'country-roads',
    title: 'Take Me Home, Country Roads',
    artist: 'John Denver',
    difficulty: 'easy',
    chords: ['G', 'Em', 'D', 'C', 'G'],
    key: 'G',
    mode: 'major',
    tempo: 'medium',
    tags: ['folk', 'country', 'campfire'],
    funFact: 'West Virginia\'s state song - even though Denver never lived there!',
  },
  {
    id: 'wagon-wheel',
    title: 'Wagon Wheel',
    artist: 'Old Crow Medicine Show',
    difficulty: 'easy',
    chords: ['G', 'D', 'Em', 'C'],
    key: 'G',
    mode: 'major',
    tempo: 'medium',
    tags: ['folk', 'country', 'campfire'],
    funFact: 'Based on a Bob Dylan demo from 1973!',
  },
];

/**
 * Get songs by difficulty level
 */
export function getSongsByDifficulty(difficulty: Song['difficulty']): Song[] {
  return SONG_DATABASE.filter(song => song.difficulty === difficulty);
}

/**
 * Get songs by key
 */
export function getSongsByKey(key: string, mode?: 'major' | 'minor'): Song[] {
  return SONG_DATABASE.filter(song => {
    const keyMatch = song.key.toUpperCase() === key.toUpperCase();
    const modeMatch = mode ? song.mode === mode : true;
    return keyMatch && modeMatch;
  });
}

/**
 * Get songs by tag
 */
export function getSongsByTag(tag: string): Song[] {
  return SONG_DATABASE.filter(song => 
    song.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Search songs by title or artist
 */
export function searchSongs(query: string): Song[] {
  const q = query.toLowerCase();
  return SONG_DATABASE.filter(song =>
    song.title.toLowerCase().includes(q) ||
    song.artist.toLowerCase().includes(q)
  );
}

