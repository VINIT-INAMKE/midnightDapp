"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, Target, Users, Globe, Award, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutUs() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To democratize Web3 education and empower the next generation of blockchain developers and innovators.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Building a borderless network of learners, instructors, and industry leaders fostering collaboration.",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Setting the highest standards for curriculum quality, ensuring our students are job-ready.",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Constantly evolving our platform to stay ahead of the rapidly changing blockchain landscape.",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow container mx-auto px-4 py-16 md:py-24 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className="mb-4 border-secondary text-secondary px-4 py-1">About Web3LMS</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Empowering the <span className="text-secondary">Decentralized</span> Future
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            We are a cutting-edge educational platform dedicated to blockchain and Web3 technology.
            Bridging the gap between curiosity and expertise, we provide the tools you need to build the future.
          </p>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24"
        >
          {values.map((value, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-xl border-border hover:border-secondary/50 transition-all duration-300 group">
              <CardContent className="p-8 flex items-start gap-6">
                <div className={`${value.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`h-8 w-8 ${value.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card border border-border rounded-3xl p-12 mb-24 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 text-center">
            {[
              { label: "Active Learners", value: "10k+" },
              { label: "Expert Instructors", value: "50+" },
              { label: "Courses", value: "100+" },
              { label: "Certificates Issued", value: "5k+" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Start Your Journey?</h2>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white px-8 h-12 text-lg shadow-lg shadow-secondary/20">
                Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact-us">
              <Button size="lg" variant="outline" className="px-8 h-12 text-lg hover:bg-secondary/10 hover:text-secondary hover:border-secondary">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 