"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number>(0);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({
        email: values.email,
      });

      setEmailSent(true);
      setExpiresIn(response.expires_in_minutes);
      toast.success("Reset code sent! Check your email.");
    } catch (error: any) {
      console.error("Failed to send reset code:", error);
      toast.error(
        error.response?.data?.detail || "Failed to send reset code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary-50)] via-background to-[var(--accent-50)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--primary-500)]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent-500)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <Card className="w-full max-w-md shadow-2xl border-[var(--border)] bg-card/95 backdrop-blur-sm relative z-10">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent a 6-digit reset code to {form.getValues("email")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                The code will expire in <strong>{expiresIn} minutes</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            <Button
              asChild
              className="w-full h-11"
            >
              <Link href="/reset-password">
                Enter Reset Code
              </Link>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              variant="ghost"
              onClick={() => {
                setEmailSent(false);
                form.reset();
              }}
              className="w-full"
            >
              Send Another Code
            </Button>
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Forgot Password?</CardTitle>
          <CardDescription className="text-base">
            Enter your email address and we'll send you a reset code
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
                    <FormDescription>
                      We'll send a 6-digit code to this email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] hover:from-[var(--primary-700)] hover:to-[var(--primary-800)]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Reset Code"
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

