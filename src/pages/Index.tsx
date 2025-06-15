
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
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
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 w-full h-full -z-20">
            <SlideshowSection />
          </div>
          <div className="absolute inset-0 w-full h-full bg-primary/30 -z-10" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              The ultimate hub for your aquarium.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Track water parameters, manage livestock, schedule maintenance, and collaborate with others. All in one beautiful, modern platform.
            </p>
            <Button size="lg" asChild>
              <Link to="/login">Get Started for Free</Link>
            </Button>
          </div>
        </section>
        
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
