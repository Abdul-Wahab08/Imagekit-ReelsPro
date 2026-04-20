"use client"
import { videoInterface } from "@/models/Video.model";
import { buildSrc, ImageKitProvider, Video } from "@imagekit/next";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const fetchReels = async () => {
      try {
        const response = await fetch("/api/video", {
          method: "GET",
          headers: { "Content-type": "application/json" }
        })

        const data = await response.json()

        if (!response.ok) {
          toast.error(data.message)
        }
        
        setReels(data.reels)

      } catch (error) {
        console.log("Something went wrong while fetching videos ", error)
        toast.error("Something went wrong while fetching videos")
      } finally {
        setLoading(false)
      }
    }

    fetchReels()
  }, [])

  return (
    <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}>
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans">
        <main className="w-full max-w-5xl px-6 py-12">

          <div className="mb-8 flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-rose-500"></div>
            <h2 className="text-lg font-semibold tracking-widest text-zinc-300 uppercase">
              Reels
            </h2>
          </div>
          {reels.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-32 text-center">
              <div className="rounded-full bg-zinc-800 p-5">
                <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-500">No reels available yet</p>
            </div>
          ) :
            (
              loading
                ?
                <Loader2 className="w-10 h-10 text-center animate-spin" />
                :
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {loading && <Loader2 className="h-4 w-4 animate-spin " />}
                  {reels.map((reel: videoInterface) => <div
                    key={reel._id?.toString()}
                    className="group relative overflow-hidden rounded-2xl bg-zinc-900 shadow-xl ring-1 ring-white/5 transition-all duration-300 hover:scale-[1.03] hover:shadow-rose-900/30 hover:shadow-2xl hover:ring-rose-500/30">
                    <Video
                      src={`${reel.videoUrl}?tr=w-${reel.transformation?.width ?? 1080},h-${reel.transformation?.height ?? 1920},q-${reel.transformation?.quality ?? 80}`}
                      controls
                      preload="none"
                      poster={buildSrc({
                        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
                        src: reel.thumbnail || "https://ik.imagekit.io/tr0l4eqrr/NoThumbnail.png"
                      })}
                      height={200}
                      width={200}
                      className="aspect-9/16 w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>

                  </div>)}
                </div>
            )}
        </main>
      </div>
    </ImageKitProvider>
  );
}
