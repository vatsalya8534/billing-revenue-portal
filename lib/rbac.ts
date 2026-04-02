import { auth } from "@/auth";
import { prisma } from "./prisma";

export async function getUserPermissions() {

  const session: any = await auth();
  if (!session?.user?.email) {
    return
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          roleModules: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });
}

export async function canAccess(route: string, action: string) {

  let user = await getUserPermissions();

  if (!user) return false;

  if (user.role?.name?.toLowerCase().includes("admin")) return true;

  const permission = user.role.roleModules.find(
    (rm: any) => {
      return rm.module.route === route
    }
  );

  if (!permission) return false;

  if (action === "view") return !!permission.canView;
  if (action === "create") return !!permission.canCreate;
  if (action === "edit") return !!permission.canEdit;
  if (action === "delete") return !!permission.canDelete;

  return false;
}


export async function getAllowedRoute(route: any) {

  const canView = await canAccess(route, "view")
  const canCreate = await canAccess(route, "create");
  const canEdit = await canAccess(route, "edit");
  const canDelete = await canAccess(route, "delete");

  if (canView || canCreate || canEdit || canDelete) {
    return route;
  }

  return "";
}