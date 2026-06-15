import { Sidebar } from '@/components/layout/sidebar';
import { BrandBar } from '@/components/layout/brand-bar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <BrandBar />
        <main className="flex-1 p-6 max-w-[1500px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
