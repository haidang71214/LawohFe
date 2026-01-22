'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Shield,
  UserCheck,
  User,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { useGetUsersQuery, useUpdateUserByAdminMutation } from '@/store/queries/user';
import { useLanguage } from '@/i18n/LanguageContext';
import toast from '@/lib/toast';

export const UsersTab: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const { data: usersResponse, isLoading, refetch } = useGetUsersQuery();
  const [updateUserMutation, { isLoading: isUpdating }] = useUpdateUserByAdminMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const users: any[] = useMemo(() => {
    const rawUsers = (usersResponse?.data as any) || [];
    const list = Array.isArray(rawUsers) ? rawUsers : (Array.isArray(rawUsers?.data) ? rawUsers.data : []);
    return Array.isArray(list) ? list : [];
  }, [usersResponse]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phone && String(u.phone).includes(searchTerm)) ||
        (u.province && u.province.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const roleLabels: Record<string, string> = {
    user: isEn ? 'Client' : 'Khách hàng',
    lawyer: isEn ? 'Lawyer' : 'Luật sư',
    admin: isEn ? 'Administrator' : 'Quản trị viên',
  };

  const handleOpenRoleModal = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    try {
      await updateUserMutation({
        id: selectedUser._id,
        data: { role: newRole as any },
      }).unwrap();

      const roleName = roleLabels[newRole] || newRole;
      toast.success(
        isEn ? 'Role updated successfully' : 'Cập nhật thành công',
        isEn ? `Changed role of ${selectedUser.name || 'user'} to ${roleName}` : `Đã đổi vai trò của ${selectedUser.name || 'người dùng'} sang ${roleName}`
      );
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (err: any) {
      toast.error(
        isEn ? 'Update error' : 'Lỗi',
        err?.data?.message || (isEn ? 'Failed to update user role' : 'Không thể cập nhật vai trò, vui lòng thử lại')
      );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-600">
            <Shield className="w-2.5 h-2.5" /> [ADMIN]
          </span>
        );
      case 'lawyer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold bg-[#1a5336]/10 text-[#1a5336] dark:text-[#4ade80] border border-[#1a5336]">
            <UserCheck className="w-2.5 h-2.5" /> [LUẬT SƯ]
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-600">
            <User className="w-2.5 h-2.5" /> [THÀNH VIÊN]
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-4 shadow-[4px_4px_0px_#1a5336]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search by name, email, phone, city...' : 'Tìm theo tên, email, SĐT, tỉnh thành...'}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0d1410] border-2 border-stone-800 dark:border-stone-700 text-xs font-mono text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5336] dark:focus:border-[#4ade80]"
            />
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {[
            { key: 'ALL', label: isEn ? '[ALL ROLES]' : '[TẤT CẢ]' },
            { key: 'user', label: isEn ? '[CLIENTS]' : '[THÀNH VIÊN]' },
            { key: 'lawyer', label: isEn ? '[LAWYERS]' : '[LUẬT SƯ]' },
            { key: 'admin', label: isEn ? '[ADMINS]' : '[QUẢN TRỊ VIÊN]' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRoleFilter(item.key)}
              className={`px-3 py-1.5 border-2 text-xs font-bold uppercase transition-all cursor-pointer ${
                roleFilter === item.key
                  ? 'border-stone-800 dark:border-[#4ade80] bg-[#1a5336] dark:bg-[#4ade80] text-white dark:text-stone-950 shadow-[2px_2px_0px_#000]'
                  : 'border-stone-800 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#141b16] shadow-[6px_6px_0px_#1a5336] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100 dark:bg-[#18261e] border-b-2 border-stone-800 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'User Profile' : 'Hồ Sơ Thành Viên'}</th>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Contact Phone' : 'Số Điện Thoại'}</th>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Role' : 'Vai Trò'}</th>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{isEn ? 'Province' : 'Khu Vực'}</th>
                <th className="px-4 py-3 border-r-2 border-stone-300 dark:border-stone-800">{t('common.status', 'Email')}</th>
                <th className="px-4 py-3 text-right">{t('common.actions', 'Thao Tác')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-stone-200 dark:divide-stone-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    <RotateCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#1a5336]" />
                    <span>[ĐANG TẢI DANH BẠ NGƯỜI DÙNG...]</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-bold">
                    [KHÔNG TÌM THẤY NGƯỜI DÙNG PHÙ HỢP TIÊU CHÍ]
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-stone-50 dark:hover:bg-[#0d1410] transition-colors">
                    {/* User Info */}
                    <td className="px-4 py-3 border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                      <div className="flex items-center gap-2.5">
                        {user.avartar_url || user.avatar_url || user.avatar ? (
                          <img
                            src={user.avartar_url || user.avatar_url || user.avatar}
                            alt=""
                            className="w-8 h-8 object-cover border-2 border-stone-800 shrink-0 shadow-[1px_1px_0px_#000]"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 border-2 border-stone-800 flex items-center justify-center text-xs font-bold text-stone-700 dark:text-stone-300">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100">
                            {user.name || (isEn ? 'Not updated' : 'Chưa cập nhật tên')}
                          </div>
                          <div className="text-[10px] text-stone-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 text-stone-800 dark:text-stone-200 font-bold text-[11px] border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                      {user.phone ? `0${user.phone}` : '—'}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 border-r-2 border-dashed border-stone-200 dark:border-stone-800">{getRoleBadge(user.role)}</td>

                    {/* Province */}
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300 border-r-2 border-dashed border-stone-200 dark:border-stone-800">{user.province || '—'}</td>

                    {/* Verification Status */}
                    <td className="px-4 py-3 border-r-2 border-dashed border-stone-200 dark:border-stone-800">
                      {user.isEmailVerified !== false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> ĐÃ XÁC THỰC
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          <AlertCircle className="w-3 h-3" /> CHƯA XÁC THỰC
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenRoleModal(user)}
                        className="px-2.5 py-1.5 border-2 border-stone-800 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-[11px] font-bold uppercase text-stone-900 dark:text-stone-100 inline-flex items-center gap-1 shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <Edit2 className="w-3 h-3 text-[#1a5336] dark:text-[#4ade80]" />
                        <span>{isEn ? 'Change Role' : 'Đổi Quyền'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
            onClick={() => setIsRoleModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-[#141b16] border-2 border-stone-800 dark:border-stone-700 p-6 shadow-[6px_6px_0px_#1a5336] space-y-4 text-xs animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-800">
              <h3 className="font-serif font-black text-sm text-stone-900 dark:text-stone-50">
                {isEn ? 'User Role & Permissions' : 'Điều Chỉnh Phân Quyền'}
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 border border-stone-800 text-stone-700 hover:bg-rose-700 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="p-2 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#0d1410]">
                <span className="text-stone-500 text-[10px] block uppercase">TÀI KHOẢN ĐƯỢC CHỌN:</span>
                <strong className="text-stone-900 dark:text-stone-100">{selectedUser.name || selectedUser.email}</strong>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-stone-800 dark:text-stone-200">
                  {isEn ? 'Select new role:' : 'Chọn vai trò mới:'}
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: 'user',
                      label: isEn ? '[CLIENT // THÀNH VIÊN]' : '[THÀNH VIÊN TƯ VẤN]',
                      desc: isEn ? 'Book consultations and subscribe packages' : 'Đặt lịch tư vấn và mua gói dịch vụ',
                    },
                    {
                      value: 'lawyer',
                      label: isEn ? '[LAWYER // LUẬT SƯ]' : '[LUẬT SƯ CHÍNH NGẠCH]',
                      desc: isEn ? 'Advise clients, receive appointments, publish videos' : 'Tư vấn, nhận booking, tạo video',
                    },
                    {
                      value: 'admin',
                      label: isEn ? '[ADMINISTRATOR]' : '[QUẢN TRỊ VIÊN HỆ THỐNG]',
                      desc: isEn ? 'Full system management control' : 'Toàn quyền kiểm soát và duyệt nghiệp vụ',
                    },
                  ].map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-2.5 p-2.5 border-2 cursor-pointer transition-all ${
                        newRole === r.value
                          ? 'bg-[#1a5336]/10 border-[#1a5336] dark:border-[#4ade80] shadow-[2px_2px_0px_#000]'
                          : 'bg-white dark:bg-[#0d1410] border-stone-800 hover:bg-stone-50 dark:hover:bg-[#18261e]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={newRole === r.value}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="mt-0.5 text-[#1a5336] focus:ring-0"
                      />
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100">{r.label}</div>
                        <div className="text-[10px] text-stone-500">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-stone-800 font-mono">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 border-2 border-stone-800 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-300 font-bold uppercase shadow-[2px_2px_0px_#000]"
              >
                {t('common.cancel', 'HỦY')}
              </button>
              <button
                onClick={handleSaveRole}
                disabled={isUpdating}
                className="px-5 py-2 border-2 border-stone-900 bg-[#1a5336] hover:bg-[#22774a] text-white font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (isEn ? 'Saving...' : 'ĐANG LƯU...') : (isEn ? 'Confirm Role Change' : 'XÁC NHẬN ĐỔI')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
