import ServiceTypeForm from "@/components/service-type/service-type-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const ServiceTypeCreatePage = async () => {
  const route = "/admin/service-type";
  const canCreate = await canAccess(route, "create");
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <CreatePageShell title="Add Service Type" backHref="/admin/service-type">
      <ServiceTypeForm update={false} />
    </CreatePageShell>
  );
};

export default ServiceTypeCreatePage;
