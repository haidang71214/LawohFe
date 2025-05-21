"use client";
import { USER_PROFILE } from '@/constant/enum';
import { axiosInstance } from '@/fetchApi';
import { addToast, Button, Card, CardBody, CardFooter, Image, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, useDisclosure } from '@heroui/react';
import React, { useEffect, useState } from 'react';

export enum LawyerCategories {
  INSURANCE = 'Bảo hiểm',
  CIVIL = 'Dân sự',
  LAND = 'Đất đai',
  BUSINESS = 'Doanh nghiệp',
  TRANSPORTATION = 'Giao thông - Vận tải',
  ADMINISTRATIVE = 'Hành chính',
  CRIMINAL = 'Hình sự',
  FAMILY = 'Hôn nhân gia đình',
  LABOR = 'Lao động',
  INTELLECTUALPROPERTY = 'Sở hữu trí tuệ',
  INHERITANCE = 'Thừa kế - Di chúc',
  TAX = 'Thuế',
}

export default function ShittingFile() {
  interface LawyerType {
    _id: string;
    type: string[];
    lawyer_id: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }

  interface Lawyer {
    _id: string;
    name: string;
    stars: number;
    typeLawyer: LawyerType | string;
    role: string;
    province: string;
    avartar_url: string;
  }
  // nhớ set form
  const [formData, setFormData] = useState({
    client_id: '',
    lawyer_id: '',
    booking_start: '',
    booking_end: '',
    typeBooking: '',
    note: '',
  });
  
  // State cho các bộ lọc và phân trang
  const [stars, setStars] = useState<number | undefined>(undefined);
  const [typeLawyer, setTypeLawyer] = useState<string | undefined>(undefined);
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1); // Trang hiện tại
  const [limit] = useState(8); // Giới hạn 8 luật sư mỗi trang
  const [total, setTotal] = useState(0); // Tổng số luật sư
  const [isSuccess, setIsSuccess] = useState(false); // Thêm state để kiểm tra khi thành công

  // State cho danh sách luật sư và trạng thái tải
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedLawyerIds, setBookedLawyerIds] = useState<string[]>([]);

  const fetchUserBookedLawyers = async () => {
    try {
      const userProfileStr = localStorage.getItem(USER_PROFILE) || '';
      if (!userProfileStr) return;
  
      const userProfile = JSON.parse(userProfileStr) as { _id?: string };
  
      const heheId = userProfile._id;
      if (!heheId) return;
  
      const response = await axiosInstance.get(`/users/getListBookingUser/${heheId}`);
      if (Array.isArray(response.data)) {
        const ids = response.data.map((item: any) => item.lawyer_id);
        setBookedLawyerIds(ids);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách booking của user:', error);
    }
  };
  
  
  useEffect(() => {
    fetchUserBookedLawyers();
    setIsSuccess(false);
  }, [isSuccess]);

  // Các tùy chọn cho dropdown
  const starOptions = [1, 2, 3, 4, 5];
  const typeLawyerOptions = Object.entries(LawyerCategories).map(([key, value]) => ({
    value: key,
    label: value,
  }));
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const provinceOptions =['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'An Giang', 'Bà Rịa - Vũng Tàu',   'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cao Bằng', 'Cần Thơ', 'Cà Mau', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hòa Bình', 'Hậu Giang', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang','Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên - Huế', 'Tiền Giang', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'];

  // Add this function inside your ShittingFile component
// Function to submit booking and show Toasts for success or failure
const handleSubmit = async () => {
  // Kiểm tra đầy đủ các trường
  if (!formData.client_id || !formData.lawyer_id || !formData.booking_start || !formData.booking_end) {
   addToast({
           title: "❌ Lỗi Nhập Liệu!",
           description: "Vui lòng điền đầy đủ các trường thông tin!",
           color: "danger",
           variant: "flat",
           timeout: 4000,
         });
    return;
  }

  try {
    const payload = {
      ...formData,
      lawyer_id: formData.lawyer_id || 'YOUR_LAWYER_ID',
      client_id: formData.client_id || 'YOUR_CLIENT_ID',
    };

    const response = await axiosInstance.post('/booking/userCreateBooking', payload);
    console.log('Booking created successfully:', response.data);

    // Hiển thị toast thành công
    addToast({
      title: "🎉 Tạo form thành công!",
      description: "xin vui lòng đợi luật sư phản hồi",
      color: "success",
      variant: "flat",
      timeout: 3000,
    });
    setIsSuccess(true);
    onOpenChange(); // Đóng modal sau khi thành công
  } catch (error: any) {
    console.error('Error creating booking:', error);
    addToast({
            title: "❌ Lỗi nhập liệu",
            description: "Bạn kiểm tra lại form",
            color: "danger",
            variant: "flat",
            timeout: 4000,
          });
  }
};


  const fetchLawyers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = { page, limit };
      if (stars !== undefined) params.stars = stars;
      if (typeLawyer && Object.keys(LawyerCategories).includes(typeLawyer)) {
        params.typeLawyer = typeLawyer;
      }
      if (province) params.province = province;

      const response = await axiosInstance.get('/lawyer/filterLawyer', { params });
      const { data: lawyerData, pagination } = response.data;
      console.log(stars);
      
      if (Array.isArray(lawyerData)) {
        const processedLawyers: Lawyer[] = lawyerData.map((item: any, index: number) => {
          let typeLawyerValue: LawyerType | string = 'UNKNOWN';
          if (item.typeLawyer && typeof item.typeLawyer === 'object' && item.typeLawyer.type) {
            typeLawyerValue = {
              _id: item.typeLawyer._id || `temp-type-${index}`,
              type: item.typeLawyer.type || ['UNKNOWN'],
              lawyer_id: item.typeLawyer.lawyer_id || item._id,
              createdAt: item.typeLawyer.createdAt,
              updatedAt: item.typeLawyer.updatedAt,
              __v: item.typeLawyer.__v,
            };
          } else if (item.typeLawyer && typeof item.typeLawyer === 'string') {
            typeLawyerValue = item.typeLawyer;
          }

          return {
            _id: item._id || `temp-${index}`,
            name: item.name || 'Tên không xác định',
            stars: item.stars || 0,
            typeLawyer: typeLawyerValue,
            role: item.role || 'Không xác định',
            province: item.province || 'Không xác định',
            avartar_url: item.avartar_url || "null",
          };
        });
        setLawyers(processedLawyers);
        setTotal(pagination?.total || 0);
      } else {
        throw new Error('Dữ liệu trả về từ API không phải là mảng.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách luật sư.');
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  useEffect(() => {
    fetchLawyers();
  }, [stars, typeLawyer, province, page]);

  const getTypeLawyerLabel = (typeLawyerValue: LawyerType | string | undefined): string => {
    if (!typeLawyerValue) return 'Không xác định';
    if (typeof typeLawyerValue === 'string') {
      return LawyerCategories[typeLawyerValue as keyof typeof LawyerCategories] || typeLawyerValue;
    }
    if (typeof typeLawyerValue === 'object' && Array.isArray(typeLawyerValue.type)) {
      return typeLawyerValue.type
        .map((type) => LawyerCategories[type as keyof typeof LawyerCategories] || type)
        .join(', ');
    }
    return 'Không xác định';
  };

  const totalPages = Math.ceil(total / limit);
  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  

  return (
      <div className="mx-auto" style={{padding:'150px',backgroundColor:'#1A1A1A' }}>
        {/*  */}
        <h1 className="text-2xl font-bold mb-4">Lọc danh sách luật sư</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label  className="block text-sm font-medium text-gray-700 ">Số sao</label>
            <select
              value={stars ?? ''}
              onChange={(e) => setStars(e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 p-2 border rounded-md w-40 text-black"
            >
              <option value="">Tất cả</option>
              {starOptions.map((star) => (
                <option key={star} value={star}>
                  {star} sao
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
            <select
              value={typeLawyer ?? ''}
              onChange={(e) => setTypeLawyer(e.target.value || undefined)}
              className="mt-1 p-2 border rounded-md w-40 text-black"
            >
              <option value="">Tất cả</option>
              {typeLawyerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
            <select
              value={province ?? ''}
              onChange={(e) => setProvince(e.target.value || undefined)}
              className="mt-1 p-2 border rounded-md w-40 text-black"
            >
              <option value="">Tất cả</option>
              {provinceOptions.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading && <p className="text-center text-gray-500">Đang tải...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && lawyers.length === 0 && (
          <p className="text-center text-gray-500">Không tìm thấy luật sư nào.</p>
        )}
        {!loading && !error && lawyers.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {lawyers.map((lawyer) => (
                <Card
                className="py-4"
                key={lawyer._id}
                style={{
                  width: '25%',
                  boxSizing: 'border-box',
                  backgroundColor: '#262626',
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  
                }}
              >
                <CardBody className="overflow-visible py-2 pb-0 pt-2 px-4 flex-col items-center" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Image
                    alt="Card background"
                    className="object-cover rounded-xl "
                    src={lawyer.avartar_url !== "null" ? lawyer.avartar_url : "/default-avatar.png"}
                    width={250}
                    height={200}
                    loading="lazy"
                    style={{borderRadius:'20px'}}
                  />
                </CardBody>
                <CardFooter className="flex-col">
                  <h2 className="text-lg font-semibold text-white">{lawyer.name}</h2>
                  <p className="text-sm text-gray-600 text-white">
                    Chuyên ngành: {getTypeLawyerLabel(lawyer.typeLawyer)}
                  </p>
                  <p className="text-sm text-white">Khu vực: {lawyer.province}</p>
                  <p className="text-sm text-white">Vai trò: {lawyer.role}</p>
                  <p className="text-sm text-yellow-500">{'★'.repeat(lawyer.stars)}</p>
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/lawyerDetail/${lawyer._id}`}
                      style={{
                        backgroundColor: '#3C3C3C',
                        color: 'white',
                        padding: '8px 16px',
                        border: '1px solid black',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    >
                      Xem chi tiết luật sư
                    </Link>
                    <Button
  color={bookedLawyerIds.includes(lawyer._id) ? 'secondary' : 'primary'}
  disabled={bookedLawyerIds.includes(lawyer._id)}
  style={{
    backgroundColor: bookedLawyerIds.includes(lawyer._id) ? '#888888' : '#3C3C3C',
    color: 'white',
    padding: '8px 16px',
    border: '1px solid black',
    borderRadius: '8px',
    fontSize: '14px',
  }}
  onPress={() => {
    if (!bookedLawyerIds.includes(lawyer._id)) {
      const userProfileStr = localStorage.getItem(USER_PROFILE) || "";
      let clientId = "";
      try {
        const userProfile = JSON.parse(userProfileStr) as { _id?: string };
        clientId = userProfile._id || "";
      } catch {
        console.error("Lỗi parse USER_PROFILE từ localStorage");
      }
      console.log("Client ID lấy được:", clientId);

      setFormData((prev) => ({
        ...prev,
        client_id: clientId,
        lawyer_id: lawyer._id,
      }));
      onOpen(); // Mở modal sau khi đã set form
    }
  }}
>
  {bookedLawyerIds.includes(lawyer._id) ? 'Đã đặt' : 'Tạo form đăng kí'}
</Button>

    <Modal isOpen={isOpen} style={{backgroundColor:'white'}} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Đăng kí booking ngay</ModalHeader>
              <ModalBody>
                <div>Thời gian bắt đầu</div>
              <Input
                  type="datetime-local"
                    value={formData.booking_start}
                   onChange={(e) => handleChange('booking_start', e.target.value)}
                                />
              <div>Thời gian kết thúc</div>
                <Input
                    type="datetime-local"
                    value={formData.booking_end}
                    onChange={(e) => handleChange('booking_end', e.target.value)}
                     />
                     <div>chọn loại tư vấn</div>
                     <Select
                className="max-w-xs"
                placeholder="Chọn kiểu tư vấn"
                selectionMode="multiple"
                selectedKeys={formData.typeBooking ? [formData.typeBooking] : []}
                onSelectionChange={(keys) => handleChange('typeBooking', String(Array.from(keys)[0] || ''))}
              >
              {Object.entries(LawyerCategories).map(([key, label]) => (
                                    <SelectItem style={{backgroundColor:'black',color:'white'}} key={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                          </Select>
                        <Textarea
                          label="Ghi chú"
                          placeholder="Ghi chú cho luật sư..."
                          value={formData.note}
                          onChange={(e) => handleChange('note', e.target.value)}
                        />
                            </ModalBody>
                            <ModalFooter>
                              <Button color="danger" variant="flat" onPress={onClose}>
                                Đóng form
                              </Button>
                              {bookedLawyerIds.includes(formData.lawyer_id) ? (
                            <Button color="secondary" disabled>
                                  Đã đặt
                            </Button>
                            ) : (
                               <Button color="primary" onPress={handleSubmit}>
                               Đặt lịch ngay
                                </Button>
                                   )}
                          </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {!loading && !error && lawyers.length > 0 && (
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md ${
                page === 1 ? 'bg-gray-300 cursor-not-allowed text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Trang trước
            </button>
            <span className="self-center text-white">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-md ${
                page === totalPages ? 'bg-gray-300 cursor-not-allowed text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Trang sau
            </button>
          </div>
        )}
        
      </div>

  );
}