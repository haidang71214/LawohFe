import React from 'react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import styles from './HomePage.module.css';

import Services from '@/components/Services';
import Hero from '@/components/module/Hero/Hero';
import FAQ from '@/components/module/FAQ/FAQ';
import LawyerRanking from '@/components/module/LawyerRanking/LawyerRanking';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <Navbar />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.headerHeading}>Stress Less, Find the best!</h1>
            <p className={styles.headerDescription}>Tư vấn pháp lý, tìm kiếm luật sư theo mong muốn của bạn, cung cấp mẫu đơn từ và khóa học luật - tất cả trong tầm tay bạn.</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.actionButton}>Bạn gặp vấn đề gì ?</button>
          </div>
        </div>
      </header>
      <Hero/>
      <Services/>
      <FAQ/>
      <LawyerRanking/>
      <Footer />
    </div>
  );
};

export default HomePage;
