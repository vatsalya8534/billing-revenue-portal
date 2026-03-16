import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContractDuration } from "@/types"
import { getContractDurations } from "@/lib/actions/contract-duration"
import { ContractDurationDataTable } from "./contract-duration-datatable"

const ContractDurationPage = async () => {
  const contractDuration: ContractDuration[] = await getContractDurations()

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Contract Duration</CardTitle>
        <Link href="/admin/contract-duration/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create Contract Duration</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ContractDurationDataTable data={contractDuration as ContractDuration[]} />
      </CardContent>
    </Card>
  )
}

export default ContractDurationPage