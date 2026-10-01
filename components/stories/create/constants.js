export const WA_GREEN = "#00A884";
export const WA_DARK = "#0B141A";
export const VIDEO_LIMIT = 60;
export const TEXT_BGS = ["#00A884", "#1F2C34", "#5B57FF", "#F0407F", "#E54242", "#F5A524", "#2F80ED", "#111111"];
export const TEXT_FONTS = [
  { key: "regular", label: "Aa", weight: "500" },
  { key: "bold", label: "Aa", weight: "800" },
  { key: "light", label: "Aa", weight: "300" },
  { key: "serif", label: "Ag", weight: "600" },
];
export const PRIVACY = ["My contacts", "Close friends", "Only me"];

export function fmtDur(sec) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function normLink(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  if (!/^https?:\/\/[\w-]+(\.[\w-]+)+/.test(withProto)) return null;
  return withProto;
}

export function linkDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
