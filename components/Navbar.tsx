"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "./ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import { HomeIcon, User2Icon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Separator } from "./ui/separator"

function Navbar() {
  const { data: session, status } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])
  return (
    <nav className="w-full h-14 bg-slate-800 text-gray-400 flex justify-between items-center px-8 py-4">
      <div>
        <Link href="/" className="flex flex-row gap-1">
          <HomeIcon />
          <span className="font-bold">Reels-Pro</span>
        </Link>
      </div>
      <div ref={dropdownRef} className="relative">
        <Button onClick={() => setDropdownOpen(!dropdownOpen)} id="dropdownDefaultButton" data-dropdown-toggle="dropdown">
          <User2Icon />
        </Button>
        {dropdownOpen && <div id="dropdown" className="absolute right-0 z-10 bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44">
          <ul className="p-2 text-sm text-body font-medium" aria-labelledby="dropdownDefaultButton">
            {status === "authenticated" ?
              <>
              <li>
                <p className="inline-flex items-center w-full p-2 rounded">{session.user.name}</p>
              </li>
              <Separator />
                <li>
                  <a href="upload-reel" className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Upload</a>
                </li>
                <li>
                  <button onClick={() => signOut()} className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded cursor-pointer">Logout</button>
                </li>
              </> : <li>
                <a href="/login" className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Login</a>
              </li>
            }
          </ul>
        </div>}
      </div>
    </nav>
  )
}

export default Navbar
