'use client'
import React, { useEffect, useState } from 'react';
import { Home, Users, CreditCard, Gift, DollarSign } from 'lucide-react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from '../ui/select';

interface User {
  role: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
  },
  {
    title: 'Quản lý người dùng',
    url: '/admin/manage-users',
    icon: Users,
  },
  {
    title: 'Quản lý thanh toán',
    url: '/admin/manage-payments',
    icon: CreditCard,
  },
  {
    title: 'Quản lý Video upload',
    url: '/admin/videosManager',
    icon: Gift,
  },
  {
    title: 'Quản lí giới hạn tiền',
    url: '/admin/price-range',
    icon: DollarSign,
  },
];

const NavbarSider = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('USER_PROFILE');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user || user.role !== 'admin') return null;

  return (
    <aside style={{ width: 220, height: '100vh', backgroundColor: '#f8f9fa', padding: 20, position: 'fixed', top: 70, left: 0 }}>
      <SidebarHeader >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            🧑‍💼
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </aside>
  );
};

export default NavbarSider;