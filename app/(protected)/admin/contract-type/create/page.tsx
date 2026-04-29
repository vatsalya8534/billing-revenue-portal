import ContractTypeForm from "@/components/contract-type/contract-type-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const ContractTypeCreatePage = async () => {
  const route = "/admin/contract-type";

  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <CreatePageShell title="Add Contract Type" backHref="/admin/contract-type">
      <ContractTypeForm update={false} />
    </CreatePageShell>
  );
};

export default ContractTypeCreatePage;
