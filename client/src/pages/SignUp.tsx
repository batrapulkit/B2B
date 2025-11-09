import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Check } from "lucide-react";

export default function SignUp() {
  const handleSignUp = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Triponic
            </span>
          </div>
          <Button variant="ghost" onClick={() => window.location.href = "/signin"}>
            Already have an account? Sign In
          </Button>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                Enterprise B2B Platform
              </Badge>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Transform your travel business with{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Triponic
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Join hundreds of travel agencies using AI-powered tools to boost productivity and revenue
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700">AI-powered itinerary generation in seconds</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700">Complete CRM for client management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700">Integrated invoicing with Stripe payments</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700">Real-time analytics and reporting</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700">Role-based access control for teams</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700">Secure cloud-based infrastructure</span>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500">
                🔒 Your data is encrypted and secure. SOC 2 compliant infrastructure.
              </p>
            </div>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-3xl">Create Your Account</CardTitle>
              <CardDescription className="text-base">
                Start your 30-day free trial today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <Button
                onClick={handleSignUp}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                Get Started Free
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Sign up with your existing account</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>✓</span> No credit card required
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>✓</span> Full access to all features
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>✓</span> Cancel anytime
                </div>
              </div>

              <div className="text-center text-xs text-gray-600">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
