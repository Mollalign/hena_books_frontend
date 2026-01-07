"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/services/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      // Store tokens first
      localStorage.setItem("token", response.access_token);
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      }

      // Get user details with the access token
      const userResponse = await authService.getCurrentUser();

      login(response.access_token, userResponse);
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(
        error.response?.data?.detail || "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary-50)] via-background to-[var(--accent-50)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary-500)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent-500)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-[var(--border)] bg-card/95 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to continue your reading journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        className="h-11"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="h-11"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-[var(--primary-600)] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] hover:from-[var(--primary-700)] hover:to-[var(--primary-800)]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              href="/register" 
              className="text-[var(--primary-600)] hover:underline font-semibold"
            >
              Create one
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
