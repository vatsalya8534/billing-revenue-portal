import "dotenv/config"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { Status } from "@prisma/client"

async function main() {
    console.log("Seeding database...")

    const password = await bcrypt.hash("admin123", 10)

    const adminRole = await prisma.role.upsert({
        where: { name: "Admin" },
        update: {},
        create: {
            name: "Admin",
            remark: "System Administrator",
            status: Status.ACTIVE
        }
    })

    await prisma.user.upsert({
        where: { email: "admin@asset.com" },
        update: {},
        create: {
            username: "admin",
            password: password,
            firstName: "Admin",
            lastName: "Admin",
            email: "admin@example.com",
            status: Status.ACTIVE,
            roleId: adminRole.id,
        }
    })

    console.log("Seed completed")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })