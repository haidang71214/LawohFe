// components/Navbar.tsx
'use client';

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
import { Avatar } from '@heroui/react';
import SliderChatUser from './SliderChatUser';
import UserChatLawyer from './userChatLawyer';
import { useChat } from './chatContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isChatOpen, currentConversationId, currentLawyerId, openChat, closeChat } = useChat();

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
        const token = localStorage.getItem(LOGIN_USER);
        if (token) {
          const response = await axiosInstance.get('/auth/getMySelf', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = response.data.data || response.data;
          setUser(userData);
          localStorage.setItem(USER_PROFILE, JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem(USER_PROFILE);
        }
      } catch (err) {
        console.log('Failed to fetch user data:', err);
        setUser(null);
        localStorage.removeItem(USER_PROFILE);
      }
    };

    fetchUserData();
  }, [pathname]);

  const handleUpdateInfo = () => {
    router.push('/update-profile');
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleBookingList = () => {
    router.push('/booking-list');
  };

  const handleAcceptedBookings = () => {
    router.push('/booking-listForLaywer');
  };

  const detailLaywerInforMation = () => {
    router.push('/update-LawyerDetailInformation');
  };

  const handleLogout = () => {
    localStorage.removeItem(LOGIN_USER);
    localStorage.removeItem(USER_PROFILE);
    setUser(null);
    addToast({
      title: "🎉 Đăng xuất thành công!",
      description: "Chúc bạn một ngày tốt lành! 💼",
      color: "success",
      variant: "flat",
      timeout: 3000,
    });
  };

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
                Mẫu đơn từ
                <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                  <path d="M6.5 10L0.5 0H12.5L6.5 10Z" fill="currentColor" />
                </svg>
              </button>
              <div className={styles.dropdownMenu}>
                {Object.entries(LawyerCategories).map(([key, value]) => (
                  <Link
                    key={key}
                    href={`/document/${key}`}
                    className={styles.dropdownItem}
                  >
                    {value}
                  </Link>
                ))}
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
                  <path d="M6.5 10L0.5 0H12.5L6.5 10Z" fill="currentColor" />
                </svg>
              </button>
              <div className={styles.dropdownMenu}>
                {Object.entries(LawyerCategories).map(([key, value]) => (
                  <Link
                    key={key}
                    href={`/lawyers/${key}`}
                    className={styles.dropdownItem}
                  >
                    {value}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{ color: 'white', display: 'flex' }}>
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
              Mẫu đơn từ
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M6.5 10L0.5 0H12.5L6.5 10Z" fill="currentColor" />
              </svg>
            </button>
            <div className={styles.dropdownMenu}>
              {Object.entries(LawyerCategories).map(([key, value]) => (
                <Link
                  key={key}
                  href={`/document/${key}`}
                  className={styles.dropdownItem}
                >
                  {value}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/course" className={styles.navLink}>
            Video
          </Link>
          <Link href="/ai" className={styles.navLink}>
            AI
          </Link>
          <div className="relative group">
            <Link href={`/lawyers`} className={`${styles.navLink} flex items-center gap-2`}>
              Luật sư tốt theo lĩnh vực
            </Link>
          </div>
        </div>

        <div style={{ color: 'white', display: 'flex' }}>
          {user ? (
            <div
              className="relative"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                  fontFamily: 'monospace',
                }}
              >
                <Avatar
                  src={user?.avartar_url || '/default-avatar.png'}
                  alt="avatar"
                  className="rounded-full cursor-pointer"
                  onClick={toggleDropdown}
                  ref={avatarRef}
                  isBordered
                  color="default"
                />
                <div>
                  <div>{user.name}</div>
                  <div>{user.role}</div>
                </div>
                <div>
                <Button
                  onClick={() => openChat(null, '')} // Open SliderChatUser without a specific conversation
                  style={{ marginLeft: '10px' }}
                >
                  Chat
                </Button>
                <Link href="/videoself">
                Quản lí video
               </Link>
                </div>
                
              </div>
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute w-48 bg-white shadow-lg rounded-lg z-10"
                >
                  <Button onPress={handleUpdateInfo} fullWidth style={{ color: 'black' }}>
                    Cập nhật thông tin
                  </Button>
                  <Button onPress={handleBookingList} fullWidth style={{ color: 'black' }}>
                    Booking đã gửi
                  </Button>
                  {user.role === 'lawyer' && (
                    <Button onPress={handleAcceptedBookings} fullWidth style={{ color: 'black' }}>
                      Booking đã nhận
                    </Button>
                  )}
                  {user.role === 'lawyer' && (
                    <Button onPress={detailLaywerInforMation} fullWidth style={{ color: 'black' }}>
                      Cập nhật với vai trò luật sư
                    </Button>
                  )}
                  <Button onPress={handleLogout} fullWidth style={{ color: 'black' }}>
                    Đăng xuất
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'white', display: 'flex' }}>
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
      {isChatOpen && (
        <>
          <SliderChatUser
            onClose={closeChat}
            onSelectConversation={(conversationId: string) => openChat(conversationId, '')}
          />
          {currentConversationId && currentLawyerId !== null && (
            <UserChatLawyer id={currentConversationId} onClose={closeChat} />
          )}
        </>
      )}
    </nav>
  );
};

export default Navbar;