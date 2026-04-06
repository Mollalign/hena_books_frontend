"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usersService, UserUpdate } from "@/lib/services/users";
import { analyticsService } from "@/lib/services/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User, Mail, Shield, BookOpen, Clock, Edit3, Save, X,
  Eye, EyeOff, Lock, CheckCircle, Activity, Sparkles,
} from "lucide-react";

interface ReadingStats {
  total_books_read: number;
  total_reading_time_hours: number;
  total_sessions: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", password: "", confirmPassword: "" });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, name: user.name }));
      analyticsService
        .getMyReadingStats()
        .then(setReadingStats)
        .catch(() => setReadingStats({ total_books_read: 0, total_reading_time_hours: 0, total_sessions: 0 }))
        .finally(() => setStatsLoading(false));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    try {
      await usersService.updateProfile({ name: formData.name });
      await refreshUser();
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!formData.password) { toast.error("Enter a new password"); return; }
    if (formData.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return; }
    setSaving(true);
    try {
      await usersService.updateProfile({ password: formData.password });
      setIsChangingPassword(false);
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      toast.success("Password changed");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to change password");
    } finally { setSaving(false); }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh]">
        <div className="w-14 h-14 rounded-2xl bg-navy-gradient flex items-center justify-center animate-pulse">
          <User className="w-7 h-7 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-xs font-medium text-navy-600 dark:text-navy-400">My Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
        </div>

        {/* Profile Card */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-navy-gradient" />
          <div className="relative px-5 -mt-12">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-navy-500 to-gold-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-background">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <CardContent className="pt-3 pb-6 px-5 space-y-6">
            {/* User Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  user.role === "admin"
                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    : "bg-navy-50 dark:bg-navy-950 text-navy-600 dark:text-navy-400"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                {user.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {statsLoading ? (
                <>
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </>
              ) : (
                <>
                  <MiniStat icon={BookOpen} label="Books" value={readingStats?.total_books_read || 0} color="bg-navy-500" />
                  <MiniStat icon={Clock} label="Hours" value={`${readingStats?.total_reading_time_hours?.toFixed(1) || 0}`} color="bg-gold-500" />
                  <MiniStat icon={Activity} label="Sessions" value={readingStats?.total_sessions || 0} color="bg-emerald-500" />
                </>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Edit Name */}
            <Section
              title="Edit Profile"
              icon={<Edit3 className="w-4 h-4 text-navy-500" />}
              action={!isEditing && <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit3 className="w-3.5 h-3.5 mr-1" /> Edit</Button>}
            >
              {isEditing ? (
                <div className="space-y-3 p-3 rounded-xl bg-muted/50">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Display Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-navy-gradient text-white">
                      <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => { setIsEditing(false); setFormData((p) => ({ ...p, name: user.name })); }} disabled={saving}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium text-sm">{user.name}</p></div>
                </div>
              )}
            </Section>

            <div className="border-t border-border" />

            {/* Change Password */}
            <Section
              title="Security"
              icon={<Lock className="w-4 h-4 text-gold-500" />}
              action={!isChangingPassword && <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}><Lock className="w-3.5 h-3.5 mr-1" /> Change</Button>}
            >
              {isChangingPassword ? (
                <div className="space-y-3 p-3 rounded-xl bg-muted/50">
                  <PasswordField label="New Password" value={formData.password} show={showPassword} toggle={() => setShowPassword(!showPassword)} onChange={(v) => setFormData({ ...formData, password: v })} />
                  <PasswordField label="Confirm" value={formData.confirmPassword} show={showPassword} toggle={() => setShowPassword(!showPassword)} onChange={(v) => setFormData({ ...formData, confirmPassword: v })} />
                  {formData.password && formData.confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 ${formData.password === formData.confirmPassword ? "text-emerald-600" : "text-destructive"}`}>
                      {formData.password === formData.confirmPassword ? <><CheckCircle className="w-3 h-3" /> Match</> : <><X className="w-3 h-3" /> No match</>}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleChangePassword} disabled={saving || formData.password !== formData.confirmPassword} className="bg-gold-500 text-white hover:bg-gold-600">
                      <Lock className="w-4 h-4 mr-1" /> {saving ? "Updating..." : "Update"}
                    </Button>
                    <Button variant="outline" onClick={() => { setIsChangingPassword(false); setFormData((p) => ({ ...p, password: "", confirmPassword: "" })); }} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Password</p><p className="font-medium text-sm">••••••••</p></div>
                </div>
              )}
            </Section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <div className="p-3 rounded-xl border border-border text-center">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-1.5`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">{icon} {title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function PasswordField({ label, value, show, toggle, onChange }: { label: string; value: string; show: boolean; toggle: () => void; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="relative">
        <Input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 text-base pr-10" autoComplete="new-password" />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
