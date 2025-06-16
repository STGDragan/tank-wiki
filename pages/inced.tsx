import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SlideshowSection } from "@/components/landing/SlideshowSection";

export default function Inced() {
  const contextValue = {}; // <-- Adjust this to your actual context data

  return (
    <>
      <header>
        <Logo />
      </header>
      <main>
        <SlideshowSection context={contextValue} />
        <FeaturesSection />
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </main>
    </>
  );
}
