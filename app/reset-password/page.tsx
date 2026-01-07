"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/lib/services/auth";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Code must be 6 digits"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.new_password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      code: "",
      new_password: "",
      confirmPassword: "",
    },
  });

  const handleVerifyCode = async () => {
    const email = form.getValues("email");
    const code = form.getValues("code");

    if (!email || !code) {
      toast.error("Please enter both email and code");
      return;
    }

    setVerifying(true);
    try {
      const response = await authService.verifyResetCode({ email, code });
      if (response.valid) {
        setCodeVerified(true);
        toast.success("Code verified successfully!");
      } else {
        toast.error(response.message || "Invalid code");
      }
    } catch (error: any) {
      console.error("Code verification failed:", error);
      toast.error(
        error.response?.data?.detail || "Failed to verify code. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!codeVerified) {
      toast.error("Please verify your code first");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: values.email,
        code: values.code,
        new_password: values.new_password,
      });

      toast.success("Password reset successfully! Please sign in with your new password.");
      router.push("/login");
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast.error(
        error.response?.data?.detail || "Failed to reset password. Please try again."
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
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-base">
            Enter your email, verification code, and new password
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          type="text" 
                          placeholder="123456" 
                          className="h-11 flex-1"
                          maxLength={6}
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleVerifyCode}
                          disabled={verifying || !form.getValues("email") || !form.getValues("code")}
                          className="h-11"
                        >
                          {verifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : codeVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the 6-digit code sent to your email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {codeVerified && (
                <>
                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          New Password
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Must be at least 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Confirm New Password
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
                </>
              )}
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] hover:from-[var(--primary-700)] hover:to-[var(--primary-800)]" 
                disabled={isLoading || !codeVerified}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            <Link 
              href="/login" 
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

