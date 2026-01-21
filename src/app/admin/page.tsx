import { AdminPortal } from '@/components/module/admin/AdminPortal';
import { Suspense } from 'react';

export const metadata = {
  title: 'Trung tâm Quản trị - Lawoh Admin Portal',
  description: 'Bảng điều khiển và quản lý toàn diện hệ thống pháp lý Lawoh',
};

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Đang tải Admin Center...</div>}>
      <AdminPortal />
    </Suspense>
  );
}
