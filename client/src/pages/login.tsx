import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Building2, TrendingUp, Users, Shield, CheckCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store auth token
      localStorage.setItem('auth_token', 'demo_token_' + Date.now());
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
      });
      
      // Redirect to dashboard
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Hero content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <Building2 className="h-10 w-10 mr-3" />
            <span className="text-2xl font-bold">RentAI Pro</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Your AI Co-Agent Guarantees a Rental Offer in 30 Days
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Make decisions based on numbers, not feelings. Get real insights and data-driven feedback to secure a tenant fast.
            </p>
            
            <div className="flex items-center mb-4">
              <Badge className="bg-green-500 text-white mr-3 px-3 py-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                30-Day Guarantee
              </Badge>
              <Badge className="bg-blue-500 text-white px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                Data-Driven
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="flex items-start">
              <div className="bg-white/20 rounded-lg p-3 mr-4">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">30-Day Rental Guarantee</h3>
                <p className="text-blue-100">Our AI co-agent analyzes market data and ensures you receive qualified rental offers within 30 days or we work for free.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 rounded-lg p-3 mr-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Real Market Insights</h3>
                <p className="text-blue-100">Access comprehensive property performance data, rental income projections, and competitive analysis to make informed decisions.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 rounded-lg p-3 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Powered Lead Engagement</h3>
                <p className="text-blue-100">Our intelligent questionnaire system engages prospects automatically, collecting valuable feedback and pricing insights.</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-blue-200">
            "Transform your rental business with AI-powered insights and guaranteed results."
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4 lg:hidden">
                <Building2 className="h-8 w-8 mr-2 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">RentAI Pro</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600">
                Sign in to your AI-powered rental management platform
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="mt-1"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // In a real app, navigate to sign-up page
                      toast({
                        title: "Sign Up Coming Soon",
                        description: "Registration will be available soon. Contact us for early access.",
                      });
                    }}
                  >
                    Create New Account
                  </Button>
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button 
                      type="button"
                      className="text-blue-600 hover:text-blue-500 font-medium"
                      onClick={() => {
                        toast({
                          title: "30-Day Guarantee",
                          description: "Sign up now and get guaranteed rental offers within 30 days!",
                        });
                      }}
                    >
                      Start your 30-day guarantee
                    </button>
                  </p>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Secure Login
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    30-Day Guarantee
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile value proposition */}
          <div className="lg:hidden mt-8 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2">
                AI Co-Agent • 30-Day Rental Guarantee
              </h3>
              <p className="text-blue-100 text-sm">
                Make data-driven decisions, not emotional ones. Get guaranteed rental offers with AI-powered insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}