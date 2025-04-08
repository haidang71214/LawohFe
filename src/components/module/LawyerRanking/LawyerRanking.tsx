import React from 'react';
import styles from './LawyerRanking.module.css';
import { LawyerCategories } from './../../common/EnumCommon';

const LawyerRanking = () => {
  return (
    <section className={styles.rankingSection}>
      <div className={styles.header}>
        <h2>Bạn vẫn còn thắc mắc?</h2>
        <p>Chúng tôi sẵn sàng hỗ trợ bạn bất cứ lúc nào?</p>
        <button>Đặt câu hỏi ngay</button>
      </div>
      <div className={styles.rankingTitle}>
        <h3>Bảng xếp hạng luật sư theo ngành</h3>
        <p>Top luật sư xuất sắc – Tìm kiếm chuyên gia pháp lý phù hợp nhất</p>
      </div>
      <div className={styles.categories}>
        {Object.values(LawyerCategories).map((category: string) => (
          <span key={category}>{category}</span>
        ))}
      </div>
      <div className={styles.cardsContainer}>
        <button className={styles.navButton}>{'<'}</button>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.rating}>★★★★★</div>
            <p>Đồng sáng lập kiêm Luật sư trưởng với 12 năm kinh nghiệm, đã hỗ trợ hơn 300 doanh nghiệp nhỏ trong việc soạn thảo hợp đồng và giải quyết tranh chấp thương mại.</p>
            <div className={styles.lawyerInfo}>
              <span>Nguyễn Minh Tuấn</span>
              <span>LAWOH</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.rating}>★★★★★</div>
            <p>Một trong những luật sư nổi tiếng thế giới, từng tham gia các vụ lớn như TMA Pai Foundation, với chuyên môn sâu về luật doanh nghiệp và hợp đồng tại Ấn Độ.</p>
            <div className={styles.lawyerInfo}>
              <span>Fali Sam Nariman</span>
              <span>Ấn Độ</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.rating}>★★★★★</div>
            <p>Luật sư với 10 năm kinh nghiệm tại TP. Hồ Chí Minh, chuyên tư vấn về hợp đồng quốc tế và sáp nhập doanh nghiệp, đã hỗ trợ hơn 150 doanh nghiệp vừa và nhỏ.</p>
            <div className={styles.lawyerInfo}>
              <span>Phạm Quốc Bảo</span>
              <span>LAWOH</span>
            </div>
          </div>
        </div>
        <button className={styles.navButton}>{'>'}</button>
      </div>
    </section>
  );
};

export default LawyerRanking; 