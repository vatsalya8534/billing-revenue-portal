import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Role } from "@prisma/client"
import { getRoles } from "@/lib/actions/role"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getServiceTypes } from "@/lib/actions/service-type"
import { ServiceType } from "@/types"
import { ServiceTypeDataTable } from "./service-type-datatable"

const RolesPage = async () => {
  const serviceTypes: ServiceType[] = await getServiceTypes()

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Service Types</CardTitle>
        <Link href="/admin/service-type/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create Service Type</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ServiceTypeDataTable data={serviceTypes as ServiceType[]} />
      </CardContent>
    </Card>
  )
}

export default RolesPage