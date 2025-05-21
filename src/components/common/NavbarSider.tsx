'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LOGIN_USER, USER_PROFILE } from '@/constant/enum';
import { Button } from '@heroui/react';
import { addToast } from '@heroui/toast';

export default function NavbarSider() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_PROFILE);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(LOGIN_USER);
    localStorage.removeItem(USER_PROFILE);
    addToast({
      title: 'Đăng xuất thành công',
      color: 'success',
    });
    router.push('/login');
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <aside style={{ width: 220, height: '100vh', backgroundColor: '#f8f9fa', padding: 20, position: 'fixed', top: 70, left: 0 }}>
      <h2 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 20 }}>🧑‍💼 Admin Panel</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/admin">
          <span>🏠 Dashboard</span>
        </Link>
        <Link href="/admin/manage-users">
          <span>👥 Quản lý người dùng</span>
        </Link>
        <Link href="/admin/manage-payments">
          <span>💳 Quản lý thanh toán</span>
        </Link>
        <Link href="/admin/manage-packages">
          <span>🎁 Quản lý gói</span>
        </Link>
        <Button color="danger" onPress={handleLogout} size="sm" className="mt-4">
          Đăng xuất
        </Button>
      </nav>
    </aside>
  );
}
