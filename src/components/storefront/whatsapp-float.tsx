"use client";

import { MessageCircle } from "lucide-react";
import { useLang } from "@/components/language/provider";

const WA_NUMBER = "201150301033";

export function WhatsAppFloat() {
  const { lang } = useLang();
  const ar = lang === "ar";

  return (
    <a
      href={`https://wa.me/${WA_NUMBER}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="wa-float fixed bottom-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 ltr:right-5 rtl:left-5"
    >
      <MessageCircle size={22} fill="white" strokeWidth={0} />
      <span className="hidden text-sm font-semibold sm:inline">
        {ar ? "عندك سؤال؟" : "Got a question?"}
      </span>
    </a>
  );
}
