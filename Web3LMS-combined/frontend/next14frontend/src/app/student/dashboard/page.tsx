"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Award,
  Search,
  Clock,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import StudentHeader from "@/components/student/Header";
import StudentSidebar from "@/components/student/Sidebar";

interface Course {
  enrollment_id: string;
  course: {
    title: string;
    image: string;
    language: string;
    level: string;
  };
  date: string;
  lectures: {
    id: string;
    title: string;
  }[];
  completed_lesson: {
    id: string;
    lesson_id: string;
  }[];
}

interface Stats {
  total_courses: number;
  completed_lessons: number;
  achieved_certificates: number;
}

interface UserProfile {
  user_id: number;
  full_name: string;
  email: string;
  username: string;
  image?: string;
}

function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_courses: 0,
    completed_lessons: 0,
    achieved_certificates: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<UserProfile | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const user = UserData() as UserProfile;
      setUserData(user);
      const [statsRes, coursesRes] = await Promise.all([
        useAxios.get(`student/summary/${user?.user_id}/`),
        useAxios.get(`student/course-list/${user?.user_id}/`),
      ]);
      setStats(statsRes.data[0]);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <StudentHeader />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-6">
          <div className="lg:col-span-1 lg:sticky lg:top-4 lg:self-start">
            <StudentSidebar />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              {/* Welcome Banner */}
              <motion.div variants={itemVariants}>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-lg">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-slate-200">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-medium">Welcome back, {userData?.full_name || 'Student'}!</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Ready to learn something new?</h1>
                    <p className="text-slate-300 max-w-xl">
                      Pick up where you left off or explore new courses to enhance your skills.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <Card className="border-none shadow-md bg-white hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +2 this week
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total_courses}</h3>
                    </div>
                  </CardContent>
                </Card>



                <Card className="border-none shadow-md bg-white hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                        <Award className="h-6 w-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                        Certified
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Certificates Earned</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.achieved_certificates}</h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Courses Section */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                    <p className="text-sm text-gray-500 mt-1">Continue your learning journey</p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search your courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-[320px] rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : filteredCourses.length > 0 ? (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    <AnimatePresence>
                      {filteredCourses.map((course) => {
                        const progress = (course.completed_lesson.length / course.lectures.length) * 100;

                        return (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={course.enrollment_id}
                            className="group"
                          >
                            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white rounded-2xl flex flex-col">
                              <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                  src={course.course.image}
                                  alt={course.course.title}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow-sm">
                                  {course.course.level}
                                </div>
                              </div>

                              <CardContent className="p-5 flex-grow flex flex-col">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                                    {course.course.language}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {course.lectures.length} lessons
                                  </span>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                  {course.course.title}
                                </h3>

                                <div className="mt-auto pt-4 space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-gray-600">
                                      <span>Progress</span>
                                      <span>{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2 bg-gray-100" />
                                  </div>

                                  <Button
                                    className="w-full bg-gray-900 hover:bg-indigo-600 text-white transition-colors rounded-xl"
                                    asChild
                                  >
                                    <Link href={`/student/course/${course.enrollment_id}/`}>
                                      {progress > 0 ? "Continue Learning" : "Start Course"}
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200"
                  >
                    <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                    <p className="text-gray-500 mt-1">Try searching for something else or browse new courses.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;

