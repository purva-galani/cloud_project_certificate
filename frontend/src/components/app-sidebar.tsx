"use client"
import * as React from "react"
import { usePathname } from "next/navigation"
import { NavUser } from "@/components/nav-user"
import { NavMain } from "@/components/nav-main"
import { Building2, Files, LayoutDashboard } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from "@/components/ui/sidebar"

const data = {
 navMain : [
      {
        title: "Dashboard",
        url: "#",
        icon: LayoutDashboard,
        items: [
          {
            title: "Dashboard",
            url: "/user/dashboard",
          },
        ],
      },
      {
        title: "Company Info",
        url: "#",
        icon: Building2,
        items: [
          {
            title: "Create Company",
            url: "/user/companyform",
          },
          {
            title: "Company Record",
            url: "/user/companyrecord",
          },
          {
            title: "Create Contact",
            url: "/user/contactform",
          },
          {
            title: "Contact Record",
            url: "/user/contactrecord",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: Files,
        items: [
          {
            title: "Create Certificate",
            url: "/user/certificateform",
          },
          {
            title: "Certificate Record",
            url: "/user/certificaterecord",
          },
          {
            title: "Create Service",
            url: "/user/serviceform",
          },
          {
            title: "Service Record",
            url: "/user/servicerecord",
          },
        ],
      },
    ],
  };

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
 const [isClient, setIsClient] = React.useState(false);
  const [activePath, setActivePath] = React.useState("");
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
      if (!sidebarRef.current) return;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          setIsCollapsed(width < 80); 
        }
      });
      observer.observe(sidebarRef.current);
      return () => observer.disconnect();
    }, []);
  
    const updatedNavMain = React.useMemo(
      () =>
        data.navMain.map((item) => ({
          ...item,
          isActive: isClient && activePath === item.url,
          items: item.items?.map((subItem) => ({
            ...subItem,
            isActive: isClient && activePath === subItem.url,
          })),
        })),
      [isClient, activePath]
    );
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={updatedNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser  />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}