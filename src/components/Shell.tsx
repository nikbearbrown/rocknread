import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-6 print-page sm:px-8">{children}</main>
  );
}

export function Masthead({ subtitle }: { subtitle?: string }) {
  return (
    <header className="mb-6 border-b border-line pb-4 text-center">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-brand">
        Rock &rsquo;n&rsquo; Read
      </p>
      <h1 className="mt-1 font-serif text-[1.6rem] leading-tight sm:text-3xl">
        Musical Fitness Assessment
      </h1>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
    </header>
  );
}
