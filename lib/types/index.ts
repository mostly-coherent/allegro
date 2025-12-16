// Core types for Allegro app

export interface Song {
  title: string;
  artist: string;
  album?: string;
  releaseDate?: string;
  duration?: number;
  label?: string;
  timecode?: string;
  songLink?: string;
}

export interface RecognitionResponse {
  status: 'success' | 'error';
  result?: Song;
  error?: string;
}

export interface Songwriter {
  id: string;
  name: string;
  sortName?: string;
  disambiguation?: string;
}

export interface Composer {
  id: string;
  name: string;
  sortName?: string;
  lifeSpan?: {
    begin?: string;
    end?: string;
  };
  type?: string;
  country?: string;
}

export interface MusicBrainzMetadata {
  songwriters: Songwriter[];
  composers: Composer[];
  genre?: string;
  style?: string;
}

export interface WikipediaInfo {
  title: string;
  summary: string;
  url: string;
  thumbnail?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  previewUrl?: string;
  externalUrl: string;
}

export interface CoachingContent {
  wiseCracks: string[];
  coachingMoments: string[];
  encouragementPrompts: string[];
  whatsNext?: string[];
}

export interface IdentificationResult {
  song: Song;
  metadata?: MusicBrainzMetadata;
  wikipedia?: WikipediaInfo;
  funFacts?: string[];
  recommendations?: SpotifyTrack[];
  coaching?: CoachingContent;
}

export interface AudioRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob: Blob | null;
  error: string | null;
  duration: number;
}

export interface UserSettings {
  childAge?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  instruments?: ('piano' | 'guitar')[];
}

export type LoadingState = 
  | 'idle' 
  | 'recording' 
  | 'recognizing' 
  | 'fetching-metadata' 
  | 'generating-coaching' 
  | 'complete' 
  | 'error';

export interface MetadataApiResponse {
  success: boolean;
  cached: boolean;
  musicbrainz: MusicBrainzMetadata | null;
  wikipedia: WikipediaInfo | null;
  funFacts: string[];
  error?: string;
}
