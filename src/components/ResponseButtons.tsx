"use client";

import type { ResponseValue } from "@/lib/assessment/types";
import { RESPONSE_LABEL } from "@/lib/assessment/export";

const TONE: Record<ResponseValue, string> = {
  no: "border-no text-no bg-[#fdf1ee]",
  partly: "border-partly text-partly bg-[#fdf6e8]",
  yes: "border-yes text-yes bg-[#eef7f1]",
};

export function ResponseButtons({
  question,
  scale,
  value,
  onChange,
}: {
  question: string;
  scale: ResponseValue[];
  value?: ResponseValue;
  onChange: (v: ResponseValue) => void;
}) {
  return (
    <fieldset className="rounded-2xl border-2 border-ink/15 bg-white p-5">
      <legend className="px-2 text-base font-semibold">{question}</legend>
      <div className="mt-2 grid gap-3" style={{ gridTemplateColumns: `repeat(${scale.length}, 1fr)` }}>
        {scale.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`min-h-[3.5rem] rounded-xl border-2 text-lg font-semibold transition
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-brand
                ${selected ? TONE[option] + " ring-2 ring-ink/10" : "border-line bg-white text-muted hover:border-ink/25 hover:text-ink"}`}
            >
              {RESPONSE_LABEL[option]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
