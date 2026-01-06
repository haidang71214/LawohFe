import { useState, useEffect } from 'react';

export interface ProvinceItem {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  phone_code?: number;
}

// Full standard fallback list of 63 Vietnamese provinces/cities
export const DEFAULT_VIETNAM_PROVINCES: string[] = [
  'Hà Nội',
  'TP Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

const CACHE_KEY = 'VN_PROVINCES_CACHE';

export function useProvinces() {
  const [provinces, setProvinces] = useState<string[]>(DEFAULT_VIETNAM_PROVINCES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProvinces = async () => {
      // 1. Check local storage cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProvinces(parsed);
            return;
          }
        }
      } catch {
        // Continue to API fetch
      }

      setLoading(true);
      try {
        // 2. Fetch from Open API Provinces (GitHub: sunh/provinces.open-api.vn)
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        if (!res.ok) throw new Error('API fetch failed');
        const data: ProvinceItem[] = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          // Format province names cleanly (remove prefix 'Tỉnh ' / 'Thành phố ' for friendly matching or keep clean names)
          const formattedList = data.map((item) => {
            return item.name
              .replace(/^(Thành phố|Tỉnh)\s+/i, '')
              .trim();
          });

          // Sort alphabetically with Vietnamese locale
          formattedList.sort((a, b) => a.localeCompare(b, 'vi'));

          if (isMounted) {
            setProvinces(formattedList);
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(formattedList));
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch {
        // Fallback already in initial state
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  return { provinces, loading };
}
