"use client";

import { useAuthStore } from "@/store/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import apiInstance from "@/utils/axios";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Globe,
  Rocket,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Code2,
  Cpu,
  Layers,
  Heart,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import trumpMeme from "@/assets/trump-meme.png";

interface Course {
  id: number;
  category: {
    id: number;
    title: string;
    image: string;
    active: boolean;
    slug: string;
  };
  teacher: {
    id: number;
    image: string;
    full_name: string;
    bio: string | null;
    facebook: string | null;
    twitter: string | null;
    linkedin: string | null;
    about: string;
    country: string | null;
    user: {
      id: number;
      password: string;
      last_login: string;
      is_superuser: boolean;
      first_name: string;
      last_name: string;
      is_staff: boolean;
      is_active: boolean;
      date_joined: string;
      username: string;
      email: string;
      full_name: string;
      otp: string | null;
      refresh_token: string | null;
    };
  };
  file: string | null;
  image: string | null;
  title: string;
  description: string;
  price: string;
  language: string;
  level: string;
  platform_status: string;
  teacher_course_status: string;
  featured: boolean;
  course_id: string;
  slug: string;
  date: string;
  students: {
    id: number;
  }[];
  average_rating: number | null;
  rating_count: number;
  reviews: {
    id: number;
  }[];
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const handleCourseClick = (slug: string) => {
    if (isLoggedIn()) {
      router.push(`/course-details/${slug}`);
    } else {
      router.push('/unauthorized');
    }
  };

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const res = await apiInstance.get(`/course/course-list/`);
      console.log("Courses fetched successfully:", res.data);
      const featuredCourses = res.data.filter((course: Course) => course.featured);
      setCourses(featuredCourses);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />
          <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary mb-6"
              >
                <Zap className="h-4 w-4 fill-secondary" />
                <span className="text-sm font-semibold">The Future of Web3 Education</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-foreground">
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-600">Blockchain</span> <br />
                Build the Future
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Join the premier decentralized learning platform. Earn verifiable on-chain credentials while mastering Smart Contracts, DeFi, and Zero-Knowledge Proofs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 px-8 text-lg rounded-full shadow-lg shadow-secondary/20 transition-all hover:scale-105"
                  onClick={() => router.push("/courses")}
                >
                  Start Learning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50 transition-all hover:scale-105"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </div>

