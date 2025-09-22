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
    setLoading(true);
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${location.origin}`,
      `${location.origin}`
    );

    const user = await account.get();

    if (user) {
      // User is already authenticated, just close the loading state
      setLoading(false);
      // The auth provider will handle setting the user via checkAuthStatus
    } else {
      setLoading(false);
      logout();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="">
          <LockIcon size={16} />
          <span className="text-sm">Sign In</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to save your result</DialogTitle>
          <DialogDescription>
            Login to save your result and access your saved results from any
            device.
          </DialogDescription>

          <div className="flex items-center space-x-2 h-[100px] bg-muted rounded-lg"></div>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={loginWithGoogle}
            disabled={loading}
          >
            <Icons.googleLogo className="w-6 h-6" />
            <span className="text-sm text-primary-foreground font-bold">
              Sign in with Google
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
