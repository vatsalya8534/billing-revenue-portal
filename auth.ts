import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bycrpt from "bcrypt"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: "/",
        error: "/"
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60
    },
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (credentials == null) return null;

                // find user in database
                const user = await prisma.user.findFirst({
                    where: { username: credentials.username as string },
                    include: { role: true }
                })

                console.log(user);

                // check if user exist and if the password matches
                if (user && user.password) {
                    const isMatched = await bycrpt.compare(credentials.password as string, user.password)

                    // if password  is correct , return user
                    if (isMatched) {
                        return {
                            id: user.id,
                            username: user.username ?? "",
                            firstName: user.firstName ?? "",
                            lastName: user.lastName ?? "",
                            email: user.email ?? "",
                            role: user.role.name ?? "USER",
                        };
                    }
                }

                // if user does not exist or password does not matched return null
                return null
            }
        })
    ],
    callbacks: {
        async session({ session, user, trigger, token }: any) {
            // set the user id from the token
            session.user.id = token.sub
            session.user.role = token.role
            session.user.name = token.firstName
            session.user.email = token.email

            // if there is an update , set the user name
            if (trigger === "update") {
                session.user.name = user.name
            }

            return session
        },
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.id = user.id;
                token.roleId = user.roleId;
                token.firstName = user.firstName;
                token.email = user.email;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { firstName: token.name }
                })
            }

            return token
        }
    }
})