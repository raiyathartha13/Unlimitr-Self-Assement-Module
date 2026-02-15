/**
 * AI Coach voice — SpeechSynthesis with gender from coach name.
 * Coach name ends with a, i, y (case-insensitive) → female; else male.
 */

function isFemaleCoach(coachName) {
  if (!coachName || typeof coachName !== "string") return false;
  const last = coachName.trim().slice(-1).toLowerCase();
  return last === "a" || last === "i" || last === "y";
}

function speakAsCoach(text, coachName) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1;
  u.volume = 1;
  const voices = speechSynthesis.getVoices();
  const preferFemale = isFemaleCoach(coachName);
  let chosen = voices.find(function (v) {
    return v.lang.startsWith("en") && (v.name.toLowerCase().indexOf("female") !== -1) === preferFemale;
  });
  if (!chosen) chosen = voices.find(function (v) { return v.lang.startsWith("en"); });
  if (chosen) u.voice = chosen;
  window.speechSynthesis.speak(u);
}

// Optional: ensure voices are loaded (Chrome loads them async)
if ("speechSynthesis" in window && speechSynthesis.getVoices().length === 0) {
  speechSynthesis.addEventListener("voiceschanged", function () {});
}
