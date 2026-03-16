import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserForm from "@/components/user/user-form";
import Link from "next/link";
import { Role } from "@prisma/client";
import { getRoles } from "@/lib/actions/role";

const UserCreatePage = async () => {
  const roles = await getRoles();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add User</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/users">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <UserForm update={false} />
      </CardContent>
    </Card>
  );
};

export default UserCreatePage;