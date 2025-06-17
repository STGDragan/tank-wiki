import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SlideshowSection } from "@/components/landing/SlideshowSection";

export default function Inced() {
  // Pass a valid string context for slideshow
  const contextValue = "landing-page"; // or "dashboard", or whatever fits your use case

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
