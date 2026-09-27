import { useCallback, useEffect, useRef } from "react";

/**
 * ai — everything the assistant is, in one place.
 *
 * The text chat, the voice conversation and the info screen all describe the
 * same person, so the name, the sender identity, the canned answers and the
 * reply rhythm live here instead of being restated per screen.
 */

export const AI_NAME = "Ping AI";

export const AI_SENDER = { name: AI_NAME, avatar: null };

// The composer hook and the bubbles both read a conversation object, so the
// assistant gets one in the same shape a gist does. Not a group, and `isOnline`
// is cosmetic — it answers on its own schedule, not because someone is present.
export const AI_CONVERSATION = {
  id: "ai",
  name: AI_NAME,
  avatar: null,
  isGroup: false,
  isOnline: true,
  senderName: AI_NAME,
};

/** Rotated in order so a conversation still reads as a back-and-forth. */
export const AI_REPLIES = [
  "Got it — I caught the gist of that. Want me to pull out the action items?",
  "That's clear. Here's how I'd break it into the next three steps.",
  "Noted. I can turn that into a short summary, or draft a reply you can send.",
  "Makes sense. Shall I keep the detail level like that, or trim it down?",
];

/**
 * The first thing the assistant says, as a seed transcript. Each screen passes
 * its own line: a text chat and a voice session should not open the same way.
 */
export function aiOpening(text) {
  return [
    {
      id: "ai-open-1",
      time: "9:41 AM",
      kind: "text",
      isMine: false,
      sender: AI_SENDER,
      text,
    },
  ];
}

/**
 * The numbers that decide when a turn is over.
 *
 * Exported because they are the first thing that will need changing on a real
 * device: a phone mic in a quiet room sits far below `voiceDb`, so raising it
 * trades fewer false turn-ends for a slower reply, and lowering it makes the
 * assistant jump in sooner. `tailSilenceMs` is the one people feel most — it is
 * the gap after you stop talking before it decides you've finished.
 */
export const VOICE_TUNING = {
  /** Level at or above which the mic counts as hearing speech. Metering is
   *  dBFS, so this is negative; roughly -42 is a normal speaking level. */
  voiceDb: -42,
  /** How long a pause must run to mean "that was the whole thought". */
  tailSilenceMs: 1000,
  /** A blip this short is a cough or a door, not a turn. */
  minSpeechMs: 320,
  /** Nobody monologues forever; hand the floor over anyway. */
  maxTurnMs: 20000,
  /** How often the level is read. 80ms tracks speech without being busy. */
  pollMs: 80,
};

/**
 * useHandsFreeCall — the turn-taking loop for a voice call.
 *
 * This is what makes the call a conversation rather than a walkie-talkie. The
 * microphone stays open and the assistant decides when a turn is over, using
 * the recorder's own level meter: speech has to start before silence counts,
 * and once it has, a pause long enough to mean "I've finished" ends the take.
 * Nobody touches a button — say "hey", and the answer comes back on its own.
 *
 * The floor alternates strictly, which is also what keeps the call from hearing
 * itself. The mic is open only while it is your turn; it closes the moment your
 * take is sent and does not reopen until the assistant has finished talking.
 * There is no window in which it can record its own voice.
 *
 * @param enabled            the call is live; false suspends the loop
 * @param getMetering        reads the recorder's current level in dBFS
 * @param recording          the recorder is actually running
 * @param startRecording     open the mic
 * @param stopRecording      close the mic, which sends or drops the take
 * @param onTurnEnd          fired when your turn is over; queue the answer
 * @param speaking           the assistant is talking; holds the mic shut
 * @param waiting            an answer is already queued; holds the mic shut
 *
 * Tuning lives in VOICE_DB / TAIL_SILENCE_MS below. A phone mic in a quiet room
 * sits far below VOICE_DB, so raising it trades fewer false turn-ends for a
 * slower reply; lowering it makes the assistant interrupt you sooner.
 */
