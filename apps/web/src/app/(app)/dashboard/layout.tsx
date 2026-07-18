import { DashboardNav } from "@/components/DashboardNav";
import { PageEnter } from "@/components/motion/PageEnter";
import { RequireAuth } from "@/components/RequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <a
        href="#dashboard-content"
        className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>
      <main id="dashboard-content">
        <RequireAuth>
          <DashboardNav />
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
            <PageEnter>{children}</PageEnter>
          </div>
        </RequireAuth>
      </main>
    </div>
  );
}
