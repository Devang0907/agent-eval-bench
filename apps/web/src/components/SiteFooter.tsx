import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/70">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-sm font-semibold text-snow">Agent Eval Bench</p>
          <p className="mt-1 text-sm text-mute">Evaluate coding agents. Sync results to the cloud.</p>
        </div>
        <div className="flex gap-5 text-sm text-mute">
          <Link href="/docs" className="hover:text-snow">
            Docs
          </Link>
          <Link href="/docs/cloud" className="hover:text-snow">
            Cloud sync
          </Link>
          <Link href="/pricing" className="hover:text-snow">
            Pricing
          </Link>
          <a
            href="https://github.com"
            className="hover:text-snow"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
