import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import React from 'react'
import styles from './Services.module.css'
import Image from 'next/image'

export default function Services() {
  return (
    <div>
      <Navbar/>
      
      {/* Header Section */}
      <section className={styles.headerService}>
      <div className={styles.overlay}></div>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <h1>Dịch vụ pháp lý toàn diện</h1>
          <p>Tiết kiệm thời gian, chi phí hợp lý, dễ dàng tiếp cận.</p>
        </div>
      </div>
    </section>
      <hr/>
      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
          {/* Tư vấn */}
          <div className={styles.serviceSection}>
            <div className={styles.serviceContent}>
              <h2>Tư vấn</h2>
              <p>AI tư vấn miễn phí các vấn đề pháp lý cơ bản 24/24 hoặc liên hệ luật sư để nhận tư vấn chuyên sâu.</p>
              <ul>
                <li>AI tư vấn miễn phí</li>
                <li>Liên hệ luật sư tư vấn chuyên sâu</li>
                <li>Tư vấn qua video call</li>
              </ul>
              <button className={styles.actionButton}>Xem thêm</button>
            </div>
            <div className={styles.serviceImage}>
              <Image 
                src="/tuvan.jpg" 
                alt="Tư vấn pháp lý" 
                width={800} 
                height={600} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
          <hr/>
          {/* Thuê luật sư */}
          <div className={styles.serviceSection}>
            <div className={styles.serviceImage}>
              <Image 
                src="/thue.png" 
                alt="Thuê luật sư" 
                width={800} 
                height={700}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  
                }}
                
              />
            </div>
            <div className={styles.serviceContent}>
              <h2>Thuê luật sư dễ dàng</h2>
              <p>Liên hệ với các luật sư uy tín, phù hợp với mong muốn và vấn đề của bạn</p>
              <ul>
                <li>Tham khảo tư hạng xếp hạng</li>
                <li>Áp giá luật sư phù hợp</li>
                <li>Đảm bảo chất lượng dịch vụ</li>
              </ul>
              <button className={styles.actionButton}>Xem thêm</button>
            </div>
          </div>
   <hr/>
          {/* Khóa học */}
          <div className={styles.serviceSection}>
            <div className={styles.serviceContent}>
              <h2>Khóa học</h2>
              <p>Khóa học pháp luật từ cơ bản đến chuyên sâu theo từng lĩnh vực</p>
              <ul>
                <li>Khóa học cơ bản</li>
                <li>Khóa học nâng cao</li>
                <li>Khóa học chuyên sâu theo từng lĩnh vực</li>
              </ul>
              <button className={styles.actionButton}>Xem thêm</button>
            </div>
            <div className={styles.serviceImage}>
              <Image 
                src="/khoahoc.jpg" 
                alt="Khóa học pháp luật" 
                width={800} 
                height={600}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          {/* Mẫu đơn từ */}
          <div className={styles.serviceSection}>
            <div className={styles.serviceImage}>
              <Image 
                src="/dontu.jpg" 
                alt="Mẫu đơn từ" 
                width={800} 
                height={600}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div className={styles.serviceContent}>
              <h2>Mẫu đơn từ</h2>
              <p>Cung cấp các mẫu đơn từ pháp lý để người dùng tải về và sử dụng cho cá nhân và doanh nghiệp.</p>
              <ul>
                <li>Các mẫu hợp đồng</li>
                <li>Các mẫu đơn</li>
                <li>Mẫu giấy tờ khác</li>
              </ul>
              <button className={styles.actionButton}>Xem thêm</button>
            </div>
          </div>
          <hr/>
          {/* Pricing */}
          <div className={styles.pricing}>
            <h2>Giá các gói dịch vụ</h2>
            <p>Đăng ký ngay để đảm bảo quyền lợi cho bạn và doanh nghiệp</p>
            <div className={styles.pricingGrid}>
              <div className={styles.pricingCard}>
                <h3>Gói Cá nhân (Personal Package)</h3>
                <p className={styles.subtitle}>Basic plan</p>
                <div className={styles.price}>
                  <span>$20</span>/mo
                  <p>or $199 yearly</p>
                </div>
                <ul>
                  <li>Tư vấn pháp lý trực tuyến 1:1</li>
                  <li>Hỗ trợ 24/7 qua chat</li>
                  <li>Bảo mật thông tin</li>
                </ul>
                <button>Get started</button>
              </div>

              <div className={styles.pricingCard}>
                <h3>Gói gia đình</h3>
                <p className={styles.subtitle}>For your family protect</p>
                <div className={styles.price}>
                  <span>$49</span>/mo
                  <p>or $299 yearly</p>
                </div>
                <ul>
                  <li>Hỗ trợ lập kế hoạch tài sản</li>
                  <li>Khóa học luật gia đình</li>
                  <li>Tư vấn tài chính cá nhân</li>
                  <li>Hỗ trợ đa thành viên</li>
                </ul>
                <button>Get started</button>
              </div>

              <div className={styles.pricingCard}>
                <h3>Gói doanh nghiệp</h3>
                <p className={styles.subtitle}>For your company project</p>
                <div className={styles.price}>
                  <span>$89</span>/mo
                  <p>or $499 yearly</p>
                </div>
                <ul>
                  <li>Soạn thảo hợp đồng riêng phí</li>
                  <li>Kiểm tra tuân thủ pháp luật</li>
                  <li>Tư vấn sở hữu trí tuệ</li>
                  <li>Mẫu đơn tờ doanh nghiệp</li>
                </ul>
                <button>Get started</button>
              </div>
            </div>
          </div>
              <hr/>
          {/* Contact Form */}
          <div className={styles.contactForm}>
            <h2>Liên hệ với chúng tôi</h2>
            <p>Chúng tôi luôn sẵn sàng tiếp nhận ý kiến của bạn</p>
            <div className={styles.formContainer}>
              <div className={styles.formContent}>
                <form>
                  <div className={styles.formGroup}>
                    <label>Tên</label>
                    <input type="text" placeholder="Họ và tên" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" placeholder="Email" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phản hồi</label>
                    <textarea placeholder="Gửi nhận xét của bạn về dịch vụ của chúng tôi..."></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.checkbox}>
                      <input type="checkbox" id="terms" />
                      <label htmlFor="terms">Tôi đồng ý với các điều khoản</label>
                    </div>
                  </div>
                  <button type="submit" className={styles.submitButton}>Submit</button>
                </form>
              </div>
              <div className={styles.formImage}>
                <Image 
                  src="/cekcek.jpg" 
                  alt="Contact" 
                  width={500} 
                  height={400}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  )
}
