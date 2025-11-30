"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { Bell, Search } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import { ProfileContext } from "@/views/plugins/Context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  full_name: string;
  email: string;
  username: string;
  teacher_id: number;
  image?: string;
}

interface ProfileData {
  id: number;
  name?: string;
  email: string;
  teacher_id: number;
  image: string;
  full_name: string;
  about: string;
  username: string;
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  country: string;
}

export default function InstructorHeader() {
  const router = useRouter();
  const [, setContextProfile] = useContext(ProfileContext);
  const [localProfile, setLocalProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await useAxios.get(`user/profile/${UserData()?.user_id}/`);
      const imageUrl = res.data.image ? res.data.image : "/default-avatar.svg";

      setLocalProfile((prev) => ({
        ...prev!,
        image: imageUrl,
        about: res.data.about || "Welcome to your Instructor dashboard!",
      }));
      setContextProfile((prev) => ({
        ...prev,
        image: imageUrl,
        about: res.data.about || "Welcome to your Instructor dashboard!",
      }));
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [setContextProfile]);

  useEffect(() => {
    const access_token = Cookie.get("access_token");
    const refresh_token = Cookie.get("refresh_token");

    if (access_token && refresh_token) {
      try {
        const decoded = jwtDecode<DecodedToken>(refresh_token);

        const updatedProfile: ProfileData = {
          id: decoded.user_id,
          full_name: decoded.full_name,
          email: decoded.email,
          teacher_id: decoded.teacher_id,
          username: decoded.username,
          token_type: decoded.token_type,
          exp: decoded.exp,
          iat: decoded.iat,
          jti: decoded.jti,
          image: decoded.image || "/default-avatar.svg",
          about: "Welcome to your Instructor dashboard!",
          country: "",
        };

        setLocalProfile(updatedProfile);
        setContextProfile(updatedProfile);
        setIsLoading(false);
        fetchProfile(); // Fetch profile data after initial setup
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLoading(false);
      }
    } else {
      console.log("No tokens found in cookies");
      setIsLoading(false);
    }
  }, [setContextProfile, fetchProfile]);

  const handleSettingsClick = () => {
    router.push("/instructor/profile");
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white border-b border-gray-100 h-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!localProfile) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Side: Search (Optional) or Breadcrumbs */}
          <div className="hidden sm:flex items-center w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
              />
            </div>
          </div>

          {/* Right Side: Profile & Actions */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
              <Bell className="h-5 w-5" />
            </Button>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">
                  {localProfile.full_name}
                </p>
                <p className="text-xs text-indigo-600 font-medium mt-1">
                  Instructor
                </p>
              </div>

              <div className="relative group cursor-pointer" onClick={handleSettingsClick}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 -z-10 blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-gray-100 group-hover:ring-indigo-100 transition-all">
                  <AvatarImage
                    src={localProfile.image}
                    alt={localProfile.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
