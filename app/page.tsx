import { assets } from "@/lib/assets";
import AuthCard from "@/components/AuthCard";

export default function Home() {
  return (
    <main>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12 text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={assets.landingVideo}
          poster={assets.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 w-full max-w-4xl">
          <AuthCard />
        </div>
      </section>
    </main>
  );
}