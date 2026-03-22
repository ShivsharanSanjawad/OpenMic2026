import { notFound } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { FormFieldEditor } from "@/components/admin/FormFieldEditor";
import { QRUploader } from "@/components/admin/QRUploader";
import { getPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ adminPath: string }> }) {
  const { adminPath } = await params;
  if (adminPath !== process.env.ADMIN_BASE_PATH) notFound();

  const settings = await getPublicSettings();

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <AdminSidebar basePath={adminPath} />
      <section className="grid gap-5 content-start">
        <div>
          <h1 className="text-3xl font-black text-amber-300">Settings</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Manage event settings, payment info, and form fields</p>
        </div>
        <QRUploader
          basePath={adminPath}
          initialQr={settings.upi_qr_url}
          initialOpen={settings.registrations_open === "true"}
          initialAmounts={{
            solo:  settings.payment_amount_solo,
            group: settings.payment_amount_group,
          }}
        />
        <FormFieldEditor basePath={adminPath} initialFields={settings.form_fields} />
      </section>
    </main>
  );
}
