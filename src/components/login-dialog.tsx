"use client";
import { LockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { account } from "@/lib/appwrite";
import { OAuthProvider } from "appwrite";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Icons } from "./icons";

export function LoginDialog() {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const loginWithGoogle = async () => {
    try {
      console.log("[LoginDialog] Starting Google OAuth...");
      setLoading(true);
      // Redirect to Google OAuth (will return to origin after success)
      await account.createOAuth2Session(OAuthProvider.Google, `${location.origin}`, `${location.origin}`);
      console.log("[LoginDialog] OAuth redirect initiated");
    } catch (error) {
      console.error("[LoginDialog] OAuth error:", error);
      setLoading(false);
      logout();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="h-8 py-0 rounded-sm">
          <LockIcon size={16} />
          <span className="text-sm">Sign In</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to save your result</DialogTitle>
          <DialogDescription>
            Login to save your result and access your saved results from any device.
          </DialogDescription>

          <div className="flex items-center space-x-2 h-[100px] bg-muted rounded-lg"></div>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Button variant="default" size="sm" className="w-full" onClick={loginWithGoogle} disabled={loading}>
            <Icons.googleLogo className="w-6 h-6" />
            <span className="text-sm text-primary-foreground font-bold">Sign in with Google</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
