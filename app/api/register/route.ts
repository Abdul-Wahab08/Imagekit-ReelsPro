import User from "@/models/User.model";
import { databaseConnection } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    await databaseConnection()

    try {
        const { username, email, password } = await request.json()

        if (!(username && email && password)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username, Email and Password are required"
                },
                {
                    status: 400
                }
            )
        }

        const existingEmailUser = await User.findOne({ email })

        if (existingEmailUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User with this email already exists"
                },
                {
                    status: 400
                }
            )
        }

        const existingUsernameUser = await User.findOne({ username })

        if (existingUsernameUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User with this username already exists"
                },
                {
                    status: 400
                }
            )
        }

        const newUser = await User.create({
            email,
            username,
            password
        })

        if (!newUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Something went wrong while registering user"
                },
                {
                    status: 500
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully"
            },
            {
                status: 201
            }
        )

    } catch (error) {
        console.log("Something went wrong while registering user", error)
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong while registering user"
            },
            {
                status: 500
            }
        )
    }
}