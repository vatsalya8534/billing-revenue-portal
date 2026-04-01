import { prisma } from "./prisma";


// ✅ get full user with permissions
export async function getUserPermissions(email: string) {
  return prisma.user.findUnique({
    where: { email },
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

export function canAccess(user: any, route: string, action: string) {

  if (!user) return false;

  // ✅ FIXED ADMIN CHECK (FINAL)
  if (user.role?.name?.toLowerCase().includes("admin")) return true;

  const permission = user.role.roleModules.find(
    (rm: any) => rm.module.route === route,
  );

  if (!permission) return false;

  if (action === "view") return !!permission.canView;
  if (action === "create") return !!permission.canCreate;
  if (action === "edit") return !!permission.canEdit;
  if (action === "delete") return !!permission.canDelete;

  return false;
}
