import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CustomerForm from "../../../../../components/customer/customer-form";

export default function CreateCustomerPage() {
  async function createCustomer(formData: FormData) {
    "use server";

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const companyName = formData.get("companyName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const city = formData.get("city") as string;
    const alternatePhone = formData.get("alternatePhone") as string;
    const addressLine1 = formData.get("addressLine1") as string;
    const addressLine2 = formData.get("addressLine2") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;
    const postalCode = formData.get("postalCode") as string;
    const gstNumber = formData.get("gstNumber") as string;
    const panNumber = formData.get("panNumber") as string;
    const website = formData.get("website") as string;
    const remark = formData.get("remark") as string;

    const count = await prisma.customer.count();

    const customerCode = `CUST-${String(count + 1).padStart(4, "0")}`;

    await prisma.customer.create({
      data: {
        customerCode,
        firstName,
        lastName,
        companyName,
        email,
        phone,
        city,
        alternatePhone,
        addressLine1,
        addressLine2,
        state,
        country,
        postalCode,
        gstNumber,
        panNumber,
        website,
        remark,
      },
    });

    redirect("/admin/customer");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Create Customer</h1>

      <CustomerForm action={createCustomer} />
    </div>
  );
}
