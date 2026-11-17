"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { limits, styles, type ColoringStyle } from "@/config/site";
import { findBlockedTerm } from "@/lib/moderation/blocklist";

type Mode = "photo" | "prompt";

type Quota =
  | { signedIn: true; email: string | null; credits: number }
  | { signedIn: false; freeLeft: number };

type Result = { id: string; previewUrl: string; watermarked: boolean; creditsLeft: number | null };

type Status = "idle" | "uploading" | "generating" | "done" | "error";

type ApiError = { error?: { code?: string; message?: string } };

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

const TRADEMARK_HINT =
  "We can't make pages of famous characters or brands because they belong to their creators. Try describing your own character instead!";

const PROGRESS_STEPS = [
  "Looking at your picture…",
  "Tracing the outlines…",
  "Taking out the colors…",
  "Cleaning up the lines…",
  "Almost ready…",
];

const PROMPT_IDEAS = [
  "a happy dinosaur eating birthday cake",
  "a cat astronaut floating in space",
  "a unicorn in a flower garden",
  "a cozy cabin in the snowy woods",
];

function contentTypeFor(file: File): string | null {
  const type = file.type.toLowerCase();
  if ((limits.acceptedMimeTypes as readonly string[]).includes(type)) return type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic")) return "image/heic";
  if (name.endsWith(".heif")) return "image/heif";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  return null;
}

async function readError(res: Response): Promise<{ code: string; message: string }> {
  const body = (await res.json().catch(() => ({}))) as ApiError;
  return {
    code: body.error?.code ?? "server_error",
    message: body.error?.message ?? "Something went wrong. Please try again.",
  };
}

