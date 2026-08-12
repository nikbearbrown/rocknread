/**
 * One shared AudioContext, plus the unlock gate.
 *
 * THE iOS SAFARI PROBLEM — read this before changing anything here.
 * -----------------------------------------------------------------
 * Browsers refuse to make sound until the user has interacted with the page.
 * An AudioContext created outside a user gesture starts in state "suspended",
 * and every note you schedule on it is silently dropped. No error is thrown.
 * The app looks like it is working and no sound comes out — which, in a room
 * with a four-year-old waiting to hear a click, is the worst possible failure.
 *
 * Safari on iOS is the strict one, and it is also the device most likely to be
 * in a classroom. It can also re-suspend the context when the tab is
 * backgrounded or the device locks, so "we unlocked it once at the start" is
 * not enough — every audio-initiating control calls ensureAudioReady() again.
 *
 * That is why the app has a Sound Check screen before Task 1. It is not
 * hand-holding; it is the user gesture that unlocks audio, and it doubles as
 * the only way to catch a muted device (which the browser cannot detect).
 */

let ctx: AudioContext | null = null;

type Ctor = typeof AudioContext;

function createContext(): AudioContext {
  const w = window as unknown as { AudioContext: Ctor; webkitAudioContext?: Ctor };
  const Impl = w.AudioContext || w.webkitAudioContext;
  if (!Impl) throw new Error("Web Audio is not supported in this browser.");
  return new Impl();
}

/** The shared context, created lazily. Call from a user gesture the first time. */
export function getAudioContext(): AudioContext {
  if (!ctx || ctx.state === "closed") ctx = createContext();
  return ctx;
}

/**
 * Call this at the start of every play/start handler — it is cheap when the
 * context is already running. Returns false if the browser still will not
 * play, so the UI can say so instead of appearing to work.
 */
export async function ensureAudioReady(): Promise<boolean> {
  try {
    const c = getAudioContext();
    if (c.state === "suspended") await c.resume();
    return c.state === "running";
  } catch {
    return false;
  }
}

export function audioState(): AudioContextState | "unavailable" {
  if (typeof window === "undefined") return "unavailable";
  return ctx ? ctx.state : "suspended";
}

/** Test-seam / teardown. */
export async function closeAudio(): Promise<void> {
  if (ctx && ctx.state !== "closed") await ctx.close().catch(() => {});
  ctx = null;
}
