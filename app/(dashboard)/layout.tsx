import { Nav } from "@/components/nav";
import { Header } from "@/components/header";
import { JobDrawerProvider } from "@/components/job-drawer";
import { ClickSparks } from "@/components/click-sparks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <JobDrawerProvider>
      <div className="min-h-screen">
        <Nav />
        <div className="md:ml-64">
          <Header />
          <main className="p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        </div>
      </div>
      <ClickSparks />
    </JobDrawerProvider>
  );
}
