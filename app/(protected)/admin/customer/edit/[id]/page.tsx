import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import CustomerForm from "../../customer-form"

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  if (!id) {
    notFound()
  }

  const customer = await prisma.customer.findUnique({
    where: { id },
  })

  if (!customer) {
    notFound()
  }

  async function updateCustomer(formData: FormData) {
    "use server"

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const companyName = formData.get("companyName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const city = formData.get("city") as string

    await prisma.customer.update({
      where: { id },
      data: {
        firstName,
        lastName,
        companyName,
        email,
        phone,
        city,
      },
    })

    redirect("/admin/customer")
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">
        Edit Customer
      </h1>

      <CustomerForm
        action={updateCustomer}
        defaultValues={customer}
      />
    </div>
  )
}