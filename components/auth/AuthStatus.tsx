"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthUser {
  email: string;
}

export default function AuthStatus() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await authClient.getSession();
        setUser(data?.user ? { email: data.user.email } : null);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/auth");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <div className="text-white">
            Signed in as: <span className="font-bold">{user.email}</span>
          </div>
          <button
            className="rounded-md bg-red-500/20 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-red-500/30"
            onClick={handleSignOut}
            type="button"
          >
            Sign Out
          </button>
        </>
      ) : (
        <div className="text-white">Not signed in</div>
      )}
    </div>
  );
}
