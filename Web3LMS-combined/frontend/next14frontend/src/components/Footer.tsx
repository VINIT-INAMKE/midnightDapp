"use client";

import Link from "next/link";
import { Github, Linkedin, Twitter, Mail, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

function BaseFooter() {
  return (
    <footer className="bg-card text-card-foreground border-t border-border relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-50" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="bg-secondary text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg">W</span>
                WEB3LMS
              </h2>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Empowering the next generation of blockchain developers through decentralized learning and verifiable credentials.
            </p>

            <div className="pt-4">
              <h4 className="font-semibold mb-3 text-foreground">Subscribe to our newsletter</h4>
              <div className="flex gap-2 max-w-sm">
                <Input
                  placeholder="Enter your email"
                  className="bg-background border-input focus:border-secondary transition-colors"
                />
                <Button size="icon" className="bg-secondary hover:bg-secondary/90 text-white shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Learn */}
            <div>
              <h3 className="font-bold text-foreground mb-6">Learn</h3>
              <ul className="space-y-4">
                {["Blockchain Basics", "Smart Contracts", "DeFi Development", "NFT Creation", "Web3 Security"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-bold text-foreground mb-6">Community</h3>
              <ul className="space-y-4">
                {["Developer DAO", "Become an Instructor", "Student Projects", "Governance", "Events"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-foreground mb-6">Resources</h3>
              <ul className="space-y-4">
                {["Whitepaper", "Token Economics", "API Documentation", "Help Center", "Careers"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-foreground mb-6">Legal</h3>
              <ul className="space-y-4">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "Smart Contract Terms"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} WEB3LMS DAO. Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>by the community.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="https://twitter.com" target="_blank" className="hover:text-secondary transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="https://github.com/VINIT-INAMKE" target="_blank" className="hover:text-secondary transition-colors">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="https://linkedin.com/in/vinit-inamke/" target="_blank" className="hover:text-secondary transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="mailto:vinitinamkekse@gmail.com" className="hover:text-secondary transition-colors">
              <Mail className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default BaseFooter;
