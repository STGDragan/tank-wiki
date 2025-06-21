
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SlideshowSection } from "@/components/landing/SlideshowSection";

const Index = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="absolute top-0 left-0 right-0 z-20 py-4">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <Logo />
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white rounded-xl">
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild className="shadow-lg hover:shadow-xl">
              <Link to="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative flex flex-col items-center justify-center text-center text-white overflow-hidden pt-20 pb-8">
          <div className="absolute inset-0 w-full h-full aquatic-gradient -z-10" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 mb-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-in">
              All Your Aquariums. One Smart Dashboard.
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8 animate-slide-up leading-relaxed">
              TankWiki helps hobbyists track water quality, manage gear, and build thriving aquariums with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <Button size="lg" asChild className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg font-semibold">
                <Link to="/login">Join the Beta</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={scrollToFeatures}
                className="text-white hover:bg-white/10 hover:text-white font-medium rounded-xl"
              >
                How It Works
              </Button>
            </div>
          </div>
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 relative z-10 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <div className="h-[350px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
              <SlideshowSection context="landing-page" autoplayDelay={3000} />
            </div>
          </div>
        </section>
        
        <div id="features-section">
          <FeaturesSection />
        </div>
      </main>
      <footer className="container mx-auto py-6 px-4 md:px-6 border-t border-slate-200/60">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 text-sm">&copy; {new Date().getFullYear()} TankWiki. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
                <Button variant="link" size="sm" asChild className="text-slate-600 hover:text-slate-800"><Link to="/legal/terms-of-service">Terms of Service</Link></Button>
                <Button variant="link" size="sm" asChild className="text-slate-600 hover:text-slate-800"><Link to="/legal/privacy-policy">Privacy Policy</Link></Button>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
