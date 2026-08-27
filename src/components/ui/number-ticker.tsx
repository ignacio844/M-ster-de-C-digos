"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const DIGIT_HEIGHT_EM = 1.1;
const DIGITS = Array.from({ length: 10 }, (_, n) => n);

export interface NumberTickerProps {
  value: number;
  pad?: number;
  duration?: number;
  stagger?: number;
  startOnView?: boolean;
  prefix?: string;
  suffix?: string;
  blur?: boolean;
  className?: string;
  digitClassName?: string;
  locale?: boolean;
  format?: (value: number) => string;
}

export function NumberTicker({
  value,
  pad,
  duration = 0.9,
  stagger = 0.04,
  startOnView = true,
  prefix,
  suffix,
  blur = false,
  className,
  digitClassName,
  locale,
  format,
}: NumberTickerProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.6 });
  const [armed, setArmed] = useState(!startOnView);
  const enteredRef = useRef(false);

  useEffect(() => {
    if (startOnView && inView) setArmed(true);
  }, [startOnView, inView]);

  const text = useMemo(() => {
    const rounded = Math.round(value);
    const formatted = format
      ? format(rounded)
      : locale
        ? rounded.toLocaleString()
        : rounded.toString();

    return pad ? formatted.padStart(pad, "0") : formatted;
  }, [value, pad, format, locale]);

  const glyphs = useMemo(() => {
    const chars = text.split("");
    return chars.map((char, i) => ({
      char,
      id: `g-${chars.length - 1 - i}`,
    }));
  }, [text]);

  const readableText = `${prefix ?? ""}${text}${suffix ?? ""}`;

  useEffect(() => {
    if (!armed || enteredRef.current) return;

    const total = (duration + glyphs.length * stagger) * 1000;
    const timer = window.setTimeout(() => {
      enteredRef.current = true;
    }, total);

    return () => window.clearTimeout(timer);
  }, [armed, duration, stagger, glyphs.length]);

  return (
    <span
      ref={containerRef}
      className={cn("inline-flex items-center tabular-nums", className)}
    >
      <span className="sr-only">{readableText}</span>

      <span aria-hidden="true" className="inline-flex items-center">
        {prefix ? <span>{prefix}</span> : null}

        {glyphs.map(({ char, id }, i) => {
          if (!/\d/.test(char)) {
            return (
              <span key={id} className="inline-block">
                {char}
              </span>
            );
          }

          return (
            <Digit
              key={id}
              digit={armed ? Number(char) : 0}
              delay={enteredRef.current ? 0 : i * stagger}
              duration={duration}
              blur={blur}
              className={digitClassName}
            />
          );
        })}

        {suffix ? <span>{suffix}</span> : null}
      </span>
    </span>
  );
}

function Digit({
  digit,
  delay,
  duration,
  blur,
  className,
}: {
  digit: number;
  delay: number;
  duration: number;
  blur: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const digitColumn = DIGITS.map((n) => (
    <span
      key={n}
      className="flex h-[1.1em] items-center justify-center leading-none"
    >
      {n}
    </span>
  ));

  return (
    <span
      className={cn("relative inline-block overflow-hidden", className)}
      style={{
        height: `${DIGIT_HEIGHT_EM}em`,
        width: "1ch",
      }}
    >
      <motion.span
        initial={{ y: 0 }}
        animate={{ y: `-${digit * DIGIT_HEIGHT_EM}em` }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration, delay, ease: EASE_OUT }
        }
        className="absolute inset-x-0 top-0 will-change-transform"
      >
        {/* Capa nítida permanente. Nunca se anima el CSS filter sobre ella. */}
        <span className="flex flex-col items-center">{digitColumn}</span>

        {/*
          El blur ahora es una segunda capa estática que solo desvanece su
          opacidad. De esta forma Chrome nunca tiene que quitar/recalcular un
          filter al final de la animación, que era lo que generaba el destello.
        */}
        {blur && !reduce ? (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{
              duration: Math.min(duration * 0.5, 0.3),
              delay,
              ease: EASE_OUT,
            }}
            className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center will-change-opacity"
            style={{
              filter: "blur(6px)",
              transform: "translateZ(0)",
            }}
          >
            {DIGITS.map((n) => (
              <span
                key={n}
                className="flex h-[1.1em] items-center justify-center leading-none"
              >
                {n}
              </span>
            ))}
          </motion.span>
        ) : null}
      </motion.span>
    </span>
  );
}
