import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand" />
        <p className="text-sm text-fg-dim">Loading...</p>
      </div>
    </div>
  );
}
