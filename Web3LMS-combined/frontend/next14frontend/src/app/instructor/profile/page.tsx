"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User,
  Save,
  Upload,
  MapPin,
  FileText,
  Info
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import InstructorSidebar from "@/components/instructor/Sidebar";
import InstructorHeader from "@/components/instructor/Header";
import useAxios from "@/utils/axios";
import UserData from "@/views/plugins/UserData";
import Toast from "@/views/plugins/Toast";
import { ProfileContext } from "@/views/plugins/Context";

interface ProfileData {
  image: string | File;
  full_name: string;
  about: string;
  country: string;
}

export default function Profile() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profile, setProfile] = useContext(ProfileContext);
  const [profileData, setProfileData] = useState<ProfileData>({
    image: "",
    full_name: "",
    about: "",
    country: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await useAxios.get(`user/profile/${UserData()?.user_id}/`);
      setProfile(response.data);
      setProfileData(response.data);
      setImagePreview(response.data.image);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to load profile data",
      });
    }
  }, [setProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const selectedFile = event.target.files[0];
    setProfileData({
      ...profileData,
      [event.target.name]: selectedFile,
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await useAxios.get(`user/profile/${UserData()?.user_id}/`);
      const formdata = new FormData();

      if (profileData.image && profileData.image !== res.data.image) {
        formdata.append("image", profileData.image);
      }

      formdata.append("full_name", profileData.full_name);
      formdata.append("about", profileData.about);
      formdata.append("country", profileData.country);

      const response = await useAxios.patch(
        `user/profile/${UserData()?.user_id}/`,
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(response.data);

      Toast().fire({
        icon: "success",
        title: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        <InstructorHeader />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <InstructorSidebar />
          </div>

          <div className="lg:col-span-3 space-y-5 sm:space-y-7">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground">Profile Details</h4>
                <p className="text-sm text-muted-foreground">Manage your personal information</p>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border overflow-hidden bg-card backdrop-blur-sm border shadow-xl">
                {/* Gradient Header */}
                <div className="h-2 bg-secondary" />
                <CardHeader className="p-5 sm:p-6 bg-muted/30 border-b border-border">
                  <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-secondary" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    You have full control to manage your own account settings
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 sm:p-6">
                  <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mb-6">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={imagePreview} alt={profileData.full_name} />
                        <AvatarFallback className="bg-secondary/10 text-secondary text-xl">
                          {profileData.full_name ? getInitials(profileData.full_name) : "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <h4 className="text-base font-medium text-foreground">Your Avatar</h4>
                        <p className="text-sm text-muted-foreground">PNG or JPG no bigger than 800px wide and tall</p>
                        <div className="flex items-center gap-2 pt-1">
                          <Label
                            htmlFor="image-upload"
                            className="cursor-pointer bg-secondary hover:bg-secondary/90 text-secondary-foreground px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            Upload Image
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            name="image"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6 bg-border" />

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-base font-medium text-foreground flex items-center gap-2">
                          <Info className="h-4 w-4 text-secondary" />
                          Personal Details
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">Edit your personal information and address</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="full_name" className="text-foreground">Full Name</Label>
                          <Input
                            id="full_name"
                            name="full_name"
                            value={profileData.full_name}
                            onChange={handleProfileChange}
                            placeholder="Enter your full name"
                            className="border-input bg-background text-foreground focus-visible:ring-secondary"
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="about" className="text-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-secondary" />
                            About Me
                          </Label>
                          <Textarea
                            id="about"
                            name="about"
                            value={profileData.about}
                            onChange={handleProfileChange}
                            placeholder="Tell us about yourself"
                            className="min-h-[120px] border-input bg-background text-foreground focus-visible:ring-secondary resize-none"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="country" className="text-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-secondary" />
                            Country
                          </Label>
                          <Input
                            id="country"
                            name="country"
                            value={profileData.country}
                            onChange={handleProfileChange}
                            placeholder="Enter your country"
                            className="border-input bg-background text-foreground focus-visible:ring-secondary"
                          />
                        </div>

                        <div className="pt-2">
                          <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Updating..." : "Update Profile"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
