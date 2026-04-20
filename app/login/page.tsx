"use client"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginSchema } from "@/schemas/loginSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod";

function page() {
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password
      })

      if (result?.error) {
        toast.error(result.error)
      }

      if (result?.url) {
        router.push(result.url)
      }

    } catch (error) {
      toast.error("Login Failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="w-full max-w-md p-8 my-4 space-y-8 bg-slate-800 text-gray-400 rounded-lg shadow-md">
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Open Feedback
          </h1>
          <p className="mb-4 font-bold">Sign up to start your anonymous adventure</p>
        </div>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="identifier"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Identifier</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Enter your username or email"
                    type="text"
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
        <Button variant="outline" type="submit" form="login-form" >
          {isLoading ? <>
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Loading...</span>
          </>
            : <p>Submit</p>}
        </Button>
        <div className="flex justify-center items-center gap-2 text-gray-400">
          Doesn't have an account?
          <Link href={"/register"} className="hover:underline transition duration-75">Register</Link>
        </div>
      </div>
    </div>
  )
}

export default page
