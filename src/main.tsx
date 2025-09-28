import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import { AppRoutes } from "./routes";
import Header from "@/components/Header";
import { ChatDock } from "@/shared/ChatDock";
import { Button } from "@/components/ui/button";
import "./index.css";
import "./styles/tokens.css";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <nav className="bg-card border-b p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex gap-4">
              <a href="/" className="text-foreground hover:text-primary">Dashboard</a>
              <a href="/squads" className="text-foreground hover:text-primary">Squads</a>
              <a href="/achievements" className="text-foreground hover:text-primary">Achievements</a>
              <a href="/learn" className="text-foreground hover:text-primary">Learn</a>
              <a href="/events" className="text-foreground hover:text-primary">Events</a>
              <a href="/payments" className="text-foreground hover:text-primary">Payments</a>
            </div>
            <Button onClick={() => setIsChatOpen(true)}>
              Open Mentor
            </Button>
          </div>
        </nav>
        <AppRoutes />
        <ChatDock isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
