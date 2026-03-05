import { notFound } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminBasePath } from "@/lib/env";

export default async function AdminLoginPage({ params }: { params: Promise<{ adminPath: string }> }) {
  const { adminPath } = await params;
  const configuredPath = getAdminBasePath();
  if (adminPath !== configuredPath) notFound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <AdminLoginForm adminPath={adminPath} />
    </main>
  );
}
