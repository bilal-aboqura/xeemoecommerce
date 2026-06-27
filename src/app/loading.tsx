import Image from "next/image";

export default function Loading() {
  return (
    <div className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(225,6,0,0.14),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8f5f5_52%,#ffffff_100%)] px-5 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[14%] h-72 w-72 -translate-x-1/2 rounded-full bg-brand/12 blur-3xl animate-loading-pulse" />
        <div className="absolute bottom-[18%] left-[14%] h-40 w-40 rounded-full border border-black/6 bg-white/55 blur-sm animate-loading-float" />
        <div className="absolute right-[10%] top-[20%] h-52 w-52 rounded-full border border-brand/10 bg-brand/[0.05] blur-2xl animate-loading-drift" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(225,6,0,0.35),transparent)]" />
      </div>

      <div className="glass-elevated relative w-full max-w-3xl overflow-hidden rounded-[28px] px-6 py-10 sm:px-10 sm:py-12">
        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(225,6,0,0.45),transparent)]" />
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand/[0.08] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/3 translate-y-1/3 rounded-full bg-black/[0.05] blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-black/8 animate-loading-rotate" />
            <div className="absolute inset-3 rounded-full border border-brand/25 border-dashed animate-loading-rotate-reverse" />
            <div className="absolute inset-6 rounded-full bg-white shadow-[0_10px_30px_rgba(17,17,17,0.08)]" />
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffffff_0%,#fff4f3_100%)] shadow-[0_0_0_1px_rgba(17,17,17,0.05),0_12px_30px_rgba(225,6,0,0.14)]">
              <Image
                src="/logo.png"
                alt="Xeemo"
                width={72}
                height={24}
                className="h-auto w-12 object-contain brightness-0"
                priority
              />
            </div>
          </div>

          <div className="mt-8 max-w-xl">
            <p className="font-display text-sm uppercase tracking-[0.35em] text-brand/80">
              Xeemo
            </p>
            <h1 className="mt-4 font-heading text-3xl font-bold uppercase leading-none text-fg sm:text-5xl">
              Preparing a sharper storefront
            </h1>
            <p className="mt-4 text-sm leading-6 text-fg-dim sm:text-base">
              Loading products, prices, and the good-looking parts.
            </p>
          </div>

          <div className="mt-10 w-full max-w-xl space-y-4">
            <div className="h-2 overflow-hidden rounded-full bg-black/7">
              <div className="h-full w-1/2 rounded-full bg-[linear-gradient(90deg,rgba(225,6,0,0.18),#e10600_50%,rgba(17,17,17,0.14))] animate-loading-bar" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <LoadingStat label="Catalog" value="Syncing" />
              <LoadingStat label="Offers" value="Calculating" />
              <LoadingStat label="Experience" value="Polishing" />
            </div>

            <div className="grid gap-2.5">
              <LoadingSkeleton className="w-full" />
              <LoadingSkeleton className="w-[88%]" delayClassName="[animation-delay:160ms]" />
              <LoadingSkeleton className="w-[72%]" delayClassName="[animation-delay:320ms]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/6 bg-white/70 px-4 py-4 text-left shadow-[0_12px_24px_rgba(17,17,17,0.04)] backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-dim">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-brand animate-loading-blink" />
        <p className="text-sm font-semibold text-fg">{value}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton({
  className,
  delayClassName = "",
}: {
  className: string;
  delayClassName?: string;
}) {
  return (
    <div
      className={`h-3 rounded-full bg-[linear-gradient(90deg,rgba(17,17,17,0.05),rgba(225,6,0,0.14),rgba(17,17,17,0.05))] bg-[length:220%_100%] animate-loading-shimmer ${className} ${delayClassName}`}
    />
  );
}
