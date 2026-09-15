export function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-accent-green/10 px-2.5 py-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-accent-green" />
      </span>
      <span className="text-xs font-semibold tracking-wide text-accent-green">LIVE</span>
    </div>
  );
}
