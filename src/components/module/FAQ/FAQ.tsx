"use client"
import React from 'react';
import styles from './FAQ.module.css';

const FAQ = () => {

  const faqs = [
     {
      question: 'Làm thế nào để tôi có thể đặt lịch tư vấn pháp lý trực tuyến qua trang web của Group LAWOH?',
      answer: 'Bạn chỉ cần truy cập mục “Tư vấn” trên trang web, chọn lĩnh vực pháp lý cần hỗ trợ (như luật doanh nghiệp, lao động), sau đó chọn thời gian và phương thức tư vấn (chat, video call, hoặc gặp trực tiếp). Sau khi xác nhận, bạn sẽ nhận được email thông báo lịch hẹn cùng thông tin liên hệ của luật sư. Quy trình đặt lịch chỉ mất chưa đến 3 phút!'
    },
    {
      question: 'Trang web có hỗ trợ tư vấn qua video call hoặc chat không, hay tôi phải gặp trực tiếp luật sư?',
      answer: 'LAWOH hỗ trợ tư vấn qua nhiều hình thức để phù hợp với lịch trình bận rộn của bạn, bao gồm video call, chat trực tuyến, và gặp trực tiếp. Khi đặt lịch, bạn có thể chọn hình thức phù hợp nhất. Tư vấn qua video call và chat được nhiều khách hàng ưa chuộng vì tính tiện lợi và tiết kiệm thời gian.'
    },
    {
      question: 'Làm thế nào để tôi liên hệ với đội ngũ hỗ trợ của LAWOH nếu gặp vấn đề khi sử dụng trang web?',
      answer: 'Bạn có thể liên hệ với đội ngũ hỗ trợ của chúng tôi qua email support@group-lawoh.com hoặc số điện thoại 0909 123 456, từ 8:00 đến 17:00, thứ Hai đến thứ Sáu. Ngoài ra, trang web có tính năng chat trực tiếp hoạt động 24/7, giúp bạn nhận hỗ trợ ngay lập tức nếu gặp vấn đề kỹ thuật hoặc cần giải đáp nhanh.'
    },
    {
      question: 'Chi phí tư vấn pháp lý trên trang web là bao nhiêu, và có gói dịch vụ nào phù hợp với ngân sách thấp không?',
      answer: 'Chi phí tư vấn tại Group LAWOH bắt đầu từ 200,000 VNĐ cho 30 phút, tùy thuộc vào lĩnh vực và kinh nghiệm của luật sư. Chúng tôi cũng cung cấp gói tư vấn cơ bản với giá 500,000 VNĐ/tháng, bao gồm 2 buổi tư vấn trực tuyến, rất phù hợp cho người có ngân sách hạn chế như doanh nhân độc lập. Bạn có thể xem chi tiết tại mục “Dịch vụ” trên trang web.'
    },
    {
      question: 'Tôi có thể hủy lịch tư vấn hoặc thay đổi luật sư nếu không hài lòng không?',
      answer: 'Có, bạn có thể hủy lịch tư vấn miễn phí nếu thông báo trước 24 giờ qua email hoặc mục “Quản lý lịch hẹn” trên trang web. Nếu không hài lòng với luật sư, bạn có thể yêu cầu thay đổi người tư vấn trong vòng 24 giờ sau buổi tư vấn đầu tiên, và chúng tôi sẽ hỗ trợ bạn chọn luật sư phù hợp hơn mà không mất thêm chi phí.'
    },
    {
      question: 'Tôi có thể tìm luật sư chuyên về lĩnh vực cụ thể (như luật doanh nghiệp, lao động, hoặc hôn nhân) trên trang web không?',
      answer: 'Có, bạn hoàn toàn có thể! Tại mục “Thuê luật sư”, bạn có thể sử dụng bộ lọc để tìm kiếm luật sư theo lĩnh vực (doanh nghiệp, lao động, hôn nhân, v.v.), khu vực, và mức giá. Danh sách luật sư sẽ hiển thị kèm thông tin về chuyên môn và kinh nghiệm, giúp bạn dễ dàng chọn người phù hợp nhất.'
    },
    {
      question: 'Các khóa học luật trên trang web phù hợp với người mới bắt đầu hay chỉ dành cho người đã có kiến thức pháp lý?',
      answer: 'Chúng tôi cung cấp nhiều khóa học phù hợp với mọi trình độ. Khóa học cơ bản được thiết kế dành cho người mới bắt đầu, giúp bạn nắm vững kiến thức pháp lý thiết yếu. Các khóa nâng cao và chuyên từng lĩnh vực (như luật doanh nghiệp, lao động) phù hợp hơn với người đã có nền tảng và muốn phát triển kỹ năng chuyên sâu. Bạn có thể xem chi tiết tại mục “Khóa học luật”.'
    },
    {
      question: 'Group LAWOH có cung cấp mẫu đơn từ miễn phí không, và tôi có thể tải chúng ở đâu trên trang web?',
      answer: 'Chúng tôi cung cấp một số mẫu đơn từ miễn phí như hợp đồng lao động cơ bản, đơn yêu cầu ly hôn, và hợp đồng thuê nhà. Bạn có thể truy cập mục “Mẫu đơn từ” trên trang web, chọn danh mục phù hợp, và nhấn “Tải miễn phí”. Ngoài ra, các mẫu nâng cao có giá chỉ từ 50,000 VNĐ, kèm hướng dẫn sử dụng chi tiết'
    }
  ];


  return (
    <section className={styles.faqSection}>
      <h2 className={styles.title}>Vấn đề thường gặp</h2>
      <p className={styles.description}>
        Chúng tôi tổng hợp những vấn đề mà khách hàng thường gặp từ những câu hỏi công khai của khách hàng và các diễn đàn nhằm cung cấp cho bạn những thông tin bổ ích và cách giải quyết những vấn đề thường gặp
      </p>
      <div className={styles.faqList}>
      {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <div className={styles.question}>
              {faq.question}
            </div>
            <div className={styles.answer}>
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ; 