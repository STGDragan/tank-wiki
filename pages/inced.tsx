import Link from "next/link";
import { Button } from "../src/components/ui/button";
import { Logo } from "../src/components/Logo";
import { FeaturesSection } from "../src/components/landing/FeaturesSection";
import { SlideshowSection } from "../src/components/landing/SlideshowSection";

export default function Inced() {
  return (
    <>
      <header>
        <Logo />
      </header>
      <main>
        <SlideshowSection />
        <FeaturesSection />
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </main>
    </>
  );
}
