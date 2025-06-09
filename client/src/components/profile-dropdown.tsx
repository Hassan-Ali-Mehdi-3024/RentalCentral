import { useState } from "react";
import { User, Settings, LogOut, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ProfileDropdownProps {
  onProfileClick: () => void;
}

export function ProfileDropdown({ onProfileClick }: ProfileDropdownProps) {
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: () => api.profile.get(),
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return "User Profile";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profile?.profileImageUrl || undefined} 
              alt={getDisplayName()}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(profile?.firstName, profile?.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getDisplayName()}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email || "No email set"}
            </p>
            {profile?.isLicensedAgent !== undefined && (
              <p className="text-xs leading-none text-muted-foreground">
                {profile.isLicensedAgent ? "Licensed Agent" : "Property Owner"}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}