// Pulls the real VOICE_TUNING literal out of lib/ai.js so this exercises the
// numbers the app actually ships with.
const fs = require("fs");
const src = fs.readFileSync("lib/ai.js", "utf8");
const m = src.match(/export const VOICE_TUNING = (\{[\s\S]*?\n\});/);
if (!m) { console.log("could not find VOICE_TUNING"); process.exit(1); }
const VOICE_TUNING = eval("(" + m[1] + ")");
const { voiceDb, tailSilenceMs, minSpeechMs, maxTurnMs, pollMs } = VOICE_TUNING;

// Mirrors the poll loop + endTurn, step for step, including the discard path.
function run(levels, maxMs = 30000) {
  let speechMs = 0, lastVoiceAt = 0, sent = null, turnEndedAt = null;
  const endTurn = () => {
    const spoke = speechMs >= minSpeechMs;
    speechMs = 0; lastVoiceAt = 0;
    if (spoke) { sent = "SENT"; } else { sent = "DISCARDED"; }
  };
  const total = Math.floor(maxMs / pollMs);
  for (let i = 0; i < total; i++) {
    const now = i * pollMs;
    const level = typeof levels === "function" ? levels(now) : levels[i] ?? -160;
    if (level >= voiceDb) { speechMs += pollMs; lastVoiceAt = now; continue; }
    if (speechMs === 0) continue;
    if (speechMs < minSpeechMs) continue;
    if (now - lastVoiceAt < tailSilenceMs) continue;
    endTurn(); turnEndedAt = now; break;
  }
  if (!turnEndedAt && maxMs >= maxTurnMs) { endTurn(); turnEndedAt = maxTurnMs; }
  return { sent, at: turnEndedAt };
}
const S = -30, Q = -160;
const seg = (db, ms) => new Array(Math.round(ms / pollMs)).fill(db);
let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + "\n          got=" + JSON.stringify(got) + " want=" + JSON.stringify(want)); }
}
console.log("VOICE_TUNING from lib/ai.js:", JSON.stringify(VOICE_TUNING), "\n");
function verdict(name, r, mustBe, notBefore) {
  let ok = r.sent === mustBe;
  if (notBefore !== undefined && r.at !== null && r.at < notBefore) ok = false;
  if (ok) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + "  got=" + JSON.stringify(r)); }
}
function inRange(name, v, lo, hi) {
  if (v >= lo && v <= hi) { pass++; console.log("  PASS  " + name + "  (" + v + "ms)"); }
  else { fail++; console.log("  FAIL  " + name + "  got=" + v + " want " + lo + ".." + hi); }
}
const SLOP = pollMs * 2;
verdict("silence alone is DISCARDED, never sent", run(seg(Q, 8000)), "DISCARDED");
verdict("20s cap on pure silence still discards", run(seg(Q, 25000)), "DISCARDED");
verdict("a 150ms blip is discarded, not sent", run([...seg(S,150),...seg(Q,5000)]), "DISCARDED");
verdict("\"hey\" (600ms) is SENT", run([...seg(S,600),...seg(Q,3000)]), "SENT");
verdict("continuous speech is SENT by the cap", run(t => (t < maxTurnMs ? S : Q)), "SENT");
verdict("a long real turn is SENT", run([...seg(S,5000),...seg(Q,3000)]), "SENT");

// The gap tests: a pause inside a sentence must not be mistaken for the end.
const g400 = run([...seg(S,800),...seg(Q,400),...seg(S,800),...seg(Q,3000)]);
inRange("400ms mid-sentence gap does not cut in", g400.at, 2000 + tailSilenceMs, 2000 + tailSilenceMs + SLOP);
const g900 = run([...seg(S,800),...seg(Q,900),...seg(S,800),...seg(Q,3000)]);
inRange("900ms mid-sentence gap still does not cut in", g900.at, 2500 + tailSilenceMs, 2500 + tailSilenceMs + SLOP);

// Latency is the thing people feel: a tail silence, give or take a poll.
const lat = run([...seg(S,500),...seg(Q,3000)]).at;
inRange("reply latency after speech stops is ~one tail silence", lat - 400, tailSilenceMs, tailSilenceMs + SLOP);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
