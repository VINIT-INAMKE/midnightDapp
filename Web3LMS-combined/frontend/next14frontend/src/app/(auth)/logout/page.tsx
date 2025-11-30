"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { logout } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const REDIRECT_DELAY = 5; // seconds

const Logout = () => {
  const router = useRouter();
  const progressControls = useAnimation();

  useEffect(() => {
    logout();

    progressControls.start({
      width: "100%",
      transition: { duration: REDIRECT_DELAY, ease: "linear" },
    });

    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, REDIRECT_DELAY * 1000);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [router, progressControls]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-border"
      >
        {/* Gradient Header */}
        <div className="h-2 bg-secondary" />

        <div className="p-8">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={progressControls}
              className="h-full bg-secondary rounded-full"
            />
          </div>

          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-secondary/10 mb-8"
          >
            <LogOut className="h-10 w-10 text-secondary" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Logged Out Successfully
            </h2>
            <p className="text-muted-foreground mb-6">
              You&apos;ve been securely logged out. Redirecting in {REDIRECT_DELAY} seconds...
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/login")}
              className="w-full py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg transition-all shadow-sm"
            >
              Return to Login Now
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <a href="/contact-us" className="text-secondary hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Logout;
