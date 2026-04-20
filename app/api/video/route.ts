import { databaseConnection } from "@/lib/dbConnect";
import Video, { videoInterface } from "@/models/Video.model";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        await databaseConnection()

        const videos = await Video.find({}).sort({ createdAt: -1 })

        if (!videos || videos.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: "No Reels"
                },
                {
                    status: 400
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "All Reels are fetched successfully",
                reels: videos
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.log("Error Occuring while fetching Reels", error)
        return NextResponse.json(
            {
                success: false,
                message: "Error Occuring while fetching Reels", error
            },
            {
                status: 500
            }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await databaseConnection()

        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Not authorized!"
                },
                {
                    status: 401
                }
            )
        }

        const body: videoInterface = await request.json()

        const newVideo = await Video.create({
            title: body.title,
            description: body.description,
            videoUrl: body.videoUrl,
            thumbnail: body?.thumbnail,
            controls: body?.controls ?? true,
            transformation: {
                height: body.transformation?.height,
                width: body.transformation?.width,
                quality: body.transformation?.quality ?? 100
            }
        })

        if (!newVideo) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Something went wrong while uploading Reel"
                },
                {
                    status: 500
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "Reel uploaded successfully",
                video: newVideo
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.log("Something went wrong while uploading Reel", error)
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong while uploading Reel", error
            },
            {
                status: 500
            }
        )
    }
}