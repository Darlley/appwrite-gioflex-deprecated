"use client"

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail
} from "@/components/ui/sidebar";

import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface SidebarLeftProps extends React.ComponentProps<typeof Sidebar> {
  menuItems: MenuItem[];
}

export function SidebarLeft({ menuItems, ...props }: SidebarLeftProps) {
  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="border-r-0"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <TeamSwitcher />
        </SidebarMenu>
        <NavMain items={menuItems} />
      </SidebarHeader>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
