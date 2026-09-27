import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { File } from "expo-file-system";

// A tap that slips past the long-press threshold is usually an accident, but
// this is low enough that a deliberately short "ok" still makes it through.
const MIN_RECORDING_MS = 500;

function removeTemporaryRecording(uri) {
  if (!uri || Platform.OS === "web") return;
  try {
    new File(uri).delete();
  } catch {
    // The OS may already have purged the cache file.
  }
}

function restoreAudioSession() {
  setAudioModeAsync({ allowsRecording: false }).catch(() => {});
}

/** Owns permissions, native recording, cancellation, and temporary files. */
export default function useVoiceRecorder({
  onStart,
  onRecorded,
  onCanceled,
} = {}) {
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingStartedAtRef = useRef(null);
  const durationTimerRef = useRef(null);
  const sessionRef = useRef(0);
  const activeRef = useRef(false);
  const startingRef = useRef(false);
  const viewOnceRef = useRef(false);
  const pendingFinishRef = useRef(null);
  const stopRef = useRef(null);
  const isMountedRef = useRef(true);
  const onStartRef = useRef(onStart);
  const onRecordedRef = useRef(onRecorded);
  const onCanceledRef = useRef(onCanceled);

  const clearDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  const stopDurationTimer = useCallback(() => {
    clearDurationTimer();
    recordingStartedAtRef.current = null;
  }, [clearDurationTimer]);

  const beginDurationTimer = useCallback(() => {
    clearDurationTimer();
    recordingStartedAtRef.current = Date.now();
    setRecordingDuration(0);
    durationTimerRef.current = setInterval(() => {
      const startedAt = recordingStartedAtRef.current;
      if (startedAt) setRecordingDuration(Date.now() - startedAt);
    }, 200);
  }, [clearDurationTimer]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      // Do not touch the Expo shared object here. useAudioRecorder releases it
      // during its own passive-effect cleanup, which can run first on Fast
      // Refresh/unmount and would make recorder.stop() throw.
      isMountedRef.current = false;
      sessionRef.current += 1;
      startingRef.current = false;
      activeRef.current = false;
      stopDurationTimer();
      restoreAudioSession();
    };
  }, [stopDurationTimer]);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  useEffect(() => {
    onStartRef.current = onStart;
    onRecordedRef.current = onRecorded;
    onCanceledRef.current = onCanceled;
  }, [onCanceled, onRecorded, onStart]);

  const start = useCallback(
    async ({ viewOnce = false } = {}) => {
      if (!isMountedRef.current || activeRef.current || startingRef.current) return false;

      pendingFinishRef.current = null;
      const session = sessionRef.current + 1;
      sessionRef.current = session;
      startingRef.current = true;
      viewOnceRef.current = viewOnce;
      setRecording(true);
      onStartRef.current?.();

      try {
        const permission = await requestRecordingPermissionsAsync();
        if (session !== sessionRef.current) return false;
        if (!permission.granted) {
          pendingFinishRef.current = null;
          setRecording(false);
          stopDurationTimer();
          Alert.alert(
            "Microphone permission needed",
            "Allow microphone access in Settings to record a voice note.",
          );
          return false;
        }

        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        if (session !== sessionRef.current) return false;

        await recorder.prepareToRecordAsync();
        if (session !== sessionRef.current) return false;

        recorder.record();
        activeRef.current = true;
        beginDurationTimer();
        const pendingFinish = pendingFinishRef.current;
        if (pendingFinish) {
          pendingFinishRef.current = null;
          startingRef.current = false;
          return stopRef.current?.(pendingFinish) ?? false;
        }
        return true;
      } catch (error) {
        if (session === sessionRef.current) {
          pendingFinishRef.current = null;
          setRecording(false);
          stopDurationTimer();
          restoreAudioSession();
          Alert.alert(
            "Couldn't record voice note",
            String(error?.message ?? "The microphone is unavailable. Please try again."),
          );
        }
        return false;
      } finally {
        if (session === sessionRef.current) startingRef.current = false;
      }
    },
    [beginDurationTimer, recorder, stopDurationTimer],
  );

  const stop = useCallback(
    async ({ canceled = false, viewOnce } = {}) => {
      if (!isMountedRef.current) return false;
      if (startingRef.current && !activeRef.current) {
        // Released before the recorder finished opening. Park the stop so it
        // fires the moment recording actually begins — carrying viewOnce with
        // it, or a view-once take would go out as an ordinary one.
        pendingFinishRef.current = { canceled, viewOnce };
        setRecording(false);
        stopDurationTimer();
        return false;
      }

      sessionRef.current += 1;
      startingRef.current = false;

      const wasActive = activeRef.current;
      activeRef.current = false;
      setRecording(false);
      if (!wasActive) {
        stopDurationTimer();
        restoreAudioSession();
        return false;
      }

      const startedAt = recordingStartedAtRef.current;
      const durationMillis = startedAt ? Math.max(0, Date.now() - startedAt) : 0;
      let uri = null;
      try {
        await recorder.stop();
        if (!isMountedRef.current) return false;
        uri = recorder.uri;
      } catch {
        stopDurationTimer();
        restoreAudioSession();
        return false;
      }
      stopDurationTimer();
      restoreAudioSession();

      if (canceled || durationMillis < MIN_RECORDING_MS || !uri) {
        removeTemporaryRecording(uri);
        onCanceledRef.current?.({
          canceled,
          tooShort: !canceled && durationMillis < MIN_RECORDING_MS,
        });
        return false;
      }

      // The view-once toggle is reachable while a take is running, so a flag
      // passed in now wins over the one captured when recording opened.
      if (typeof viewOnce === "boolean") viewOnceRef.current = viewOnce;

      onRecordedRef.current?.({
        uri,
        duration: durationMillis / 1000,
        viewOnce: viewOnceRef.current,
      });
      viewOnceRef.current = false;
      return true;
    },
    [recorder, stopDurationTimer],
  );

  stopRef.current = stop;

  // A take the user chose not to send. The recorder already cleans up on
  // cancellation, but a finished take parked in the composer has to be removed
  // from the cache when the user throws it away.
  const discard = useCallback((uri) => {
    removeTemporaryRecording(uri);
  }, []);

  // Metering is read synchronously on demand rather than through state, so a
  // screen can watch the level as often as it likes without re-rendering on
  // every tick. Only the hands-free caller polls it; everyone else ignores it.
  const getMetering = useCallback(() => {
    try {
      return recorder.getStatus()?.metering ?? 0;
    } catch {
      return 0;
    }
  }, [recorder]);

  return {
    recording,
    durationMillis: recording ? recordingDuration : 0,
    getMetering,
    start,
    stop,
    discard,
  };
}
