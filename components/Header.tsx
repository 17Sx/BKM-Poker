"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Button from "./ui/button";
import Nav from "./ui/Nav";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await authClient.getSession();
      setIsLoggedIn(!!data?.user);
      setUserEmail(data?.user?.email || null);
    };

    checkUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setIsLoggedIn(false);
    setUserEmail(null);
    router.push("/auth");
    router.refresh();
  };

  return (
    <header className="fixed top-5 right-0 left-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            className="font-bold text-white text-xl opacity-80 transition-all duration-200 hover:opacity-10"
            href="/"
          >
            BKM
          </Link>

          <div
            className={`absolute left-1/2 -translate-x-1/2 transform transition-all duration-300 ${isScrolled ? "scale-90" : "scale-100"}`}
          >
            <Nav
              items={[
                {
                  label: "Home",
                  href: "/",
                },
                {
                  label: "Dashboard",
                  href: "/dashboard",
                },
                {
                  label: "History",
                  href: "/history",
                },
                {
                  label: "About",
                  href: "/aboutus",
                },
              ]}
            />
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">{userEmail}</span>
                <Button
                  className="max-h-8"
                  onClick={handleSignOut}
                  variant="secondary"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button className="max-h-8" variant="secondary">
                    Login
                  </Button>
                </Link>
                <Link href="/auth?signup=true">
                  <Button className="max-h-8" variant="outline">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
