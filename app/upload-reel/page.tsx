"use client"
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadVideoSchema } from "@/schemas/uploadVideoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { upload } from "@imagekit/next";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useDebounceCallback } from 'usehooks-ts'

function page() {

    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [isSuggestDesLoading, setIsSuggestDesLoading] = useState(false)
    const debounced = useDebounceCallback(setTitle, 1000)
    const abortController = new AbortController();

    const form = useForm<z.input<typeof uploadVideoSchema>>({
        resolver: zodResolver(uploadVideoSchema),
        defaultValues: {
            title: "",
            description: "",
            controls: true,
            transformation: {
                height: 1920,
                width: 1080,
                quality: 80
            }
        }
    })

    const suggestDescriptionFromAi = async () => {
        if (title.length <= 3) return

        setIsSuggestDesLoading(true)
        form.setValue("description", "AI suggesting description...")
        try {
            const response = await fetch("/api/suggest-description", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify((title))
            })

            const result = await response.json()

            if (!result.success) {
                toast.error(result.message)
                return
            }

            form.setValue("description", result.Data)
        } catch (error) {
            form.setValue("description", "")
        } finally {
            setIsSuggestDesLoading(false)
        }
    }

    useEffect(() => {
        suggestDescriptionFromAi()
    }, [title])

    const authenticator = async () => {
        try {
            const response = await fetch("/api/upload-auth")

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }
            const data = await response.json()
            const { signature, expire, token, publicKey } = data
            return { signature, expire, token, publicKey }
        } catch (error) {
            throw new Error("Authentication request failed");
        }
    }

    const uploadVideo = async (file: File) => {
        const authParams = await authenticator()
        const { signature, expire, token, publicKey } = authParams;

        const videoUploadResponse = await upload({
            signature,
            expire,
            token,
            publicKey,
            file,
            fileName: file.name,
            abortSignal: abortController.signal
        })
        return videoUploadResponse
    }

    const uploadThumbnail = async (file: File) => {
        const authParams = await authenticator()
        const { signature, expire, token, publicKey } = authParams;

        return await upload({
            signature,
            expire,
            token,
            publicKey,
            file,
            fileName: file.name,
            abortSignal: abortController.signal
        })
    }

    const handleUpload = async () => {
        const videoFile = form.getValues("videoUrl")
        const thumbnailFile = form.getValues("thumbnail")
        if (!videoFile) return
        try {
            setIsLoading(true)
            const videoUploadResponse = await uploadVideo(videoFile)
            let thumbnailUploadResponse = null;
            if (thumbnailFile) {
                thumbnailUploadResponse = await uploadThumbnail(thumbnailFile)
            }
            return {
                videoUploadResponse,
                thumbnailUploadResponse: thumbnailFile ? thumbnailUploadResponse : null
            }
        } catch (error) {
            toast.error("Reel Upload fails")
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (data: z.input<typeof uploadVideoSchema>) => {
        try {
            const uploadResponse = await handleUpload()
            if (!uploadResponse) return
            const response = await fetch("/api/video", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    videoUrl: uploadResponse.videoUploadResponse.url,
                    thumbnail: uploadResponse.thumbnailUploadResponse?.url ?? null,
                    controls: data.controls,
                    transformation: {
                        height: data.transformation?.height,
                        width: data.transformation?.width,
                        quality: data.transformation?.quality
                    }
                })
            })

            const result = await response.json()

            if (!response.ok) {
                toast.error(result.message)
                return
            }

            toast.success(result.message)
            form.reset()
        } catch (error) {
           throw error
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen'>
            <div className="w-full max-w-md p-8 my-4 space-y-8 rounded-lg shadow-md">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-center">
                    Upload New Reel
                </h1>
                <form id="reel-upload-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Title
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        type="text"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your title of the video"
                                        autoComplete="off"
                                        onChange={(e) => {
                                            field.onChange(e)
                                            debounced(e.target.value)
                                        }}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Description
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        onBlur={field.onBlur}
                                        placeholder="Enter your description of the video here."
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        {isSuggestDesLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Controller
                            name="videoUrl"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Video
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="file"
                                        aria-invalid={fieldState.invalid}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            field.onChange(file)
                                        }}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="thumbnail"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Thumbnail
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="file"
                                        aria-invalid={fieldState.invalid}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            field.onChange(file)
                                        }}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="controls"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Controls
                                    </FieldLabel>
                                    <Input
                                        id={field.name}
                                        className="h-5 mr-10"
                                        type="checkbox"
                                        checked={field.value || false}
                                        aria-invalid={fieldState.invalid}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <div className="flex flex-row gap-2">
                            <Controller
                                name="transformation.height"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Height
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            value={field.value as number}
                                            id={field.name}
                                            type="number"
                                            aria-invalid={fieldState.invalid}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="transformation.width"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Width
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            value={field.value as number}
                                            id={field.name}
                                            type="number"
                                            aria-invalid={fieldState.invalid}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="transformation.quality"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Quality
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            value={field.value as number}
                                            id={field.name}
                                            type="number"
                                            aria-invalid={fieldState.invalid}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>
                    </FieldGroup>
                </form>
                <Button type="submit" form="reel-upload-form" disabled={isLoading} >
                    {isLoading
                        ?
                        <>
                            <span>Uploading...</span>
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </>
                        :
                        <span>Upload</span>
                    }
                </Button>
            </div>
        </div>
    )
}

export default page
