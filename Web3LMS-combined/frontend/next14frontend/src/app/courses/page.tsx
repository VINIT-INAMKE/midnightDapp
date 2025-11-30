"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiInstance from "@/utils/axios";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, Users, Clock, Star } from "lucide-react";

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
    students: { id: number }[];
    average_rating: number | null;
    rating_count: number;
    reviews: { id: number }[];
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLevel, setSelectedLevel] = useState<string>("all");
    const router = useRouter();

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const res = await apiInstance.get(`/course/course-list/`);
            setCourses(res.data);
            setFilteredCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        let filtered = courses;

        if (searchQuery) {
            filtered = filtered.filter((course) =>
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedLevel !== "all") {
            filtered = filtered.filter((course) => course.level === selectedLevel);
        }

        setFilteredCourses(filtered);
    }, [searchQuery, selectedLevel, courses]);

    const handleCourseClick = (slug: string) => {
        router.push(`/course-details/${slug}`);
    };

    const handleEnrollClick = (e: React.MouseEvent, course: Course) => {
        e.stopPropagation();
        // Navigate to course details for enrollment/purchase
        router.push(`/course-details/${course.slug}`);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-8 sm:py-12">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                            Explore Our <span className="text-indigo-600">Courses</span>
                        </h1>
                        <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            Discover blockchain and Web3 courses taught by industry experts. Enroll now and start your learning journey with our premium curriculum.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="container mx-auto px-4 py-8 -mt-8">
                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-4 mb-8 border border-gray-100 relative z-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search for courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={selectedLevel === "all" ? "default" : "outline"}
                                onClick={() => setSelectedLevel("all")}
                                className={`rounded-lg px-4 h-10 text-sm ${selectedLevel === "all" ? "bg-gray-900 hover:bg-indigo-600 text-white border-transparent" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                            >
                                All Levels
                            </Button>
                            <Button
                                variant={selectedLevel === "beginner" ? "default" : "outline"}
                                onClick={() => setSelectedLevel("beginner")}
                                className={`rounded-lg px-4 h-10 text-sm ${selectedLevel === "beginner" ? "bg-gray-900 hover:bg-indigo-600 text-white border-transparent" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                            >
                                Beginner
                            </Button>
                            <Button
                                variant={selectedLevel === "intermediate" ? "default" : "outline"}
                                onClick={() => setSelectedLevel("intermediate")}
                                className={`rounded-lg px-4 h-10 text-sm ${selectedLevel === "intermediate" ? "bg-gray-900 hover:bg-indigo-600 text-white border-transparent" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                            >
                                Intermediate
                            </Button>
                            <Button
                                variant={selectedLevel === "advanced" ? "default" : "outline"}
                                onClick={() => setSelectedLevel("advanced")}
                                className={`rounded-lg px-4 h-10 text-sm ${selectedLevel === "advanced" ? "bg-gray-900 hover:bg-indigo-600 text-white border-transparent" : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                            >
                                Advanced
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredCourses.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No courses found</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )}

                {/* Courses Grid */}
                {!isLoading && filteredCourses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12 max-w-7xl mx-auto">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.course_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Card className="h-full flex flex-col border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-xl overflow-hidden group">
                                    <div
                                        className="relative aspect-video cursor-pointer overflow-hidden"
                                        onClick={() => handleCourseClick(course.slug)}
                                    >
                                        <Image
                                            src={course.image || "/placeholder-course.jpg"}
                                            alt={course.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-white/90 text-gray-800 hover:bg-white shadow-sm backdrop-blur-md border-none capitalize px-2 py-0.5 text-xs font-medium">
                                                {course.level}
                                            </Badge>
                                        </div>

                                        {course.featured && (
                                            <div className="absolute top-2 left-2">
                                                <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-none shadow-sm backdrop-blur-md px-2 py-0.5 text-xs font-medium">
                                                    <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none text-[10px] px-2 py-0.5">
                                                {course.category.title}
                                            </Badge>
                                            <span className="text-lg font-bold text-gray-900">
                                                ₹{course.price}
                                            </span>
                                        </div>
                                        <CardTitle className="text-base font-bold line-clamp-2 group-hover:text-indigo-600 transition-colors cursor-pointer text-gray-900 leading-snug min-h-[2.5rem]" onClick={() => handleCourseClick(course.slug)}>
                                            {course.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="flex-1 p-4 pt-0">
                                        <div className="flex items-center gap-2 mb-3 mt-2">
                                            <Avatar className="h-6 w-6 ring-1 ring-white shadow-sm">
                                                <AvatarImage src={course.teacher.image} alt={course.teacher.full_name} />
                                                <AvatarFallback className="bg-gray-100 text-gray-600 text-[10px]">{course.teacher.full_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-gray-600 font-medium line-clamp-1">{course.teacher.full_name}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5 text-gray-400" />
                                                <span>{course.students.length} students</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Rater total={1} rating={1} interactive={false} />
                                                <span className="font-medium text-gray-900 ml-0.5">{course.average_rating?.toFixed(1) || "0.0"}</span>
                                                <span className="text-gray-400">({course.rating_count})</span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-4 pt-0 mt-auto">
                                        <Button
                                            onClick={(e) => handleEnrollClick(e, course)}
                                            className="w-full bg-gray-900 hover:bg-indigo-600 text-white rounded-lg font-medium h-9 text-sm transition-colors shadow-sm"
                                        >
                                            View Course
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
