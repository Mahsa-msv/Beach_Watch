export default function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:py-6">
        {/* Wave / beach mark */}
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-card"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 16c1.8 0 1.8-2 3.6-2s1.8 2 3.6 2 1.8-2 3.6-2 1.8 2 3.6 2" />
            <path d="M3 20c1.8 0 1.8-2 3.6-2s1.8 2 3.6 2 1.8-2 3.6-2 1.8 2 3.6 2" />
            <circle cx="17" cy="7" r="3" />
          </svg>
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-none tracking-tight text-ink sm:text-3xl">
            Beach Watch
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Is the beach open? Check HRM beach status before you drive.
          </p>
        </div>
      </div>
    </header>
  );
}
