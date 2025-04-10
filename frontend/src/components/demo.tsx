"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import Image from "next/image"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logoUrl: string
    plan: string
  }[]
}) {
  const { isMobile, isOpen } = useSidebar()  // ✅ Get sidebar state
  const defaultTeams = [{
    name: "Your Company",
    logoUrl: "/img/karmen-loh.jpg",
    plan: "Free"
  }]
  const [activeTeam, setActiveTeam] = React.useState(teams[0] || defaultTeams[0])

  return (
    <div className="relative flex items-center">
      {/* ✅ Always show the logo, even when the sidebar is hidden */}
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
        <Image 
          src={activeTeam.logoUrl}
          alt={`${activeTeam.name} logo`}
          width={48}
          height={48}
          className="object-cover w-full h-full"
          priority
          quality={100}
          unoptimized
        />
      </div>

      {/* ✅ Sidebar hides visually instead of unmounting */}
      <SidebarMenu className={isOpen ? "opacity-100 visible" : "opacity-0 invisible transition-opacity duration-300"}>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeTeam.name}
                  </span>
                  <span className="truncate text-xs">{activeTeam.plan}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Teams
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border overflow-hidden">
                    <Image 
                      src={team.logoUrl}
                      alt={`${team.name} logo`}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                      priority
                      quality={80}
                      unoptimized
                    />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add team</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  )
}
