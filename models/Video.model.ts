import mongoose from "mongoose";

const VIDEO_DIMENSIONS = {
    width: 1080,
    height: 1920
} as const;

export interface videoInterface {
    _id?: mongoose.Types.ObjectId
    title: string
    description: string,
    videoUrl: string,
    thumbnail?: string,
    controls?: boolean,
    transformation?: {
        width: number,
        height: number,
        quality?: number
    }
}

const videoSchema = new mongoose.Schema<videoInterface>(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        videoUrl: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
        },
        controls: {
            type: Boolean,
        },
        transformation: {
            height: { type: Number, default: VIDEO_DIMENSIONS.height },
            width: { type: Number, default: VIDEO_DIMENSIONS.width },
            quality: { type: Number, min: 1, max: 100 }
        }
    }
)

const Video = mongoose.models.Video || mongoose.model<videoInterface>("Video", videoSchema)

export default Video