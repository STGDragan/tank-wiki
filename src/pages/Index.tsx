
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SlideshowSection } from "@/components/landing/SlideshowSection";
import { SupportSection } from "@/components/landing/SupportSection";
import SocialMediaFooter from "@/components/layout/SocialMediaFooter";
import MobileInstructions from "@/components/layout/MobileInstructions";
import { SponsorshipBanner } from "@/components/sponsorship/SponsorshipBanner";

const Index = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="absolute top-0 left-0 right-0 z-20 py-4">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="glass-panel rounded-lg px-3 py-2 neon-border">
            <Logo />
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild className="glass-panel neon-border">
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="cta" asChild className="animate-cyber-pulse">
              <Link to="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative flex flex-col items-center justify-center text-center overflow-hidden pt-20 pb-8 min-h-screen">
          <div className="absolute inset-0 w-full h-full dark-gradient -z-10" />
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden -z-5">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-cyan rounded-full animate-cyber-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-neon-green rounded-full animate-neon-flicker"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-cyber-pulse"></div>
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 mb-8">
            <h1 className="text-4xl md:text-7xl font-display font-black tracking-tight mb-6 animate-slide-in neon-text">
              AQUATIC COMMAND CENTER
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-slide-in font-sans leading-relaxed" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              Advanced tank monitoring and management system for the modern aquarist. Monitor, analyze, and optimize your aquatic ecosystems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <Button variant="cta" size="lg" asChild className="animate-cyber-pulse">
                <Link to="/login">Initialize System</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={scrollToFeatures}
                className="glass-panel"
              >
                System Overview
              </Button>
            </div>
          </div>
          
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 relative z-10 animate-slide-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
            <div className="h-[350px] md:h-[500px] glass-panel neon-border overflow-hidden shadow-cyber-lg">
              <SlideshowSection context="landing-page" autoplayDelay={3000} />
            </div>
          </div>
        </section>
        
        <div id="features-section">
          <FeaturesSection />
        </div>
        
        <SupportSection />
      </main>
      
      <footer className="border-t border-border/30">
        <SponsorshipBanner page="landing" maxDisplay={1} />
        <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground text-sm font-mono">&copy; {new Date().getFullYear()} TankWiki. All systems operational.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                  <Button variant="link" size="sm" asChild><Link to="/legal/terms-of-service">Terms of Service</Link></Button>
                  <Button variant="link" size="sm" asChild><Link to="/legal/privacy-policy">Privacy Policy</Link></Button>
              </div>
          </div>
          
          <SocialMediaFooter />
          
          <MobileInstructions />
        </div>
      </footer>
    </div>
  );
};

export default Index;