              <div className="mt-12 flex items-center gap-8 text-muted-foreground">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted relative overflow-hidden">
                      <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" fill className="object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Rater total={5} rating={5} interactive={false} />
                  </div>
                  <p className="text-sm font-medium"><span className="text-foreground font-bold">150k+</span> Students Enrolled</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{ y: y1 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 bg-card border border-border rounded-2xl p-6 shadow-2xl shadow-secondary/10 rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="absolute -top-12 -right-12 bg-secondary text-secondary-foreground p-4 rounded-xl shadow-lg animate-bounce">
                  <Code2 className="h-8 w-8" />
                </div>
                <Image
                  src={trumpMeme}
                  alt="Web3 Learning"
                  width={600}
                  height={400}
                  className="rounded-xl object-cover"
                />
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Cpu className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Haskell Masterclass</h3>
                        <p className="text-sm text-muted-foreground">Advanced Smart Contracts</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">In Progress</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full w-[75%]" />
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                style={{ y: y2 }}
                className="absolute -bottom-10 -left-10 bg-card p-4 rounded-xl shadow-xl border border-border max-w-xs"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-bold text-foreground">Verified Certificate</h4>
                    <p className="text-xs text-muted-foreground">Minted on Cardano</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Students", value: "150K+", icon: Users },
              { label: "Expert Mentors", value: "200+", icon: GraduationCap },
              { label: "Courses", value: "500+", icon: BookOpen },
              { label: "Countries", value: "120+", icon: Globe },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <stat.icon className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Bento Grid */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-secondary text-secondary">Why Us</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Why Choose Decentralized Learning?</h2>
          <p className="text-xl text-muted-foreground">Experience the next evolution of education with blockchain-verified credentials and community-driven curriculum.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 max-w-7xl mx-auto h-auto md:h-[600px]">
          {/* Large Feature - Immutable Certificates */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-2 md:row-span-2 bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl transition-all relative overflow-hidden group flex flex-col"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-secondary/20" />
            <div className="relative z-10 flex-1">
              <div className="bg-secondary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Immutable On-Chain Certificates</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                Your achievements are minted as NFTs on the blockchain. Verifiable, permanent, and owned by you. Share your credentials with confidence.
              </p>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-border/50 group-hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?q=80&w=2957&auto=format&fit=crop"
                  alt="NFT Certificate"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Verified on Cardano</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tall Feature - Career Launchpad */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-primary to-primary/90 rounded-3xl p-8 border border-primary/20 shadow-sm hover:shadow-xl transition-all text-primary-foreground relative overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Career Launchpad</h3>
              <p className="text-white/80 mb-8">
                Direct integration with top Web3 hiring partners.
              </p>
              <div className="space-y-3 flex-1">
                {["DeFi Protocols", "NFT Marketplaces", "L1/L2 Chains", "Audit Firms", "DAO Core Units"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                    <span className="font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full mt-6 bg-white text-primary hover:bg-white/90">
                View Partners
              </Button>
            </div>
          </motion.div>

          {/* Small Feature 1 - DAO Governance */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-1 bg-card rounded-3xl p-6 border border-border shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="bg-blue-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">DAO Governance</h3>
              <p className="text-sm text-muted-foreground">
                Vote on new courses and curriculum updates.
              </p>
            </div>
            <div className="mt-4 flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">+2k</div>
            </div>
          </motion.div>

          {/* Small Feature 2 - Global Community */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-1 bg-card rounded-3xl p-6 border border-border shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="bg-purple-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Global Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with developers from 120+ countries.
              </p>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[75%]" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">150k+ Active Learners</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/20 text-primary">Curriculum</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Explore Top Categories</h2>
              <p className="text-muted-foreground max-w-xl">
                Dive into specialized tracks designed by industry experts. From smart contract security to DeFi architecture.
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex gap-2 hover:bg-secondary hover:text-white hover:border-secondary transition-all">
              View All Categories <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Smart Contracts', icon: Code2, count: "24 Courses", color: "text-blue-500", bg: "bg-blue-500/10", border: "hover:border-blue-500/50" },
              { name: 'DeFi Development', icon: Layers, count: "18 Courses", color: "text-green-500", bg: "bg-green-500/10", border: "hover:border-green-500/50" },
              { name: 'NFTs & Metaverse', icon: Rocket, count: "12 Courses", color: "text-purple-500", bg: "bg-purple-500/10", border: "hover:border-purple-500/50" },
              { name: 'Blockchain Security', icon: ShieldCheck, count: "15 Courses", color: "text-red-500", bg: "bg-red-500/10", border: "hover:border-red-500/50" },
            ].map((category, idx) => (
              <motion.div
                key={category.name}
                whileHover={{ y: -8 }}
                className={`bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden ${category.border}`}
                onClick={() => router.push(`/courses?category=${category.name.toLowerCase()}`)}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${category.bg} rounded-bl-full opacity-50 transition-transform group-hover:scale-150`} />

                <div className={`${category.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <category.icon className={`h-7 w-7 ${category.color}`} />
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground font-medium">{category.count}</p>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="h-4 w-4 text-foreground" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="w-full gap-2">
              View All Categories <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses Carousel */}
      <section className="py-24 container mx-auto px-4 relative">
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="flex flex-col items-center text-center mb-16 relative z-10">
          <Badge variant="outline" className="mb-4 border-secondary text-secondary px-4 py-1">Top Rated</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Featured Courses</h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Hand-picked courses from our top instructors to help you master the most in-demand skills.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="relative z-10">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {courses.map((course) => (
                  <CarouselItem key={course.course_id} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                      <Card className="h-full flex flex-col overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-300 group ring-1 ring-border hover:ring-secondary/50">
                        {/* Image Container */}
                        <div
                          className="relative aspect-[16/10] cursor-pointer overflow-hidden"
                          onClick={() => handleCourseClick(course.slug)}
                        >
                          <Image
                            src={course.image || "/placeholder-course.jpg"}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                          {/* Overlay Content */}
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                            <Badge className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-0">
                              {course.level}
                            </Badge>
                            <div className="bg-white/20 backdrop-blur-md rounded-full p-2 hover:bg-white/30 transition-colors">
                              <Heart className="h-4 w-4 text-white" />
                            </div>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4">
                            <Badge variant="secondary" className="bg-secondary text-white border-0 mb-2">
                              {course.category.title}
                            </Badge>
                          </div>

                          {/* Hover Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 pointer-events-auto shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              View Course
                            </Button>
                          </div>
                        </div>

                        <CardHeader className="p-6 pb-3">
                          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold mb-2">
                            <Zap className="h-4 w-4 fill-yellow-500" />
                            {course.average_rating || 4.8} <span className="text-muted-foreground font-normal ml-1">({course.students.length * 12} reviews)</span>
                          </div>
                          <CardTitle
                            className="text-xl font-bold line-clamp-2 hover:text-secondary transition-colors cursor-pointer text-foreground leading-tight"
                            onClick={() => handleCourseClick(course.slug)}
                          >
                            {course.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 pt-0 flex-1">
                          <div className="flex items-center gap-3 mb-6 mt-4">
                            <Avatar className="h-10 w-10 ring-2 ring-border">
                              <AvatarImage src={course.teacher.image} />
                              <AvatarFallback>{course.teacher.full_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-foreground">{course.teacher.full_name}</p>
                              <p className="text-xs text-muted-foreground">Senior Instructor</p>
                            </div>
                          </div>

                          <Separator className="bg-border/50 mb-4" />

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-secondary" />
                              {course.students.length} students
                            </div>
                            <div className="flex items-center gap-1.5">
                              <PlayCircle className="h-4 w-4 text-secondary" />
                              12 Lessons
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="p-6 pt-0 mt-auto">
                          <div className="flex items-center justify-between w-full bg-muted/30 p-3 rounded-xl border border-border/50 group-hover:border-secondary/30 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground line-through">₹{(parseFloat(course.price) * 1.5).toFixed(2)}</span>
                              <span className="text-xl font-bold text-foreground">₹{course.price}</span>
                            </div>
                            <Button size="sm" className="bg-foreground text-background hover:bg-secondary hover:text-white transition-colors rounded-lg" onClick={() => handleCourseClick(course.slug)}>
                              Enroll Now
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 border-border bg-card hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-lg" />
              <CarouselNext className="hidden md:flex -right-12 h-12 w-12 border-border bg-card hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-lg" />
            </Carousel>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4 mb-12">
        <div className="relative rounded-[2.5rem] p-8 md:p-20 overflow-hidden text-center bg-primary">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/20" />
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-secondary/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/20 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <Badge className="mb-6 bg-secondary text-white hover:bg-secondary/90 px-4 py-1 text-base">
              Start Learning Today
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              Ready to Launch Your <span className="text-secondary">Web3 Career?</span>
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join a community of 50,000+ developers building the future of the decentralized web. Get unlimited access to all courses, projects, and certifications.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white h-16 px-10 text-lg rounded-full shadow-xl shadow-secondary/20 hover:scale-105 transition-all duration-300">
                Get Started for Free
              </Button>
              <Button size="lg" variant="outline" className="bg-white/5 backdrop-blur-sm text-white border-white/20 hover:bg-white/10 h-16 px-10 text-lg rounded-full hover:scale-105 transition-all duration-300">
                View Pricing Plans
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-white/60 text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span>7-Day Free Trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}