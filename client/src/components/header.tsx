import { Search, Bell, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [, setLocation] = useLocation();

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setLocation("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-8">
            <Building2 className="h-8 w-8 mr-2 text-blue-600" />
            <div>
              <span className="text-xl font-bold text-gray-900">RentAI Pro</span>
              <p className="text-xs text-blue-600 font-medium">30-Day Rental Guarantee</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search properties or leads..." 
              className="w-80 pl-10"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              3
            </Badge>
          </Button>
          
          {/* Profile Dropdown */}
          <ProfileDropdown onProfileClick={handleProfileClick} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}
