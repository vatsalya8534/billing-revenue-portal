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
        where: { email: "admin@example.com" },
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

    await prisma.customer.create({
        data: {
            customerCode: "CUSTOMER-0001",
            phone: "1234567890",
            firstName: "Customer ",
            lastName: "1",
            companyName: "Technosyslabs",
            alternatePhone: "1234567890",
            email: "customer@technosyslabs.com",
            addressLine1: "Indrapuram",
            addressLine2: "Ghaziabad",
            city: "Ghaziabad",
            state: "UP",
            country: "India",
            postalCode: "201102",
            gstNumber: "12212121212121212121",
            panNumber: "21212121212121212",
            website: "http://technosyslabs.com",
            remark: "tes",
            status: Status.ACTIVE
        }
    })

    await prisma.customer.upsert({
        where: { email: "customer@technosyslabs.com" },
        update: {
          
        },
        create: {
            customerCode: "CUSTOMER0001",
            phone: "1234567890",
            firstName: "Customer ",
            lastName: "1",
            companyName: "Technosyslabs",
            alternatePhone: "1234567890",
            email: "customer@technosyslabs.com",
            addressLine1: "Indrapuram",
            addressLine2: "Ghaziabad",
            city: "Ghaziabad",
            state: "UP",
            country: "India",
            postalCode: "201102",
            gstNumber: "12212121212121212121",
            panNumber: "21212121212121212",
            website: "http://technosyslabs.com",
            remark: "tes",
            status: Status.ACTIVE
        },
    })

    await prisma.contractType.create({
        data: {
            name: "Contract type 1",
            remark: "Contract type 1",
            status: Status.ACTIVE
        }
    })

    await prisma.serviceType.create({
        data: {
            name: "Service type 1",
            remark: "Service type 1",
            status: Status.ACTIVE
        }
    })

    await prisma.contractDuration.create({
        data: {
            name: "Contract Duration 1",
            totalNumberOfMonths: 10,
            remark: "",
            status: Status.ACTIVE
        }
    })

    await prisma.billingPlan.create({
        data: {
            name: "Billing Plan 1",
            totalBillingCycles: 2,
            remark: "",
            status: Status.ACTIVE
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