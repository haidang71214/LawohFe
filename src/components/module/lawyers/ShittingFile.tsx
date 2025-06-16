'use client';
import { axiosInstance } from '@/fetchApi';
import { Image, Link } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import styles from '../document/DocumentCard.module.css';

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
  INTELLECTUAL_PROPERTY = 'Sở hữu trí tuệ',
  INHERITANCE = 'Thừa kế - Di chúc',
  TAX = 'Thuế',
}

export default function ShittingFile() {
  interface LawyerType {
    _id: string;
    type: string[];
    lawyer_id: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }

  interface Lawyer {
    _id: string;
    name: string;
    star: number; // Sử dụng 'star' thay vì 'start' hoặc 'stars'
    typeLawyer: LawyerType | string;
    role: string;
    province: string;
    avartar_url: string;
  }

  const [star, setStar] = useState<number | undefined>(undefined); // Sử dụng 'star' thay vì 'start' hoặc 'stars'
  const [typeLawyer, setTypeLawyer] = useState<string | undefined>(undefined);
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const starOptions = [1, 2, 3, 4, 5]; // Tên giữ nguyên nhưng sẽ khớp với 'star'
  const typeLawyerOptions = Object.entries(LawyerCategories).map(([key, value]) => ({
    value: key,
    label: value,
  }));
  const provinceOptions = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cao Bằng', 'Cần Thơ', 'Cà Mau', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hòa Bình', 'Hậu Giang', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên - Huế', 'Tiền Giang', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];

  const fetchLawyers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = { page, limit };
      if (typeLawyer && Object.keys(LawyerCategories).includes(typeLawyer)) {
        params.typeLawyer = typeLawyer;
      }
      if (province) params.province = province;

      const response = await axiosInstance.get('/lawyer/filterLawyer', { params });
      const { data: lawyerData, pagination } = response.data;

      if (Array.isArray(lawyerData)) {
        const processedLawyers: Lawyer[] = lawyerData.map((item: any, index: number) => {
          let typeLawyerValue: LawyerType | string = 'UNKNOWN';
          if (item.typeLawyer && typeof item.typeLawyer === 'object' && item.typeLawyer.type) {
            typeLawyerValue = {
              _id: item.typeLawyer._id || `temp-type-${index}`,
              type: item.typeLawyer.type || ['UNKNOWN'],
              lawyer_id: item.typeLawyer.lawyer_id || item._id,
              createdAt: item.typeLawyer.createdAt,
              updatedAt: item.typeLawyer.updatedAt,
              __v: item.typeLawyer.__v,
            };
          } else if (item.typeLawyer && typeof item.typeLawyer === 'string') {
            typeLawyerValue = item.typeLawyer;
          }

          return {
            _id: item._id || `temp-${index}`,
            name: item.name || 'Tên không xác định',
            star: item.star || 0, // Sử dụng 'star' thay vì 'start' hoặc 'stars'
            typeLawyer: typeLawyerValue,
            role: item.role || 'Không xác định',
            province: item.province || 'Không xác định',
            avartar_url: item.avartar_url || "null",
          };
        });
        setLawyers(processedLawyers);
        setTotal(pagination?.total || 0);
      } else {
        throw new Error('Dữ liệu trả về từ API không phải là mảng.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách luật sư.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, [typeLawyer, province, page]);

  useEffect(() => {
    let filtered = lawyers;
    if (star !== undefined) {
      filtered = filtered.filter((lawyer) => lawyer.star === star); // Sử dụng 'star' thay vì 'start' hoặc 'stars'
    }
    setFilteredLawyers(filtered);
  }, [star, lawyers]);

  const getTypeLawyerLabel = (typeLawyerValue: LawyerType | string | undefined): string => {
    if (!typeLawyerValue) return 'Không xác định';
    if (typeof typeLawyerValue === 'string') {
      return LawyerCategories[typeLawyerValue as keyof typeof LawyerCategories] || typeLawyerValue;
    }
    if (typeof typeLawyerValue === 'object' && Array.isArray(typeLawyerValue.type)) {
      return typeLawyerValue.type
        .map((type) => LawyerCategories[type as keyof typeof LawyerCategories] || type)
        .join(', ');
    }
    return 'Không xác định';
  };

  const totalPages = Math.ceil(total / limit);
  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className={styles.cardContainer} style={{paddingTop:'80px'}}>
      <div className={styles.mainContent}>
        <h1 className={styles.header}>
          Lọc danh sách luật sư <span className={styles.headerSpan}></span>
        </h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-200">Số sao</label>
            <select
              value={star ?? ''} // Sử dụng 'star' thay vì 'start' hoặc 'stars'
              onChange={(e) => setStar(e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 p-2 border rounded-md w-40 bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            >
              <option value="">Tất cả</option>
              {starOptions.map((starValue) => (
                <option key={starValue} value={starValue}>
                  {starValue} sao
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">Chuyên ngành</label>
            <select
              value={typeLawyer ?? ''}
              onChange={(e) => setTypeLawyer(e.target.value || undefined)}
              className="mt-1 p-2 border rounded-md w-40 bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
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
            <label className="block text-sm font-medium text-gray-200">Tỉnh/Thành phố</label>
            <select
              value={province ?? ''}
              onChange={(e) => setProvince(e.target.value || undefined)}
              className="mt-1 p-2 border rounded-md w-40 bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
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

        {loading && <p className={styles.loading}>Đang tải...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && filteredLawyers.length === 0 && (
          <p className={styles.noForms}>Không tìm thấy luật sư nào.</p>
        )}
        {!loading && !error && filteredLawyers.length > 0 && (
          <div className={styles.cardGrid}>
            {filteredLawyers.map((lawyer, index) => (
              <div
                key={lawyer._id}
                className={`${styles.card} ${styles.cardItem}`}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className={styles.cardContent}>
                  <Image
                    alt="Card background"
                    className="object-cover rounded-xl"
                    src={lawyer.avartar_url !== "null" ? lawyer.avartar_url : "/default-avatar.png"}
                    width={250}
                    height={200}
                    loading="lazy"
                    style={{ borderRadius: '20px' }}
                  />
                  <h2 className={styles.cardTitle}>{lawyer.name}</h2>
                  <p className={styles.cardDescription}>
                    Chuyên ngành: {getTypeLawyerLabel(lawyer.typeLawyer)}
                  </p>
                  <p className={styles.cardDescription}>Khu vực: {lawyer.province}</p>
                  <p className={styles.cardDescription}>Vai trò: {lawyer.role}</p>
                  <p className={styles.cardDescription} style={{ color: '#f59e0b' }}>
                    {'★'.repeat(lawyer.star)} {/* Sử dụng 'star' thay vì 'start' hoặc 'stars' */}
                  </p>
                </div>
                <div className={styles.cardFooter}>
                  <Link
                    href={`/lawyerDetail/${lawyer._id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    Xem chi tiết luật sư
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !error && filteredLawyers.length > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md text-sm ${
                page === 1 ? 'bg-gray-600 cursor-not-allowed text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Trang trước
            </button>
            <span className={styles.pageInfo}>
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-md text-sm ${
                page === totalPages ? 'bg-gray-600 cursor-not-allowed text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}