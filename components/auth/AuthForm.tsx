"use client";

import { ArrowRight, Eye, EyeOff, Key, Spade, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0],
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Registration successful! You can now sign in.");
      setTimeout(() => {
        setIsSignUp(false);
        setMessage("");
      }, 2000);
    } catch (error: unknown) {
      const err = error as Error;
      setMessage(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Login successful! Redirecting...");
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const err = error as Error;
      setMessage(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/0 via-background/50 to-background/0 blur-3xl" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mb-2 flex items-center justify-center gap-2 font-bold text-4xl text-white">
            Welcome to{" "}
            <span className="relative">
              <span className="relative z-10 inline-block">BKM Poker</span>
              <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 blur-sm" />
              <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-primary via-white to-primary" />
            </span>
            <Spade
              className="z-20 mt-3 ml-1 text-white transition-all duration-200 hover:stroke-primary-dark"
              size={24}
              strokeWidth={1.5}
            />
          </h2>
          <p className="text-gray-400 text-xl">
            {isSignUp
              ? "Create your account to get started"
              : "Sign in to your account"}
          </p>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={isSignUp ? handleSignUp : handleSignIn}
        >
          <div className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User
                  className="z-20 text-gray-400"
                  size={24}
                  strokeWidth={1.5}
                />
              </div>
              <input
                className="block w-full rounded-lg border border-gray-600 bg-gray-800/50 py-3 pr-3 pl-10 text-white backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                id="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                type="email"
                value={email}
              />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Key
                  className="z-20 text-gray-400"
                  size={24}
                  strokeWidth={1.5}
                />
              </div>
              <input
                className="block w-full rounded-lg border border-gray-600 bg-gray-800/50 py-3 pr-12 pl-10 text-white backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                id="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff className="z-20" size={20} strokeWidth={1.5} />
                ) : (
                  <Eye className="z-20" size={20} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-lg p-4 text-center text-sm backdrop-blur-sm transition-all duration-200 ${
                message.includes("successful")
                  ? "bg-green-500/20 text-green-200"
                  : "bg-red-500/20 text-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              className="group relative w-full overflow-hidden rounded-lg bg-primary/20 px-4 py-3 text-white transition-all duration-200 hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              disabled={loading}
              type="submit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                {!loading && <ArrowRight size={18} strokeWidth={1.5} />}
              </span>
            </button>

            <button
              className="text-gray-400 text-sm transition-colors duration-200 hover:text-white"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              type="button"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
