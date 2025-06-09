import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Calendar, MessageSquare, TrendingUp, ArrowRight, Check } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Building2,
      title: "Property Management",
      description: "Manage rental listings, track availability, and organize property information in one central dashboard."
    },
    {
      icon: Users,
      title: "Lead Tracking",
      description: "Capture and track leads from multiple sources with automated assignment and follow-up capabilities."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered scheduling system with voice commands and automated tour booking for prospects."
    },
    {
      icon: MessageSquare,
      title: "Feedback Analysis",
      description: "Intelligent questionnaires that discover prospect preferences, budgets, and move-in timelines."
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Comprehensive insights comparing rental income potential and property performance metrics."
    }
  ];

  const benefits = [
    "Automated lead qualification and follow-up",
    "Voice-enabled scheduling and feedback collection",
    "Real-time property performance analytics",
    "Prospect budget and timeline discovery",
    "Streamlined tour booking and management",
    "Comprehensive feedback categorization"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PropertyFlow</h1>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Streamline Your
            <span className="text-primary"> Property Management</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Complete rental management platform with AI-powered lead tracking, automated scheduling, 
            and intelligent feedback analysis to maximize your property performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-primary hover:bg-blue-700 text-lg px-8 py-4 h-auto"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4 h-auto border-gray-300"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage properties efficiently
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From lead capture to performance analytics, PropertyFlow provides comprehensive tools 
              for modern property management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Maximize your rental income with intelligent insights
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                PropertyFlow uses AI to analyze prospect feedback, compare rental income potential, 
                and provide actionable insights to help you choose the best tenants and optimize pricing.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-900">Total Properties</span>
                    <span className="text-2xl font-bold text-primary">24</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-900">Active Leads</span>
                    <span className="text-2xl font-bold text-green-600">156</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <span className="font-medium text-gray-900">Conversion Rate</span>
                    <span className="text-2xl font-bold text-orange-600">34.2%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-900">Monthly Revenue</span>
                    <span className="text-2xl font-bold text-purple-600">$125,400</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to transform your property management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of property managers who trust PropertyFlow to streamline their operations 
            and maximize rental income.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 h-auto"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">PropertyFlow</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 PropertyFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}