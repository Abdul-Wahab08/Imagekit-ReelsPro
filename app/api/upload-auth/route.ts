import { getUploadAuthParams } from "@imagekit/next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/options"

export async function GET() {
    try {

        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            Response.json(
                {
                    error: "Not Authorized"
                },
                {
                    status: 403
                }
            )
        }

        const { token, expire, signature } = getUploadAuthParams({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string
        })

        return Response.json({
            token, expire, signature,
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
        })
    } catch (error) {
        return Response.json(
            {
                error: "Authentication failed for imagekit"
            },
            {
                status: 500
            }
        )
    }
}