export function useHandsFreeCall({
  enabled,
  getMetering,
  recording,
  startRecording,
  stopRecording,
  onTurnEnd,
  speaking,
  waiting,
}) {
  // Tuning is shared and exported, so the numbers this loop actually runs on are
  // the same numbers a test or a device pass can read. See VOICE_TUNING above.
  const { voiceDb, tailSilenceMs, minSpeechMs, maxTurnMs, pollMs } = VOICE_TUNING;

  // Total voice heard this turn, accumulated from the samples themselves.
  // Measuring the span from first sound to now would let a single blip count as
  // a long utterance, because the clock keeps running through the silence that
  // follows it — a cough would end up looking like several seconds of speech.
  const speechMsRef = useRef(0);
  const lastVoiceAtRef = useRef(0);
  const pollRef = useRef(null);

  // The loop reads the latest values through refs so it never has to be torn
  // down and rebuilt on every render.
  const liveRef = useRef({ enabled, recording, speaking, waiting, onTurnEnd });
  liveRef.current = { enabled, recording, speaking, waiting, onTurnEnd };

  const startRef = useRef(startRecording);
  startRef.current = startRecording;
  const stopRef = useRef(stopRecording);
  stopRef.current = stopRecording;
  const meterRef = useRef(getMetering);
  meterRef.current = getMetering;

  /**
   * Close the turn. A take that only ever heard room noise is thrown away
   * rather than sent: silence is not a message, and posting twenty seconds of
   * nothing to the assistant is worse than posting nothing.
   */
  const endTurn = useCallback(() => {
    const spoke = speechMsRef.current >= minSpeechMs;
    speechMsRef.current = 0;
    lastVoiceAtRef.current = 0;
    if (spoke) {
      stopRef.current?.();
      liveRef.current.onTurnEnd?.();
    } else {
      stopRef.current?.({ canceled: true });
    }
  }, [minSpeechMs]);

  // The mic is open whenever it is the user's turn: the call is live, nobody
  // else holds the floor, and either the recorder is already running or we are
  // about to open it.
  useEffect(() => {
    if (!enabled) return;
    if (speaking || waiting) return;
    if (recording) return;
    startRef.current?.();
  }, [enabled, speaking, waiting, recording]);

  // Watch the level and end the turn on a trailing silence.
  useEffect(() => {
    if (!enabled) return undefined;
    if (speaking || waiting) return undefined;
    if (!recording) return undefined;

    pollRef.current = setInterval(() => {
      const level = meterRef.current?.() ?? 0;
      const now = Date.now();

      if (level >= voiceDb) {
        speechMsRef.current += pollMs;
        lastVoiceAtRef.current = now;
        return;
      }

      // Silence only means something after something was said.
      if (speechMsRef.current === 0) return;
      if (speechMsRef.current < minSpeechMs) return;
      if (now - lastVoiceAtRef.current < tailSilenceMs) return;

      endTurn();
    }, pollMs);

    return () => {
      clearInterval(pollRef.current);
      pollRef.current = null;
      // A turn interrupted by the assistant taking the floor, or by the call
      // ending, must not leave stale voice behind for the next turn to read.
      speechMsRef.current = 0;
      lastVoiceAtRef.current = 0;
    };
  }, [enabled, speaking, waiting, recording, endTurn, minSpeechMs, tailSilenceMs, voiceDb, pollMs]);

  // A turn that never finds its trailing silence is still a turn. Without this
  // someone mid-sentence, or trailed by a street noise that never quite drops,
  // would hold the floor open indefinitely.
  useEffect(() => {
    if (!enabled || !recording || speaking || waiting) return undefined;
    const cap = setTimeout(endTurn, maxTurnMs);
    return () => clearTimeout(cap);
  }, [enabled, recording, speaking, waiting, endTurn, maxTurnMs]);

  return { endTurn };
}

/**
 * useAiResponder — the assistant's half of a turn.
 *
 * Call it whenever the user sends something, whatever the medium: it raises the
 * typing indicator, waits a beat, then answers through `receive`. Both the text
 * chat and the voice session run this, so a reply lands on the same rhythm in
 * either. The timer is cleared on unmount, so an answer can never arrive for a
 * screen that is already gone.
 *
 * @param receive     appends an incoming message to the transcript
 * @param setTyping   clears the indicator when the answer lands
 * @param beginTyping raises it without arming the composer's own auto-clear
 * @param onDeliver   called with the answer text as it is delivered, so a voice
 *                    session can read it aloud on the same beat it arrives
 * @returns           call to schedule the next answer
 */
export function useAiResponder({
  receive,
  setTyping,
  beginTyping,
  onDeliver,
}) {
  const timerRef = useRef(null);
  const unmountedRef = useRef(false);
  const turnRef = useRef(0);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(() => {
    clearTimeout(timerRef.current);
    beginTyping();

    timerRef.current = setTimeout(() => {
      if (unmountedRef.current) return;
      setTyping(false);
      const text = AI_REPLIES[turnRef.current % AI_REPLIES.length];
      turnRef.current += 1;
      receive({ kind: "text", isMine: false, sender: AI_SENDER, text });
      onDeliver?.(text);
    }, 900);
  }, [beginTyping, onDeliver, receive, setTyping]);
}
