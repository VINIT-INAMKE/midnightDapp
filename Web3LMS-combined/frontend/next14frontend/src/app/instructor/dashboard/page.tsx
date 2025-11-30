"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  IndianRupee,
  Search,
  Edit,
  Trash,
  BookOpen,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Plus,
  MoreVertical,
  Eye
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";

interface Stats {
  total_courses: number;
  total_students: number;
  total_revenue: number;
}

interface Student {
  id: string;
  name: string;
}

interface Course {
  id: string;
  course_id: string;
  slug?: string;
  title: string;
  image: string;
  language: string;
  level: string;
  price: number;
  students: Student[];
  date: string;
  platform_status: "Review" | "Reject" | "Disabled" | "Draft" | "Published";
  teacher_course_status: "Disabled" | "Draft" | "Published";
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total_courses: 0,
    total_students: 0,
    total_revenue: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState<{ full_name?: string } | null>(null);

  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const user = UserData();
    setUserData(user);
  }, []);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const teacherId = UserData()?.teacher_id;
      if (teacherId) {
        const [statsRes, coursesRes] = await Promise.all([
          useAxios.get(`teacher/summary/${teacherId}/`),
          useAxios.get(`teacher/course-lists/${teacherId}/`),
        ]);
        setStats(statsRes.data[0]);
        setCourses(coursesRes.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (course: Course) => {
    setDeletingCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCourse) return;

    setIsDeleting(true);
    try {
      await useAxios.delete(`course/course-detail/${deletingCourse.slug}/`);

      setCourses(
        courses.filter(
          (course) => course.course_id !== deletingCourse.course_id
        )
      );

      Toast().fire({
        title: `Course "${deletingCourse.title}" deleted successfully`,
        icon: "success",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      Toast().fire({
        title: "Failed to delete course",
        icon: "error",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingCourse(null);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      fetchCourseData();
    } else {
      const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(query)
      );
      setCourses(filtered);
    }
  };

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
        <InstructorHeader />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mt-6">
          <div className="lg:col-span-1 lg:sticky lg:top-4 lg:self-start">
            <InstructorSidebar />
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
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-violet-900 p-8 text-white shadow-lg">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-indigo-200">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-medium">Instructor Dashboard</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {userData?.full_name || 'Instructor'}!</h1>
                    <p className="text-indigo-100 max-w-xl">
                      Manage your courses, track your revenue, and engage with your students all in one place.
                    </p>
                    <div className="mt-6">
                      <Button asChild className="bg-white text-indigo-900 hover:bg-indigo-50 border-none shadow-md">
                        <Link href="/instructor/create-course/">
                          <Plus className="h-4 w-4 mr-2" /> Create New Course
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              >
                <Card className="border-none shadow-md bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen className="h-24 w-24 text-indigo-600 transform rotate-12 translate-x-8 -translate-y-8" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                        <LayoutDashboard className="h-6 w-6 text-indigo-600" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Active
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Courses</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.total_courses}</h3>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <GraduationCap className="h-24 w-24 text-violet-600 transform rotate-12 translate-x-8 -translate-y-8" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                        <GraduationCap className="h-6 w-6 text-violet-600" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                        Enrolled
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Students</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.total_students}</h3>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IndianRupee className="h-24 w-24 text-emerald-600 transform rotate-12 translate-x-8 -translate-y-8" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                        <IndianRupee className="h-6 w-6 text-emerald-600" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        Earnings
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{stats.total_revenue?.toLocaleString('en-IN') || '0'}</h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Courses Table */}
              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-md bg-white overflow-hidden rounded-2xl">
                  <CardHeader className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          My Courses
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Manage and track your course performance
                        </p>
                      </div>
                      <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Search courses..."
                          value={searchQuery}
                          onChange={handleSearch}
                          className="pl-10 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4" />
                        <p className="text-gray-500">Loading your courses...</p>
                      </div>
                    ) : courses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                              <th className="px-6 py-4 text-left tracking-wider">Course</th>
                              <th className="px-6 py-4 text-left tracking-wider">Enrolled</th>
                              <th className="px-6 py-4 text-left tracking-wider">Status</th>
                              <th className="px-6 py-4 text-left tracking-wider">Date</th>
                              <th className="px-6 py-4 text-right tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {courses.map((course, index) => (
                              <motion.tr
                                key={course.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group hover:bg-gray-50/50 transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 shadow-sm relative">
                                      <Image
                                        src={course.image}
                                        alt={course.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 line-clamp-1">
                                        {course.title}
                                      </div>
                                      <div className="flex flex-wrap gap-2 mt-1.5">
                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-gray-100 text-gray-600 hover:bg-gray-200">
                                          {course.level}
                                        </Badge>
                                        <span className="text-xs text-gray-500 flex items-center">
                                          ₹{course.price}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2 overflow-hidden">
                                      {course.students?.slice(0, 3).map((_, i) => (
                                        <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                          {String(course.students[i]?.name || 'S').charAt(0)}
                                        </div>
                                      ))}
                                      {(course.students?.length || 0) > 3 && (
                                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                          +{course.students.length - 3}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                      {course.students?.length || 0}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1.5">
                                    <Badge
                                      variant="outline"
                                      className={`w-fit ${course.platform_status === "Published"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : course.platform_status === "Review"
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}
                                    >
                                      {course.platform_status || "Unknown"}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {format(new Date(course.date), "MMM dd, yyyy")}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem asChild>
                                        <Link href={`/course-details/${course.slug}`} className="flex items-center cursor-pointer">
                                          <Eye className="h-4 w-4 mr-2" /> View
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/instructor/edit-course/${course.course_id}/`} className="flex items-center cursor-pointer">
                                          <Edit className="h-4 w-4 mr-2" /> Edit
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 cursor-pointer"
                                        onClick={() => handleDeleteClick(course)}
                                      >
                                        <Trash className="h-4 w-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-16 px-4">
                        <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <BookOpen className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          No courses found
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                          You haven&apos;t created any courses yet. Start sharing your knowledge today!
                        </p>
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                          <Link href="/instructor/create-course/">
                            <Plus className="h-4 w-4 mr-2" /> Create First Course
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white border-none shadow-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-xl font-bold">
              <AlertTriangle className="h-6 w-6" />
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-base mt-2">
              Are you sure you want to delete <span className="font-bold text-gray-900">&quot;{deletingCourse?.title}&quot;</span>?
              <br /><br />
              This action cannot be undone. All course content, lectures, and materials will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-md hover:shadow-lg"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                "Delete Course"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
