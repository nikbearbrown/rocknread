"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  const base =
    "inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-xl px-5 text-base " +
    "font-semibold transition focus-visible:outline focus-visible:outline-2 " +
    "focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed " +
    "disabled:opacity-40";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark active:scale-[0.99]",
    secondary: "border border-line bg-white text-ink hover:bg-[#f4f2ea]",
    ghost: "text-brand underline underline-offset-4 hover:text-brand-dark",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}
