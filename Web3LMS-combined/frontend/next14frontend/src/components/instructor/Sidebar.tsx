"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Star,
  GraduationCap,
  IndianRupee,
  Tag,
  Bell,
  ShoppingCart,
  MessageSquare,
  User,
  Lock,
  LogOut,
  Menu,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  {
    href: "/instructor/dashboard/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/instructor/courses/",
    label: "My Courses",
    icon: BookOpen,
  },
  {
    href: "/instructor/quiz-manage/",
    label: "Quiz Manage",
    icon: FileText,
  },
  {
    href: "/instructor/create-course/",
    label: "Create Course",
    icon: Plus,
  },
  {
    href: "/instructor/reviews/",
    label: "Review",
    icon: Star,
  },
  {
    href: "/instructor/students/",
    label: "Students",
    icon: GraduationCap,
  },
  {
    href: "/instructor/earning/",
    label: "Earning",
    icon: IndianRupee,
  },
  {
    href: "/instructor/coupon/",
    label: "Coupons",
    icon: Tag,
  },
  {
    href: "/instructor/notifications/",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/instructor/orders/",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/instructor/question-answer/",
    label: "Q/A",
    icon: MessageSquare,
  },
];

const accountNavItems: NavItem[] = [
  {
    href: "/instructor/profile/",
    label: "Edit Profile",
    icon: User,
  },
  {
    href: "/instructor/change-password/",
    label: "Change Password",
    icon: Lock,
  },
  {
    href: "/login/",
    label: "Sign Out",
    icon: LogOut,
  },
];

function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full lg:w-64">
      <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-4">
        <div className="flex items-center justify-between lg:hidden mb-4">
          <span className="font-bold text-gray-900">Menu</span>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Menu
            </h3>
            <ul className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-indigo-50 text-indigo-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                        {item.label}
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="h-1.5 w-1.5 rounded-full bg-indigo-600"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Settings
            </h3>
            <ul className="space-y-1">
              {accountNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-indigo-50 text-indigo-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default InstructorSidebar;
