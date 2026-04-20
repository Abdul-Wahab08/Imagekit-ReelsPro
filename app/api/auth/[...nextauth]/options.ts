import CredentialsProvider from "next-auth/providers/credentials";
import { databaseConnection } from "@/lib/dbConnect";
import User from "@/models/User.model";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                identifier: { label: "Identifier", type: "text" },
                password: { label: "Password", type: "text" }
            },

            async authorize(credentials: any) {
                if (!credentials.identifier || !credentials.password) {
                    throw new Error("Both Identifier and Password fields are required")
                }

                await databaseConnection()

                try {
                    const user = await User.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ]
                    })

                    if (!user) {
                        throw new Error("User not found")
                    }

                    const isValidPassword = await bcrypt.compare(credentials.password, user.password)

                    if (!isValidPassword) {
                        throw new Error("Invalid Password")
                    }

                    return {
                        id: user.id,
                        name: user.username,
                        email: user.email
                    }
                } catch (error) {
                    throw error
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
            }
            return token
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.name = token.name
                session.user.email = token.email
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET
}
