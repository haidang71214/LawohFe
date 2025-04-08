import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <Image  src="/logo.png"
            alt="Logo"
            width={210}
            height={56} className={styles.logoImage} priority  />
        <div className={styles.linksSection}>
          <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
          <Link href="/faq" className={styles.footerLink}>FAQ</Link>
          <Link href="/support" className={styles.footerLink}>Support</Link>
          <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
        </div>
        <div className={styles.socialIcons}>
          <a href="#" className={styles.icon}><svg viewBox="0 0 24 24" fill="white"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg></a>
          <a href="#" className={styles.icon}><svg viewBox="0 0 24 24" fill="white"><path d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 19.4 19.4 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2ZM7.6 4C5.61 4 4 5.61 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4C18.39 20 20 18.39 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6ZM17.25 5.5C17.94 5.5 18.5 6.06 18.5 6.75C18.5 7.44 17.94 8 17.25 8C16.56 8 16 7.44 16 6.75C16 6.06 16.56 5.5 17.25 5.5ZM12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" /></svg></a>
          <a href="#" className={styles.icon}><svg viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
          <a href="#" className={styles.icon}><svg viewBox="0 0 24 24" fill="white"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg></a>
          <a href="#" className={styles.icon}><svg viewBox="0 0 24 24" fill="white"><path d="M10 15l5.19-3L10 9v6m11.79-5.14c.3-.3.3-.79 0-1.09l-3.5-3.5a.758.758 0 0 0-1.08 0l-3.5 3.5c-.3.3-.3.79 0 1.09l3.5 3.5c.3.3.79.3 1.08 0l3.5-3.5zM2.21 5.14c.3.3.3.79 0 1.09l-3.5 3.5a.758.758 0 0 1-1.08 0l-3.5-3.5a.758.758 0 0 1 0-1.09l3.5-3.5c.3-.3.79-.3 1.08 0l3.5 3.5z" /></svg></a>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 Lawoh. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
            <Link href="/cookies" className={styles.footerLink}>Cookies Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 