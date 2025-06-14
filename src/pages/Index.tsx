
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
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
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            The ultimate hub for your aquarium.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track water parameters, manage livestock, schedule maintenance, and collaborate with others. All in one beautiful, modern platform.
          </p>
          <Button size="lg" asChild>
            <Link to="/login">Get Started for Free</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
