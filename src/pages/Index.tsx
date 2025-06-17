import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SlideshowSection } from "@/components/landing/SlideshowSection";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="absolute top-0 left-0 right-0 z-20 py-4">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <Logo />
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative flex flex-col items-center justify-center text-center text-white overflow-hidden pt-20 pb-8">
          <div className="absolute inset-0 w-full h-full bg-primary/30 -z-10" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 mb-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              The ultimate hub for your aquarium.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Track water parameters, manage livestock, schedule maintenance, and collaborate with others. All in one beautiful, modern platform.
            </p>
            <Button size="lg" asChild>
              <Link href="/login">Get Started for Free</Link>
            </Button>
          </div>
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 relative z-10">
            <div className="h-[350px] md:h-[400px] rounded-lg overflow-hidden shadow-2xl">
              <SlideshowSection context="landing-page" autoplayDelay={3000} />
            </div>
          </div>
        </section>

        <FeaturesSection />
      </main>
      <footer className="container mx-auto py-6 px-4 md:px-6 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} TankWiki. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button variant="link" size="sm" asChild>
              <Link href="/legal/terms-of-service">Terms of Service</Link>
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/legal/privacy-policy">Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
