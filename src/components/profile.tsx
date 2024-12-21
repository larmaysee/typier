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
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setUser(null);
    }
  };

  return (
    <>
      {user != null ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="h-9">
              <User size={16} />
              <span>{user.name}</span>
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
