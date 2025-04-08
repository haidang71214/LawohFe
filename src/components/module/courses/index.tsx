import React from 'react'
import styles from './corse.module.css';


export default function CoursesIndex() {
  return (
    <div>
     <div className={styles.header}>
     <div className={styles.overlay}></div>
        <div className={styles.container}>
        <div className={styles.heroContent}>
          <h1>Khóa học luật cơ bản</h1>
          <p>Trang bị nền tảng kiến thức pháp lý thiết yếu để tự tin giải quyết các vấn đề pháp lý hàng ngày cho người mới bắt đầu.
            <br/>
            Video bài giảng + bài tập thực hành + kiểm tra cuối khóa
            Thời lượng: Thời lượng: 10 buổi (mỗi buổi 1-1,5h)
               Giá: 1.500.000 VNĐ</p>
               <button style={{ color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer',border:'1px solid white'}}>Đăng kí ngay</button>
        </div>
      </div>
     </div>
     <div  className={styles.headerr}>
     <div className={styles.overlay}></div>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <h1>Khóa học luật nâng cao</h1>
          <p>Nâng tầm kỹ năng pháp lý chuyên sâu để hỗ trợ sự nghiệp phát triển bền vững và xử lý các tình huống phức tạp một cách chuyên nghiệp
<br/>
Video bài giảng + tình huống thực tế + tài liệu tham khảo
Thời lượng: 8-12 buổi/chuyên đề
Giá :2.500.000 VNĐ/chuyên đề</p>
  <button style={{ color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer',border:'1px solid white'}}>Đăng kí ngay</button>
        </div>
      </div>
     </div>
     <div  className={styles.headerrr}>
     <div className={styles.overlay}></div>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <h1>Khóa học chuyên sâu theo từng lĩnh vực</h1>
          <p> Kiến thức thực tiễn và chuyên biệt dành cho doanh nghiệp và cá nhân, từ luật lao động, kinh doanh đến dân sự
<br/>
Học trực tuyến + bài tập thực tế + hỗ trợ từ chuyên gia
Thời lượng: 12-15 buổi
Giá: 5.000.000 VNĐ</p>
  <button style={{ color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer',border:'1px solid white'}}>Đăng kí ngay</button>
        </div>
      </div>
     </div>
    </div>
  )
}
