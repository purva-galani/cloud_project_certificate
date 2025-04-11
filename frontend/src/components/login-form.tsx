"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import "react-toastify/dist/ReactToastify.css"
import { ReloadIcon } from "@radix-ui/react-icons"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter()


  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/users/forgot-password",
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
  
      setEmailSent(true);
      toast({
        title: "Success",
        description: response.data.message,
      });
  
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setEmailSent(true);
      toast({
        title: "Success",
        description: "If an account exists with this email, you'll receive a password reset link.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // User Login Attempt
      const userResponse = await fetch("http://localhost:5000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const userData = await userResponse.json();

      if (userResponse.ok) {
        localStorage.setItem("userId", userData.user.id);
        localStorage.setItem("authToken", userData.accessToken);
        
        toast({
          title: "Login successful",
          description: "You have logged in successfully",
        });
        router.push("/user/dashboard");
        return;
      }

      // Admin Login Attempt (Only if user login fails)
      const adminResponse = await fetch("http://localhost:5000/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const adminData = await adminResponse.json();

      if (adminResponse.ok) {
        localStorage.setItem("authToken", adminData.accessToken);
        localStorage.setItem("adminId", adminData.adminId);
        localStorage.setItem("adminEmail", adminData.email);

        toast({
          title: "Admin login successful",
          description: "You have logged in as admin",
        });
        router.push("/admin/dashboard");
        return;
      }

      // If both logins fail
      toast({
        title: "Login failed",
        description: userData.message || adminData.message || "Invalid credentials",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    {isForgotPassword ? (
      emailSent ? (
        <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
            Check your email
          </h2>
          <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300">
            If an account exists with this email, you'll receive a password reset link.
          </p>
          <p
            className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mt-4"
            onClick={() => {
              setIsForgotPassword(false);
              setEmailSent(false);
            }}
          >
            Back to Login
          </p>
        </div>
      ) : (
        <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
            Forgot Password
          </h2>
          <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300">
            Enter your email address to receive a password reset link
          </p>
          <form onSubmit={handleForgotPasswordSubmit} className="my-8">
            <div className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
          <p
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            onClick={() => setIsForgotPassword(false)}
          >
            Back to Login
          </p>
        </div>
      )
    ): (
        <>
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col space-y-1.5 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <div
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => !loading && setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <AiOutlineEyeInvisible size={24} className={loading ? "opacity-50" : ""} />
                    ) : (
                      <AiOutlineEye size={24} className={loading ? "opacity-50" : ""} />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex justify-end mb-8">
                <p
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot Password?
                </p>
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <Link href="/register">
                <span className={`text-blue-600 hover:text-blue-800 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                  Don't have an account? Register here.
                </span>
              </Link>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}