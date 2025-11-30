"use client";

import { useState } from "react";
import { login } from "@/utils/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LockClosedIcon, ArrowPathIcon, FingerPrintIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
import Cookie from "js-cookie";

interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  full_name: string;
  email: string;
  username: string;
  teacher_id: number;
}

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await login(email, password);
      if (error) {
        setError(error);
      } else {
        // Get the access token to check the teacher_id
        const access_token = Cookie.get("access_token");
        if (access_token) {
          try {
            const decoded = jwtDecode<DecodedToken>(access_token);
            // Redirect based on teacher_id
            if (decoded.teacher_id > 0) {
              router.push("/instructor/dashboard/");
            } else {
              router.push("/student/dashboard/");
            }
          } catch (err) {
            console.error("Error decoding token:", err);
            router.push("/");
          }
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
          <div className="p-8 space-y-6">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-3"
            >
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-secondary/10">
                <FingerPrintIcon className="h-6 w-6 text-secondary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Decentralized Identity Portal
              </h1>
              <p className="text-muted-foreground">
                Securely access your blockchain learning resources
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-input rounded-lg bg-background 
                            placeholder-muted-foreground focus:ring-2 focus:ring-secondary focus:border-transparent text-foreground"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-input rounded-lg bg-background 
                            placeholder-muted-foreground focus:ring-2 focus:ring-secondary focus:border-transparent text-foreground"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg shadow-md transition-all
                          ${isLoading
                      ? 'bg-muted cursor-not-allowed text-muted-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                    }`}
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="font-medium flex items-center gap-2">
                      <LockClosedIcon className="h-5 w-5" />
                      Authenticate with DID
                    </span>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Forgot Password Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <Link
                href="/forgotpassword"
                className="text-sm text-secondary hover:text-secondary/80 transition-colors"
              >
                Forgot your decentralized identity?
              </Link>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-card text-sm text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </motion.div>

            {/* Social Login */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <button
                className="w-full flex items-center justify-center gap-3 bg-card border border-border 
                        text-foreground rounded-lg p-3 hover:bg-muted/50 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                    fill="currentColor"
                  />
                </svg>
                <span>Google</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Registration Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <span className="opacity-80">New to decentralized learning? </span>
          <Link
            href="/register"
            className="font-medium text-secondary hover:underline"
          >
            Create an identity
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;