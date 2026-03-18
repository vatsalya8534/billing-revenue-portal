import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Role } from "@prisma/client"
import { getRoles } from "@/lib/actions/role"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getServiceTypes } from "@/lib/actions/service-type"
import { Project } from "@/types"
import { getProjects } from "@/lib/actions/project"
import { PLDataTable } from "./pl-datatable"


const ProjectPage = async () => {
    let projects = await getProjects()

    projects = JSON.parse(JSON.stringify(projects))

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle>Project</CardTitle>
                <Button className="bg-blue-500 hover:bg-blue-600" asChild>
                    <Link href="/admin/pl/create">
                        Create Project
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <PLDataTable data={projects as any} />
            </CardContent>
        </Card>
    )
}

export default ProjectPage