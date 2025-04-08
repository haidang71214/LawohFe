"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './navbar.module.css';
import { LawyerCategories } from './EnumCommon';


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
            <button className={`${styles.navLink} flex items-center gap-2`}>
              Luật sư tốt theo lĩnh vực
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M6.5 10L0.5 0H12.5L6.5 10Z" fill="currentColor"/>
              </svg>
            </button>
            <div className={styles.dropdownMenu}>
              {Object.values(LawyerCategories).map((category: string) => (
                <Link key={category} href="#" className={styles.dropdownItem}>{category}</Link>
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
};

export default Navbar; 