import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ModuleForm from "@/components/user/module-form";
import Link from "next/link";

const ModuleCreatePage = async () => {

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h1>Add Module</h1>

          <Button asChild className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/module">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ModuleForm update={false}  />
      </CardContent>
    </Card>
  );
};

export default ModuleCreatePage;