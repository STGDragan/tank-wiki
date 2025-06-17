import Link from "next/link";
<<<<<<< HEAD
import { Button } from "../components/ui/button";
import { Logo } from "../components/Logo";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { SlideshowSection } from "../components/landing/SlideshowSection";

export default function Inced() {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const contextValue = {}; // <-- Adjust this to your actual context data
=======
  const contextValue = ""; // placeholder string
>>>>>>> parent of 16584ac (Update inced.tsx)
=======
  const contextValue = ""; // placeholder string
>>>>>>> parent of 16584ac (Update inced.tsx)
=======
  const contextValue = {}; // <-- Adjust this to your actual context data
>>>>>>> parent of 59c5078 (Update inced.tsx)

>>>>>>> parent of 59c5078 (Update inced.tsx)
=======
import { Button } from "../src/components/ui/button";
import { Logo } from "../src/components/Logo";
import { FeaturesSection } from "../src/components/landing/FeaturesSection";
import { SlideshowSection } from "../src/components/landing/SlideshowSection";

export default function Inced() {
>>>>>>> parent of 02b18e2 (Update inced.tsx)
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
