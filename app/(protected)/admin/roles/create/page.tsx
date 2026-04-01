import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoleForm from "@/components/role/role-form";
import Link from "next/link";
import { getModules } from "@/lib/actions/module-action";

const RoleCreatePage = async () => {

  const modules = await getModules(); 

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Role</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/roles">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <RoleForm update={false} modules={modules}  />
      </CardContent>
    </Card>
  );
};

export default RoleCreatePage;