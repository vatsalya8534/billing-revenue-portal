import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getContractTypes } from "@/lib/actions/contract-type"
import { ContractType } from "@/types"
import { ContractTypeDataTable } from "./contract-type-datatable"

const RolesPage = async () => {
  const contactTypes: ContractType[] = await getContractTypes()

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Contract type</CardTitle>
        <Button className="bg-blue-500 hover:bg-blue-600" asChild>
          <Link href="/admin/contract-type/create">
            Create Contract Type
          </Link>
        </Button>

      </CardHeader>
      <CardContent>
        <ContractTypeDataTable data={contactTypes as ContractType[]} />
      </CardContent>
    </Card>
  )
}

export default RolesPage