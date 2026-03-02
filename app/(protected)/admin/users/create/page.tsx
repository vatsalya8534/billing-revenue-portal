"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserForm from "@/components/user/user-form"; 
import Link from "next/link";
import { Role } from "@prisma/client";

interface UserCreatePageProps {
  roles: Role[];
}

const UserCreatePage: React.FC<UserCreatePageProps> = ({ roles }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add User</CardTitle>
          <Link href="/admin/users">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Back
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <UserForm roles={roles} update={false} />
      </CardContent>
    </Card>
  );
};

export default UserCreatePage;