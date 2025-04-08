import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>Legis AI sẵn sàng hỗ trợ bạn bất cứ lúc nào</h1>
          <p className={styles.description}>
            Trí tuệ nhân tạo được tích hợp đầy đủ và tiên tiến nhất để phục vụ bạn trong việc giải quyết các vấn đề liên quan đến luật pháp
          </p>
          <ul className={styles.featureList}>
            <li>AI tư vấn hoàn toàn miễn phí</li>
            <li>Làm việc với luật sư phù hợp nhất với bạn</li>
            <li>Liên tục cập nhật thông tin điều luật, pháp lý mới nhất</li>
          </ul>
          <button className={styles.tryButton}>
            Thử Legis AI ngay
          </button>
        </div>
        <div className={styles.imageContent}>
          <Image 
            src="/ai-robot.png" 
            alt="AI Robot"
            width={500}
            height={500}
            className={styles.heroImage}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;