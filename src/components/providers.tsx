"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/language/provider";

import type { Lang } from "@/lib/i18n/translations";

import { ReactLenis } from "lenis/react";

/** Client-side providers shared across the whole app. */
export function Providers({ children, initialLang }: { children: ReactNode; initialLang: Lang }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true, syncTouch: true }}>
      <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
    </ReactLenis>
  );
}
