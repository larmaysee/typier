"use client";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginDialog } from "./login-dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "./auth-provider";
export default function Profile() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      const user = await account.get();
      setUser(user);
    } catch (error) {
      // Silently handle authentication errors - user is not logged in
      console.log('User not authenticated:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {user != null ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={user != null ? "default" : "outline"} size="sm" className="h-9">
              <User size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-muted-foreground text-sm font-normal">
              Setting
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                account.deleteSession("current");
                setUser(null);
                logout();
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        !loading && <LoginDialog />
      )}
    </>
  );
}
