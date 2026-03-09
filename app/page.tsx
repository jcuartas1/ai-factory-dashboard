import { DashboardLayout } from '@/components/dashboard/layout';

export default function Home() {
  return (
    <DashboardLayout
      title="Projects"
      breadcrumb={[
        { label: 'Dashboard', href: '#' },
        { label: 'Projects' },
      ]}
    >
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#e5e5e5]">Welcome to Aura Dev</h2>
        <p className="text-[#b0b0b0]">
          Your premium B2B SaaS dashboard is ready. Start building your application!
        </p>
      </div>
    </DashboardLayout>
  );
}