export function ColoringTool({ mode }: { mode: Mode }) {
  const [quota, setQuota] = useState<Quota | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ColoringStyle>("simple");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadQuota = useCallback(async () => {
    const res = await fetch("/api/quota", { cache: "no-store" }).catch(() => null);
    if (res?.ok) setQuota((await res.json()) as Quota);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void loadQuota();
  }, [loadQuota]);

  useEffect(() => {
    if (status !== "generating") return;
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, PROGRESS_STEPS.length - 1)), 7000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);

  const outOfQuota =
    quota !== null && (quota.signedIn ? quota.credits <= 0 : quota.freeLeft <= 0);
  const busy = status === "uploading" || status === "generating";
  const blockedTerm = mode === "prompt" ? findBlockedTerm(prompt) : null;

  function pickFile(next: File | null | undefined) {
    setError(null);
    if (!next) return;
    const type = contentTypeFor(next);
    if (!type) {
      setError({ code: "bad_type", message: "Please choose a JPG, PNG or HEIC photo." });
      return;
    }
    if (next.size > limits.maxUploadBytes) {
      setError({ code: "too_large", message: "That photo is too big. Please use a photo under 10 MB." });
      return;
    }
    setFile(next);
    setResult(null);
    setStatus("idle");
    // Most browsers can't display HEIC, so only preview JPG/PNG.
    setPreviewSrc(type === "image/jpeg" || type === "image/png" ? URL.createObjectURL(next) : null);
  }

  async function generate() {
    setError(null);
    setResult(null);
    setStep(0);

    try {
      let payload: Record<string, string>;

      if (mode === "photo") {
        if (!file) {
          setError({ code: "no_file", message: "Please add a photo first." });
          return;
        }
        const contentType = contentTypeFor(file)!;
        setStatus("uploading");

        const urlRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType, size: file.size }),
        });
        if (!urlRes.ok) throw await readError(urlRes);
        const { path, token } = (await urlRes.json()) as { path: string; token: string };

        const { createClient } = await import("@/lib/supabase/client");
        const { error: upError } = await createClient()
          .storage.from("uploads")
          .uploadToSignedUrl(path, token, file, { contentType });
        if (upError) {
          throw { code: "upload_failed", message: "Your photo didn't upload. Please check your connection and try again." };
        }
        payload = { inputType: "photo", uploadPath: path, style };
      } else {
        if (blockedTerm) {
          setError({ code: "trademark", message: TRADEMARK_HINT });
          return;
        }
        payload = { inputType: "prompt", prompt, style };
      }

      setStatus("generating");
      window.plausible?.("Generate", { props: { mode, style } });

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw await readError(res);

      const data = (await res.json()) as Result;
      setResult(data);
      setStatus("done");
      window.plausible?.("Generate Success", { props: { mode, style } });
    } catch (err) {
      const e = err as { code?: string; message?: string };
      setError({
        code: e.code ?? "server_error",
        message: e.message && e.code ? e.message : "Something went wrong. Please try again.",
      });
      setStatus("error");
    } finally {
      void loadQuota();
    }
  }

  function reset() {
    setResult(null);
    setStatus("idle");
    setFile(null);
    setPreviewSrc(null);
    setPrompt("");
    setError(null);
  }

  const canGenerate =
    !busy && !outOfQuota && (mode === "photo" ? !!file : prompt.trim().length >= limits.minPromptLength);

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <QuotaBanner quota={quota} />

      {result ? (
        <ResultView result={result} onReset={reset} signedIn={!!quota?.signedIn} />
      ) : (
        <>
          {mode === "photo" ? (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload a photo"
              onClick={() => !busy && inputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !busy) {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!busy) pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition ${
                dragging ? "border-primary bg-primary-soft" : "border-border hover:border-primary/60 hover:bg-primary-soft/40"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                accept={[...limits.acceptedMimeTypes, ...limits.acceptedExtensions].join(",")}
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              {file ? (
                <>
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                    <img
                      src={previewSrc}
                      alt="Your photo"
                      className="max-h-56 w-auto rounded-xl object-contain"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary-soft text-3xl">
                      📷
                    </div>
                  )}
                  <p className="max-w-full truncate text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-muted">Tap to choose a different photo</p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-2xl">
                    ⬆️
                  </div>
                  <p className="text-lg font-bold">Drop your photo here</p>
                  <p className="text-sm text-muted">or tap to choose one · JPG, PNG or HEIC · up to 10 MB</p>
                </>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="prompt" className="mb-2 block text-sm font-bold">
                What should we draw?
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={limits.maxPromptLength}
                rows={3}
                placeholder="A friendly dragon reading a book under a tree"
                className="w-full resize-none rounded-2xl border border-border bg-background p-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>{blockedTerm ? <span className="font-semibold text-red-700">{TRADEMARK_HINT}</span> : "Describe your own idea. Famous characters aren't allowed."}</span>
                <span className="shrink-0 pl-2">
                  {prompt.length}/{limits.maxPromptLength}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROMPT_IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:border-primary hover:bg-primary-soft"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}

          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-bold">Choose a style</legend>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(styles) as ColoringStyle[]).map((key) => (
                <label
                  key={key}
                  className={`cursor-pointer rounded-2xl border-2 p-3 transition ${
                    style === key ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="style"
                    value={key}
                    checked={style === key}
                    onChange={() => setStyle(key)}
                    className="sr-only"
                  />
                  <span className="block font-bold">{styles[key].label}</span>
                  <span className="block text-xs text-muted">{styles[key].description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <div role="alert" className="mt-4 rounded-2xl bg-coral/10 p-3 text-sm font-semibold text-red-700">
              {error.message}
              {error.code === "sign_in_required" && (
                <Link href="/login" className="ml-1 underline">
                  Sign in
                </Link>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className="mt-5 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-extrabold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "uploading"
              ? "Uploading your photo…"
              : status === "generating"
                ? PROGRESS_STEPS[step]
                : "Make my coloring page"}
          </button>
          {status === "generating" && (
            <p className="mt-2 text-center text-xs text-muted" aria-live="polite">
              This usually takes 20 to 60 seconds. Please keep this page open.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function QuotaBanner({ quota }: { quota: Quota | null }) {
  if (!quota) return <div className="mb-4 h-9" aria-hidden="true" />;

  let content: React.ReactNode;
  if (quota.signedIn) {
    content =
      quota.credits > 0 ? (
        <>
          You have <strong>{quota.credits}</strong> credit{quota.credits === 1 ? "" : "s"} left.
        </>
      ) : (
        <>You&apos;re out of credits. More credit packs are coming soon!</>
      );
  } else if (quota.freeLeft > 0) {
    content = (
      <>
        <strong>1 free coloring page</strong>, no sign-up needed.{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>{" "}
        for {limits.signupCredits} free credits.
      </>
    );
  } else {
    content = (
      <>
        You&apos;ve used your free page.{" "}
        <Link href="/login" className="font-bold underline">
          Sign in for {limits.signupCredits} free credits
        </Link>
      </>
    );
  }

  return (
    <div className="mb-4 flex min-h-9 items-center rounded-full bg-sun/50 px-4 py-2 text-sm">
      <span>{content}</span>
    </div>
  );
}

function ResultView({
  result,
  onReset,
  signedIn,
}: {
  result: Result;
  onReset: () => void;
  signedIn: boolean;
}) {
  const base = `/api/generations/${result.id}/download`;
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-extrabold">Your coloring page is ready! 🎉</h2>
      {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
      <img
        src={result.previewUrl}
        alt="Your new coloring page"
        className="max-h-[70vh] w-auto rounded-xl border border-border bg-white object-contain"
      />
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
        <a
          href={`${base}?format=pdf&size=letter`}
          className="rounded-2xl bg-primary px-4 py-3 text-center font-bold text-white hover:bg-primary-hover"
        >
          Download PDF (Letter)
        </a>
        <a
          href={`${base}?format=pdf&size=a4`}
          className="rounded-2xl border-2 border-primary px-4 py-3 text-center font-bold text-primary hover:bg-primary-soft"
        >
          PDF (A4)
        </a>
        <a
          href={`${base}?format=png`}
          className="rounded-2xl border-2 border-primary px-4 py-3 text-center font-bold text-primary hover:bg-primary-soft"
        >
          PNG image
        </a>
      </div>
      {result.watermarked && (
        <p className="text-center text-xs text-muted">
          Free pages include a small watermark in the corner.
        </p>
      )}
      <button
        type="button"
        onClick={onReset}
        className="rounded-full px-4 py-2 text-sm font-bold text-primary hover:bg-primary-soft"
      >
        Make another one
      </button>
      {signedIn && (
        <Link href="/account" className="text-sm text-muted underline">
          See all my coloring pages
        </Link>
      )}
    </div>
  );
}
