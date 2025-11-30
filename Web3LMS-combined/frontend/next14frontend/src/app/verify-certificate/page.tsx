"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function CertificateVerificationLandingPage() {
  const [certificateId, setCertificateId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateId.trim()) {
      router.push(`/verify-certificate/${certificateId.trim()}`);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <main className="flex-grow container mx-auto px-4 py-16 md:py-24 max-w-5xl relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-secondary text-secondary px-4 py-1">Blockchain Verification</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Verify <span className="text-secondary">Certificate</span> Authenticity
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Ensure the legitimacy of credentials issued on our platform. All certificates are minted as NFTs on the blockchain for immutable proof of achievement.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-border shadow-2xl hover:shadow-secondary/5 transition-all duration-500 max-w-3xl mx-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-50" />

            <CardHeader className="p-8 pb-2 text-center">
              <div className="mx-auto bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Enter Certificate ID</CardTitle>
              <CardDescription className="text-base">
                Locate the unique ID at the bottom of the certificate
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                    <Input
                      type="text"
                      placeholder="e.g., CERT-8X92-M4K1"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      className="pl-12 h-14 text-lg bg-background/50 border-input focus:border-secondary focus:ring-secondary/20 transition-all"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!certificateId.trim()}
                    className="h-14 px-8 bg-secondary hover:bg-secondary/90 text-white text-lg font-medium transition-all duration-300 shadow-lg shadow-secondary/20 hover:shadow-secondary/40"
                  >
                    Verify Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Information Panel */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: CheckCircle,
              color: "text-green-500",
              bg: "bg-green-500/10",
              title: "Instant Verification",
              desc: "Real-time check against the blockchain ledger to confirm validity."
            },
            {
              icon: ShieldCheck,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              title: "Tamper-Proof",
              desc: "Certificates are immutable NFTs that cannot be forged or altered."
            },
            {
              icon: HelpCircle,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
              title: "Global Recognition",
              desc: "Verifiable proof of skills recognized by top Web3 organizations."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-card/30 backdrop-blur-sm border border-border p-6 rounded-2xl hover:bg-card/50 transition-colors">
              <div className={`${item.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Having trouble? <a href="/contact-us" className="text-secondary hover:underline">Contact Support</a>
          </p>
        </div>
      </main>
    </div>
  );
} 