import React from 'react';
import Link from 'next/link';
import styles from './Services.module.css';
import { ImHeadphones } from "react-icons/im";
import { FaBalanceScale, FaFileAlt, FaBook } from "react-icons/fa";

const Services = () => {
  const services = [
    {
      icon: <ImHeadphones />,
      title: 'Tư vấn (Consultation)',
      description: 'AI tư vấn miễn phí các vấn đề pháp lý cơ bản 24/24 hoặc liên hệ luật sư để nhận tư vấn chuyên sâu.',
      link: '/consultation'
    },
    {
      icon: <FaBalanceScale />,
      title: 'Thuê luật sư (Hire a Lawyer)',
      description: 'Liên hệ với các luật sư uy tín, phù hợp với mong muốn của bạn',
      link: '/lawyers'
    },
    {
      icon: <FaFileAlt />,
      title: 'Mẫu đơn từ (Legal Templates)',
      description: 'Cung cấp các mẫu đơn từ pháp lý để người dùng tải về và sử dụng cho cá nhân và doanh nghiệp',
      link: '/templates'
    },
    {
      icon: <FaBook />,
      title: 'Khóa học (Course)',
      description: 'Khóa học pháp luật cơ bản đến nâng cao, hay các khóa học chuyên sâu theo từng lĩnh vực, cung cấp kiến thức giúp bạn giải quyết vấn đề.',
      link: '/courses'
    }
  ];

  return (
    <section className={styles.services}>
      <div style={{display:'flex'}} className={styles.container}>
        <div style={{marginRight:'200px',width:'700px',height:"50px"}} className={styles.header}>
          <h2>Dịch vụ pháp lý toàn diện</h2>
          <p>Tiết kiệm thời gian, chi phí hợp lý, dễ dàng tiếp cận.</p>
          <Link href="/consultation" className={styles.bookConsultation}>
            Book a consultation
          </Link>
        </div>
        {/* chỗ này */}
        <div className={styles.grid}>
          {services.map((service, index) => (
            <Link href={service.link} key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{service.icon}</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className={styles.learnMore}>
                Tìm hiểu thêm
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;