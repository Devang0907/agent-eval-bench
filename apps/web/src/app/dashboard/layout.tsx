import { DashboardNav } from "@/components/DashboardNav";
import { RequireAuth } from "@/components/RequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-10">
      <RequireAuth>
        <div className="flex flex-col gap-8 md:flex-row">
          <DashboardNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </RequireAuth>
    </div>
  );
}
