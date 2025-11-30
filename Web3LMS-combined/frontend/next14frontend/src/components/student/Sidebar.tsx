"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  User,
  Lock,
  LogOut,
  Menu,
  Award,
  CheckSquare,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  {
    href: "/student/dashboard/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/student/courses/",
    label: "My Courses",
    icon: BookOpen,
  },
  {
    href: "/student/wishlist/",
    label: "Wishlist",
    icon: Heart,
  },
];

const certificatesNavItems: NavItem[] = [
  {
    href: "/student/certificates/",
    label: "Certificates Dashboard",
    icon: Award,
  },
  {
    href: "/student/certificates/generate/",
    label: "Generate Certificate",
    icon: CheckSquare,
  },
  {
    href: "/verify-certificate",
    label: "Verify Certificate",
    icon: Shield,
  },
];

const accountNavItems: NavItem[] = [
  {
    href: "/student/profile/",
    label: "Edit Profile",
    icon: User,
  },
  {
    href: "/student/change-password/",
    label: "Change Password",
    icon: Lock,
  },
  {
    href: "/logout/",
    label: "Sign Out",
    icon: LogOut,
  },
];

function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full lg:w-64">
      <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between lg:hidden mb-4">
          <span className="font-semibold text-gray-900">Menu</span>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-indigo-600" : "text-gray-400")} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Certificates Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Certificates
            </h3>
            <ul className="space-y-1">
              {certificatesNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-indigo-600" : "text-gray-400")} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Account
            </h3>
            <ul className="space-y-1">
              {accountNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-indigo-600" : "text-gray-400")} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default StudentSidebar;