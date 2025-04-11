"use client";
import * as React from "react";
import {
  File,
  Settings,
  CircleUser,
  InfoIcon,
  CirclePlay
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const data = {}
export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const navMain = React.useMemo(
    () => [
      {
        title: "Dashboard",
        url: "#",
        icon: CirclePlay,
        items: [
          {
            title: "Dashboard",
            url: "/admin/dashboard",
          },
        ],
      },
      {
        title: "Company Details",
        url: "#",
        icon: InfoIcon,
        items: [
          {
            title: "Create Company",
            url: "/admin/companyform",
          },
          {
            title: "Company Record",
            url: "/admin/companyrecord",
          },
          {
            title: "Create Contact",
            url: "/admin/contactform",
          },
          {
            title: "Contact Record",
            url: "/admin/contactrecord",
          },
        ],
      },
      {
        title: "User",
        url: "#",
        icon: CircleUser,

        items: [
          {
            title: "Create User",
            url: "/admin/userform",
          },
          {
            title: "User Record",
            url: "/admin/userrecord",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: File,
        items: [
          {
            title: "Create Certificate",
            url: "/admin/certificateform",
          },
          {
            title: "Certificate Record",
            url: "/admin/certificaterecord",
          },
          {
            title: "Create Service",
            url: "/admin/serviceform",
          },
          {
            title: "Service Record",
            url: "/admin/servicerecord",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings,
        items: [
          {
            title: "Create Model",
            url: "/admin/addmodel",
          },
        ],
      },
    ],
    [pathname],
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
