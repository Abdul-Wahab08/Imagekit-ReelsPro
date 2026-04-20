import * as z from "zod";

const VIDEO_DIMENSIONS = {
    height: 1920,
    width: 1080
} as const;

export const uploadVideoSchema = z.object({
    title: z.string().min(3, "Title must contain at least 3 characters").max(20, "Title must not be more than 20 characters."),
    description: z.string().min(10, "Description must contain at least 10 characters").max(300, "Description must not be more than 300 characters."),
    videoUrl: z.file().mime(["video/mp4", "video/ogg", "video/webm"]),
    thumbnail: z.file().mime(["image/png", "image/jpeg"]).optional(),
    controls: z.boolean().optional(),
    transformation: z.object({
        height: z.coerce.number().default(VIDEO_DIMENSIONS.height),
        width: z.coerce.number().default(VIDEO_DIMENSIONS.width),
        quality: z.coerce.number().min(1, "Quality must be equal or greater than 1").max(100, "Quality must be equal or less than 100").optional()
    }).optional()
})