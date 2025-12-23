'use client';

/**
 * Activity Detector Hook
 * 
 * Phase 7A: Detects when music is playing vs silence
 * Enables automatic start/stop of listening without manual triggers
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface ActivityState {
  isActive: boolean; // Is sound being detected
  volume: number; // 0-1 normalized volume level
  peakVolume: number; // Recent peak volume
  silenceDuration: number; // How long silence has lasted (ms)
  activityDuration: number; // How long activity has lasted (ms)
}

interface UseActivityDetectorOptions {
  /** Volume threshold to consider as "activity" (0-1). Default: 0.02 */
  activityThreshold?: number;
  /** How long silence before considered "stopped" (ms). Default: 3000 */
  silenceTimeout?: number;
  /** How long activity before considered "started" (ms). Default: 500 */
  activityMinDuration?: number;
  /** Analysis interval (ms). Default: 100 */
  analysisInterval?: number;
  /** FFT size for frequency analysis. Default: 2048 */
  fftSize?: number;
}

interface UseActivityDetectorReturn {
  /** Start monitoring audio activity */
  startMonitoring: () => Promise<void>;
  /** Stop monitoring */
  stopMonitoring: () => void;
  /** Current activity state */
  activity: ActivityState;
  /** Whether monitoring is active */
  isMonitoring: boolean;
  /** Error if any */
  error: string | null;
  /** Get the current audio stream (for other hooks to use) */
  getAudioStream: () => MediaStream | null;
  /** Get the audio context (for other hooks to use) */
  getAudioContext: () => AudioContext | null;
}

export function useActivityDetector(
  options?: UseActivityDetectorOptions
): UseActivityDetectorReturn {
  const {
    activityThreshold = 0.02,
    silenceTimeout = 3000,
    activityMinDuration = 500,
    analysisInterval = 100,
    fftSize = 2048,
  } = options || {};

  const [activity, setActivity] = useState<ActivityState>({
    isActive: false,
    volume: 0,
    peakVolume: 0,
    silenceDuration: 0,
    activityDuration: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastActivityTimeRef = useRef<number>(0);
  const lastSilenceTimeRef = useRef<number>(0);
  const peakVolumeRef = useRef<number>(0);
  const wasActiveRef = useRef<boolean>(false);

  const getAudioStream = useCallback(() => mediaStreamRef.current, []);
  const getAudioContext = useCallback(() => audioContextRef.current, []);

  // Use ref to track current isActive to avoid stale closure
  const isActiveRef = useRef(false);

  const analyzeVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate RMS (root mean square) for volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length) / 255;

    // Update peak (decay slowly)
    peakVolumeRef.current = Math.max(peakVolumeRef.current * 0.95, rms);

    const now = Date.now();
    const isCurrentlyActive = rms > activityThreshold;

    if (isCurrentlyActive) {
      lastActivityTimeRef.current = now;
      if (!wasActiveRef.current) {
        // Just became active
        lastSilenceTimeRef.current = 0;
      }
    } else {
      if (wasActiveRef.current && lastSilenceTimeRef.current === 0) {
        // Just became silent
        lastSilenceTimeRef.current = now;
      }
    }

    // Calculate durations
    const silenceDuration = lastSilenceTimeRef.current > 0 
      ? now - lastSilenceTimeRef.current 
      : 0;
    const activityDuration = isCurrentlyActive && lastActivityTimeRef.current > 0
      ? now - (lastSilenceTimeRef.current || lastActivityTimeRef.current - (wasActiveRef.current ? 0 : activityMinDuration))
      : 0;

    // Determine if we should consider this as "active playing"
    const isStableActive = isCurrentlyActive && activityDuration >= activityMinDuration;
    const isStableSilence = !isCurrentlyActive && silenceDuration >= silenceTimeout;

    // Use ref to avoid stale closure
    let isActive = isActiveRef.current;
    if (isStableActive && !isActiveRef.current) {
      isActive = true;
    } else if (isStableSilence && isActiveRef.current) {
      isActive = false;
      peakVolumeRef.current = 0; // Reset peak on silence
    }
    isActiveRef.current = isActive;

    wasActiveRef.current = isCurrentlyActive;

    setActivity({
      isActive,
      volume: rms,
      peakVolume: peakVolumeRef.current,
      silenceDuration: isActive ? 0 : silenceDuration,
      activityDuration: isActive ? activityDuration : 0,
    });
  }, [activityThreshold, activityMinDuration, silenceTimeout]);

  const startMonitoring = useCallback(async () => {
    try {
      setError(null);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Reset state
      lastActivityTimeRef.current = 0;
      lastSilenceTimeRef.current = Date.now();
      peakVolumeRef.current = 0;
      wasActiveRef.current = false;

      // Start analysis loop
      intervalRef.current = window.setInterval(analyzeVolume, analysisInterval);
      setIsMonitoring(true);
    } catch (err) {
      console.error('Activity detector error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to access microphone'
      );
    }
  }, [analyzeVolume, analysisInterval, fftSize]);

  const stopMonitoring = useCallback(() => {
    // Stop analysis
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsMonitoring(false);
    setActivity({
      isActive: false,
      volume: 0,
      peakVolume: 0,
      silenceDuration: 0,
      activityDuration: 0,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    startMonitoring,
    stopMonitoring,
    activity,
    isMonitoring,
    error,
    getAudioStream,
    getAudioContext,
  };
}

export default useActivityDetector;

