"use client"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller, useForm } from "react-hook-form"
import { registerSchema } from "@/schemas/registerSchema"
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Link from "next/link"

function page() {
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof registerSchema>) => {
        setLoading(true)
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(data)
            })

            const Data = await response.json()

            if (!response.ok) {
                toast.error(Data.message)
                return
            }

            toast.success(Data.message)
            router.replace("/login")

        } catch (error) {
            toast.error("Registration Fails")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className='flex justify-center items-center min-h-screen'>
            <div className="w-full max-w-md p-8 my-8 space-y-8 bg-slate-800 text-gray-400 rounded-lg shadow-md">
                <div className="space-y-6 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join Open Feedback
                    </h1>
                    <p className="mb-4 font-bold">Sign up to start your anonymous adventure</p>
                </div>
                <form id="registration-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="username"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Enter your username"
                                        type="text"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Enter your Email"
                                        type="email"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="Enter your password"
                                        type="password"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
                <Button variant="outline" type="submit" form="registration-form" >
                    {loading ? <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>Loading...</span>
                    </>
                        : <p>Submit</p>}
                </Button>
                <div className="flex justify-center items-center gap-2 text-gray-400">
                    Already have an account?
                    <Link href={"/login"} className="hover:underline transition duration-75">Login</Link>
                </div>
            </div>
        </div>
    )
}

export default page
