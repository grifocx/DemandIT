import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FolderOpen,
  Layers,
  Lightbulb,
  ChartScatter,
  BarChart3,
  Users,
  ArrowRight,
} from "lucide-react"

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login"
  }

  const features = [
    {
      icon: FolderOpen,
      title: "Portfolio Management",
      description: "Organize and track your IT portfolios with complete visibility.",
    },
    {
      icon: Layers,
      title: "Program Oversight",
      description: "Manage programs and their relationships to portfolios and projects.",
    },
    {
      icon: Lightbulb,
      title: "Demand Pipeline",
      description: "Capture and evaluate demands before they become projects.",
    },
    {
      icon: ChartScatter,
      title: "Project Tracking",
      description: "Monitor project progress with phases, statuses, and assignments.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Get insights into portfolio health and project performance.",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Secure access control with proper permissions for each role.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900" data-testid="text-landing-title">
                IT Portfolio Manager
              </h1>
            </div>
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Strategic Portfolio Management
            <span className="text-blue-600 block">for IT Teams</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            A lightweight, custom SPM tool to manage portfolios, programs, demands, and projects 
            without the complexity and licensing costs of enterprise solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Everything you need for strategic planning
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Manage the complete lifecycle from portfolio strategy to project delivery 
            with role-based access and comprehensive tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your IT portfolio?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start managing your portfolios, programs, and projects with a tool 
            designed specifically for IT teams.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-cta"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-500">
            <p>&copy; 2024 IT Portfolio Manager. Built for enterprise IT teams.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
