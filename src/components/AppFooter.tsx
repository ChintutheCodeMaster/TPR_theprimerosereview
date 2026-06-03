import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const AppFooter = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background px-6 py-4">
      <div className="max-w-screen-xl mx-auto space-y-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link to="/cookie-policy" className="hover:text-foreground transition-colors">
            Cookie Policy
          </Link>
          <Link to="/contact-us" className="hover:text-foreground transition-colors">
            Contact Us
          </Link>
          <Link to="/contact-support" className="hover:text-foreground transition-colors">
            Contact Support
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 The Primrose Review. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
