"use client";
import { axiosInstance } from '@/fetchApi';
import React, { useEffect, useState } from 'react';

export enum LawyerCategories {
  INSURANCE = 'Bảo hiểm',
  CIVIL = 'Dân sự',
  LAND = 'Đất đai',
  BUSINESS = 'Doanh nghiệp',
  TRANSPORTATION = 'Giao thông - Vận tải',
  ADMINISTRATIVE = 'Hành chính',
  CRIMINAL = 'Hình sự',
  FAMILY = 'Hôn nhân gia đình',
  LABOR = 'Lao động',
  INTELLECTUALPROPERTY = 'Sở hữu trí tuệ',
  INHERITANCE = 'Thừa kế - Di chúc',
  TAX = 'Thuế',
}

export default function ShittingFile() {
  // Định nghĩa kiểu cho dữ liệu luật sư
  interface Lawyer {
    _id: string;
    name: string;
    stars: number;
    typeLawyer: string;
    role: string;
    province: string;
  }

  // State cho các bộ lọc
  const [stars, setStars] = useState<number | undefined>(undefined);
  const [typeLawyer, setTypeLawyer] = useState<string | undefined>(undefined);
  const [province, setProvince] = useState<string | undefined>(undefined);

  // State cho danh sách luật sư và trạng thái tải
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log(lawyers);

  // Các tùy chọn cho dropdown
  const starOptions = [1, 2, 3, 4, 5];
  const typeLawyerOptions = Object.entries(LawyerCategories).map(([key, value]) => ({
    value: key,
    label: value,
  }));
  const provinceOptions = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'];

  const fetchLawyers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {};
      if (stars !== undefined) params.stars = stars;
      if (typeLawyer && Object.keys(LawyerCategories).includes(typeLawyer)) {
        params.typeLawyer = typeLawyer;
      }
      if (province) params.province = province;

      const response = await axiosInstance.get('/lawyer/filterLawyer', { params });
      console.log('API Response:', response.data); // Log để kiểm tra cấu trúc dữ liệu
      const lawyerData = response.data.data || response.data || [];
      if (Array.isArray(lawyerData)) {
        const processedLawyers: Lawyer[] = lawyerData.map((item: any, index: number) => ({
          _id: item._id || `temp-${index}`, // Sử dụng _id hoặc tạo tạm nếu thiếu
          name: item.name || 'Tên không xác định',
          stars: item.stars || 0,
          typeLawyer: item.type || item.typeLawyer || 'UNKNOWN',
          role: item.role || 'Không xác định',
          province: item.province || 'Không xác định',
        }));
        setLawyers(processedLawyers);
      } else {
        throw new Error('Dữ liệu trả về từ API không phải là mảng.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách luật sư.');
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchLawyers khi component mount hoặc các bộ lọc thay đổi
  useEffect(() => {
    fetchLawyers();
  }, [stars, typeLawyer, province]);

  // Hàm chuyển đổi typeLawyer từ key sang value để hiển thị
  const getTypeLawyerLabel = (typeLawyerValue: string | undefined): string => {
    if (!typeLawyerValue) return 'Không xác định';
    return LawyerCategories[typeLawyerValue as keyof typeof LawyerCategories] || typeLawyerValue;
  };

  return (
    <div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Lọc danh sách luật sư</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Số sao</label>
            <select
              value={stars ?? ''}
              onChange={(e) => setStars(e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 p-2 border rounded-md w-40"
            >
              <option value="">Tất cả</option>
              {starOptions.map((star) => (
                <option key={star} value={star}>
                  {star} sao
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
            <select
              value={typeLawyer ?? ''}
              onChange={(e) => setTypeLawyer(e.target.value || undefined)}
              className="mt-1 p-2 border rounded-md w-40"
            >
              <option value="">Tất cả</option>
              {typeLawyerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
            <select
              value={province ?? ''}
              onChange={(e) => setProvince(e.target.value || undefined)}
              className="mt-1 p-2 border rounded-md w-40"
            >
              <option value="">Tất cả</option>
              {provinceOptions.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading && <p className="text-center text-gray-500">Đang tải...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && lawyers.length === 0 && (
          <p className="text-center text-gray-500">Không tìm thấy luật sư nào.</p>
        )}
        {!loading && !error && lawyers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lawyers.map((lawyer) => (
              <div key={lawyer._id} className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold">{lawyer.name}</h2>
                <p className="text-sm text-gray-600">
                  Chuyên ngành: {getTypeLawyerLabel(lawyer.typeLawyer)}
                </p>
                <p className="text-sm text-gray-600">Khu vực: {lawyer.province}</p>
                <p className="text-sm text-gray-600">Vai trò: {lawyer.role}</p>
                <p className="text-sm text-yellow-500">{'★'.repeat(lawyer.stars)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}