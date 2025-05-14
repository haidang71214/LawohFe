"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './navbar.module.css';
import { LawyerCategories } from './EnumCommon';
import { Button } from '@heroui/button';

import { addToast } from '@heroui/toast';
import { usePathname, useRouter } from 'next/navigation';
import { LOGIN_USER, USER_PROFILE } from '@/constant/enum';
import { axiosInstance } from '@/fetchApi';


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter()
  // Đảm bảo trạng thái động chỉ được áp dụng sau khi hydration hoàn tất
  const pathname = usePathname();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const [user, setUser] = useState<any>(null);
 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem(LOGIN_USER); // Lấy token từ localStorage
        if (token) {
          const response = await axiosInstance.get('/auth/getMySelf', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = response.data.data || response.data; // Giả định cấu trúc response
          setUser(userData);
        } else {
          setUser(null); // Nếu không có token, set user là null
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setUser(null); // Xử lý lỗi bằng cách set user là null
      }
    };

    fetchUserData();
  }, [pathname]); // Re-fetch khi route thay đổi

  const handleUpdateInfo = () => {
    router.push('/update-profile'); // Điều hướng đến trang cập nhật thông tin
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Để quản lý trạng thái của dropdown
  const dropdownRef = useRef(null); // Tham chiếu đến dropdown
  const avatarRef = useRef(null); // Tham chiếu đến avatar
  // Hàm bật/tắt dropdown khi bấm vào avatar
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Hàm đi đến danh sách đặt (booking list)
  const handleBookingList = () => {
    router.push('/booking-list'); // Điều hướng đến trang danh sách đặt
  };
  const handleLogout = () => {
    // Clear the local storage
   localStorage.removeItem(LOGIN_USER);
  localStorage.removeItem(USER_PROFILE);

  // Reset the user state to null after logout
  setUser(null);

  console.log(localStorage);
    
    // Show toast for successful logout
    addToast({
      title: "🎉 Đăng xuất thành công!",
      description: "Chúc bạn một ngày tốt lành! 💼",
      color: "success",
      variant: "flat",
      timeout: 3000,
    });
  };
  
  // Nếu chưa mounted, render HTML tĩnh giống server
  if (!isMounted) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={210}
              height={56}
              className={styles.logoImage}
              priority
            />
          </Link>

          <button className={styles.mobileMenuButton}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              Trang chủ
            </Link>
            <Link href="/about" className={styles.navLink}>
              Giới thiệu
            </Link>
            <div className="relative group">
              <button className={`${styles.navLink} flex items-center gap-2`}>
                Dịch vụ
                <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                  <path d="M6.5 10L0.5 0H12.5L6.5 10Z" fill="currentColor"/>
                </svg>
              </button>
              <div className={styles.dropdownMenu}>
                <Link href="/services" className={styles.dropdownItem}>Tổng quan</Link>
                <Link href="/consultationAI" className={styles.dropdownItem}>Tư vấn với AI</Link>
                <Link href="/courses" className={styles.dropdownItem}>Khóa học</Link>
                <Link href="/documents" className={styles.dropdownItem}>Mẫu đơn từ</Link>
                <Link href="/packages" className={styles.dropdownItem}>Gói dịch vụ</Link>
                <Link href="/hire-lawyer" className={styles.dropdownItem}>Thuê luật sư</Link>
              </div>
            </div>

            <Link href="/contact" className={styles.navLink}>
              Liên hệ
            </Link>
            <Link href="/blog" className={styles.navLink}>
              Tin tức
            </Link>
            <div className="relative group">
              <button className={`${styles.navLink} flex items-center gap-2`}>
                Luật sư tốt theo lĩnh vực
                <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                  <path d="M6.5 10L0.5 0H12.5L6.5 10Z" fill="currentColor"/>
                </svg>
              </button>
              <div className={styles.dropdownMenu}>
                {Object.entries(LawyerCategories).map(([key, value]) => (
                  <Link
                    key={key}
                    href={`/lawyers/${key.toLowerCase()}`}
                    className={styles.dropdownItem}
                  >
                    {value}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{color:'white',display:'flex'}}>
            <Link href="/login" className={styles.navLink}>
              Đăng nhập
            </Link>
            /
            <Link href="/register" className={styles.navLink}>
              Đăng kí
            </Link>
          </div>
        </div>
      </nav>
    );
  }
  // Sau khi mounted, render với trạng thái động
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={210}
            height={56}
            className={styles.logoImage}
            priority
          />
        </Link>

        <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
          <Link href="/" className={styles.navLink}>
            Trang chủ
          </Link>
          <Link href="/about" className={styles.navLink}>
            Giới thiệu
          </Link>
          <div className="relative group">
            <button className={`${styles.navLink} flex items-center gap-2`}>
              Dịch vụ
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M6.5 10L0.5 0H12.5L6.5 10Z" fill="currentColor"/>
              </svg>
            </button>
            <div className={styles.dropdownMenu}>
              <Link href="/services" className={styles.dropdownItem}>Tổng quan</Link>
              <Link href="/consultationAI" className={styles.dropdownItem}>Tư vấn với AI</Link>
              <Link href="/courses" className={styles.dropdownItem}>Khóa học</Link>
              <Link href="/documents" className={styles.dropdownItem}>Mẫu đơn từ</Link>
              <Link href="/packages" className={styles.dropdownItem}>Gói dịch vụ</Link>
              <Link href="/hire-lawyer" className={styles.dropdownItem}>Thuê luật sư</Link>
            </div>
          </div>

          <Link href="/contact" className={styles.navLink}>
            Liên hệ
          </Link>
          <Link href="/blog" className={styles.navLink}>
            Tin tức
          </Link>
          <div className="relative group">
            <Link href={`/lawyers`} className={`${styles.navLink} flex items-center gap-2`}>
              Luật sư tốt theo lĩnh vực
            </Link>
          </div>
        </div>
        <div style={{color:'white',display:'flex'}}>
        {user ? (
          <div
            className="relative"
            onMouseLeave={() => setIsDropdownOpen(false)} // Ẩn dropdown khi chuột di ra ngoài
          >
            {/* Avatar của người dùng */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', transition: 'background 0.2s',fontFamily:'monospace' }}>
            <img
              src={user?.avartar_url}
              width={40}
              height={40}
              alt="avatar"
              className="rounded-full cursor-pointer"
              onClick={toggleDropdown} // Khi bấm vào avatar, toggle dropdown
              ref={avatarRef}
            />
            <div>
            <div>{user.name}</div>
            <div>{user.role}</div>
            </div>
            </div>
            {isDropdownOpen && (
              <div
                ref={dropdownRef} // Đảm bảo dropdown có thể nhận sự kiện hover ra ngoài
                className="absolute right-1 mt-0 w-48 bg-white shadow-lg rounded-lg z-10"
              >
                <Button onPress={handleUpdateInfo} fullWidth style={{color:'black'}}>Update Information</Button>
                <Button onPress={handleBookingList} fullWidth style={{color:'black'}}>Booking List</Button>
                <Button onPress={handleLogout} fullWidth style={{color:'black'}}>Đăng xuất</Button>
              </div>
            )}
          </div>
        ) : (
          <div style={{color:'white',display:'flex'}}>
          <Link href="/login" className={styles.navLink}>
            Đăng nhập
          </Link>
          /
          <Link href="/register" className={styles.navLink}>
            Đăng kí
          </Link>
        </div>
        )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;