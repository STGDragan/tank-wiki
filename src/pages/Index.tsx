
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SlideshowSection } from "@/components/landing/SlideshowSection";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-32 relative">
           <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-background dark:bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)]"></div>
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              The ultimate hub for your aquarium.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Track water parameters, manage livestock, schedule maintenance, and collaborate with others. All in one beautiful, modern platform.
            </p>
            <Button size="lg" asChild>
              <Link to="/login">Get Started for Free</Link>
            </Button>
          </div>
        </section>
        <SlideshowSection />
        <FeaturesSection />
      </main>
      <footer className="container mx-auto py-6 px-4 md:px-6 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} TankWiki. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
                <Button variant="link" size="sm" asChild><Link to="/terms">Terms of Service</Link></Button>
                <Button variant="link" size="sm" asChild><Link to="/privacy">Privacy Policy</Link></Button>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
