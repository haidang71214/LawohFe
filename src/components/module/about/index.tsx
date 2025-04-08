import React from 'react';
import styles from './AboutUs.module.css';
import Image from 'next/image';
import NewFeedComponetns from '../../NewFeedComponetns';

const AboutUs = () => {
  return (
    <div className={styles.aboutUsPage}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerHeading}>Dịch vụ pháp lý đỉnh cao, luôn bên bạn!</h1>
          <p className={styles.headerDescription}>LAWOH mang đến giải pháp nhanh chóng, chi phí hợp lý và dễ tiếp cận cho mọi nhu cầu pháp lý của bạn</p>
        </div>
      </header>
      
      <div className={styles.missionVision}>
        <h1 className={styles.title}>SỨ MỆNH <span>VÀ</span> TẦM NHÌN</h1>
        
        <div className={styles.content}>
          <p className={styles.missionText}>
            Sứ mệnh: Group LAWOH cam kết hỗ trợ hiệu quả bằng cách cung cấp các giải pháp pháp lý nhanh chóng, chi phí hợp lý và dễ tiếp cận, giúp cá nhân và doanh nghiệp bận rộn giải quyết vấn đề một cách chuyên nghiệp, minh bạch và đáng tin cậy. Chúng tôi đồng hành tận tâm cùng khách hàng trên hành trình bảo vệ quyền lợi và phát triển sự nghiệp, thông qua các dịch vụ như tư vấn, thuế luật sư, mẫu đơn từ và khóa học pháp lý.
          </p>
          
          <p className={styles.visionText}>
            Tầm nhìn: Group LAWOH hướng tới trở thành nền tảng pháp lý hàng đầu tại Việt Nam, mang đến dịch vụ chất lượng cao với công nghệ hiện đại, xây dựng một cộng đồng hiểu biết và tuân thủ pháp luật. Chúng tôi không ngừng đổi mới để phát triển bền vững, góp phần định hình một môi trường pháp lý công bằng và hiện đại cho mọi người.
          </p>
        </div>
      </div>

      <div className={styles.statistics}>
        <div className={styles.statsContent}>
          <h2 className={styles.statsTitle}>Những con số ấn tượng</h2>
          <p className={styles.statsDescription}>
            LAWOH tự hào đạt được những thành tựu đáng ghi nhận trong hành trình đồng hành cùng khách hàng
          </p>
          
          <div className={styles.statsGrid}>
            <div className={styles.statsItem}>
              <h3>500+</h3>
              <p>Vụ kiện thành công</p>
            </div>
            <div className={styles.statsItem}>
              <h3>200%</h3>
              <p>Phát triển trên mỗi năm</p>
            </div>
            <div className={styles.statsItem}>
              <h3>$50m</h3>
              <p>Tổng vốn hóa</p>
            </div>
            <div className={styles.statsItem}>
              <h3>1k+</h3>
              <p>Người hài lòng về dịch vụ</p>
            </div>
          </div>
        </div>
        
        <div className={styles.statsImage}>
          <Image 
            src="/hehehoho.avif"
            alt="Law gavel and documents"
            width={500}
            height={400}
            objectFit="cover"
          />
        </div>
      </div>
   <NewFeedComponetns/>
    </div>
  );
};

export default AboutUs;