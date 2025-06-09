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
      title: "Smart Lead Qualification",
      description: "AI-powered scoring system identifies high-quality prospects and prioritizes leads most likely to lease within 30 days."
    },
    {
      icon: Users,
      title: "Automated Prospect Nurturing",
      description: "Intelligent follow-up sequences keep prospects engaged with personalized messaging and timely responses."
    },
    {
      icon: Calendar,
      title: "Instant Tour Booking",
      description: "Voice-enabled scheduling and self-service booking system converts prospects to tours in minutes, not days."
    },
    {
      icon: MessageSquare,
      title: "AI Feedback Intelligence",
      description: "Advanced questionnaires uncover prospect motivations, budget flexibility, and decision timelines."
    },
    {
      icon: TrendingUp,
      title: "30-Day Lease Analytics",
      description: "Real-time insights and optimization recommendations to guarantee your property gets leased fast."
    }
  ];

  const benefits = [
    "30-day lease guarantee with AI optimization",
    "Smart prospect scoring and prioritization",
    "Automated tour scheduling and follow-ups",
    "Real-time pricing and market insights",
    "Voice-enabled feedback collection",
    "Predictive analytics for faster leasing"
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
            Get Your Rental Leased
            <span className="text-primary"> Within 30 Days</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your AI leasing copilot that optimizes every step from listing to lease signing. 
            Smart lead qualification, automated tours, and data-driven insights guarantee results.
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
              Everything you need to lease faster with AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From smart lead scoring to automated tours, your AI copilot handles every step 
              to get your rental property leased within 30 days.
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
                Lease faster with AI-powered insights
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your AI copilot analyzes prospect behavior, optimizes pricing strategy, 
                and provides data-driven recommendations to secure quality tenants within 30 days.
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
            Ready to lease your property within 30 days?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of landlords who use our AI leasing copilot to secure quality tenants faster 
            and eliminate vacancy periods.
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