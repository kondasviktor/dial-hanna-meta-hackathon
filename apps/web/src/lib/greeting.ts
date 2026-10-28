// Greeting + AI disclosure (Master Spec §7.2, AI Act Art. 50 — mandatory first utterance).
// Hungarian indefinite article: "az" before vowel sounds, "a" otherwise.
// The owner reviews the rendered greeting (spec §7.2).

const HU_VOWELS = new Set("aáeéiíoóöőuúüű".split(""));

export function hungarianArticle(word: string): "a" | "az" {
  const first = word.trim().charAt(0).toLowerCase();
  return HU_VOWELS.has(first) ? "az" : "a";
}

export interface GreetingOpts {
  businessName: string;
  language: "hu" | "en";
  recordingOn?: boolean;
}

export function renderGreeting(o: GreetingOpts): string {
  const rec = o.recordingOn === true;
  if (o.language === "en") {
    let g = `Hello, you've reached ${o.businessName}. This is Hanna, the business's AI assistant. How can I help?`;
    if (rec) g += " This call is recorded for quality purposes.";
    return g;
  }
  const art = hungarianArticle(o.businessName);
  // "vonalán" reads naturally for business names: "<Name> vonalán Hanna beszél".
  let g = `Jó napot kívánok, ${art} ${o.businessName} vonalán Hanna beszél, a vállalkozás mesterséges intelligencia alapú asszisztense. Miben segíthetek?`;
  if (rec) g += " A hívást minőségbiztosítási céllal rögzítjük.";
  return g;
}
