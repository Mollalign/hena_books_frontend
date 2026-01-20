"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usersService, UserUpdate } from "@/lib/services/users";
import { analyticsService } from "@/lib/services/analytics";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  Shield,
  BookOpen,
  Clock,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  TrendingUp,
  Activity,
  Sparkles,
} from "lucide-react";

interface ReadingStats {
  total_books_read: number;
  total_reading_time_hours: number;
  total_sessions: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name }));
      fetchReadingStats();
    }
  }, [user]);

  const fetchReadingStats = async () => {
    try {
      setStatsLoading(true);
      // Get reading stats for current user
      const stats = await analyticsService.getMyReadingStats();
      setReadingStats(stats);
    } catch (error) {
      console.error("Failed to fetch reading stats:", error);
      // Set default stats if API fails
      setReadingStats({
        total_books_read: 0,
        total_reading_time_hours: 0,
        total_sessions: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const updateData: UserUpdate = { name: formData.name };
      await usersService.updateProfile(updateData);
      await refreshUser();
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.password) {
      toast.error("Please enter a new password");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      await usersService.updateProfile({ password: formData.password });
      setIsChangingPassword(false);
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      toast.success("Password changed successfully");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(error.response?.data?.detail || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData(prev => ({ ...prev, name: user?.name || "" }));
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-4 w-32 bg-[var(--muted)] rounded-full animate-pulse" />
            <div className="h-3 w-24 bg-[var(--muted)] rounded-full animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[var(--muted)]/30">
      <Navbar />
      
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--primary-50)] to-[var(--accent-50)] dark:from-[var(--primary-950)] dark:to-[var(--accent-950)] border border-[var(--primary-200)] dark:border-[var(--primary-800)] shadow-sm">
              <Sparkles className="w-4 h-4 text-[var(--accent-500)]" />
              <span className="text-sm font-medium bg-gradient-to-r from-[var(--primary-600)] to-[var(--accent-500)] bg-clip-text text-transparent">
                My Account
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Profile Settings
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Manage your account information and view your reading journey
            </p>
          </div>

          {/* Profile Card */}
          <Card className="border border-[var(--border)] bg-background/80 backdrop-blur-sm shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-r from-[var(--primary-500)] via-[var(--primary-600)] to-[var(--accent-500)]">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48Y2lyY2xlIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
            </div>
            
            {/* Avatar */}
            <div className="relative px-6 -mt-16">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-background">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <CardContent className="pt-4 pb-8 px-6 space-y-8">
              {/* User Info Section */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                      user.role === "admin"
                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                        : "bg-[var(--primary-50)] dark:bg-[var(--primary-950)] text-[var(--primary-600)] dark:text-[var(--primary-400)]"
                    }`}>
                      <Shield className="w-4 h-4" />
                      {user.role === "admin" ? "Administrator" : "Member"}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                    </>
                  ) : (
                    <>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)] dark:from-[var(--primary-950)] dark:to-[var(--primary-900)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-[var(--primary-500)]">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-muted-foreground">Books Read</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {readingStats?.total_books_read || 0}
                        </p>
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-[var(--accent-50)] to-[var(--accent-100)] dark:from-[var(--accent-950)] dark:to-[var(--accent-900)] border border-[var(--accent-200)] dark:border-[var(--accent-800)]">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-[var(--accent-500)]">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-muted-foreground">Reading Time</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {readingStats?.total_reading_time_hours?.toFixed(1) || 0}h
                        </p>
                      </div>
                      <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-emerald-500">
                            <Activity className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-muted-foreground">Sessions</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">
                          {readingStats?.total_sessions || 0}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* Edit Profile Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-[var(--primary-500)]" />
                    Edit Profile
                  </h3>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 p-4 rounded-xl bg-[var(--muted)]/50">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">
                        Display Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="h-11"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="gap-2 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white"
                      >
                        {saving ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Display Name</p>
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* Change Password Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[var(--accent-500)]" />
                    Security
                  </h3>
                  {!isChangingPassword && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangingPassword(true)}
                      className="gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </Button>
                  )}
                </div>

                {isChangingPassword ? (
                  <div className="space-y-4 p-4 rounded-xl bg-[var(--muted)]/50">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter new password"
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.password && formData.confirmPassword && (
                        <p className={`text-xs flex items-center gap-1 ${
                          formData.password === formData.confirmPassword
                            ? "text-emerald-600"
                            : "text-destructive"
                        }`}>
                          {formData.password === formData.confirmPassword ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Passwords match
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              Passwords do not match
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleChangePassword}
                        disabled={saving || formData.password !== formData.confirmPassword}
                        className="gap-2 bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-600)] text-white"
                      >
                        {saving ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Update Password
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelPasswordChange}
                        disabled={saving}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Password</p>
                        <p className="font-medium">••••••••</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* Account Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                    <p className="font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
