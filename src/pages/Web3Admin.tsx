import { Web3AdminDashboard } from "@/components/admin/Web3AdminDashboard";

export const Web3Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <Web3AdminDashboard />
      </div>
    </div>
  );
};

