'use client';

import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/fetchApi';
import styles from './UpdateLawyerDetailInformation.module.css';
import { USER_PROFILE } from '@/constant/enum';
import { Input, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Button, Select, SelectItem, Textarea } from '@heroui/react';
import { addToast } from '@heroui/react';

interface FormData {
  description: string;
  type_lawyer: string[];
  sub_type_lawyers: string;
  experienceYear: number;
  certificate: string;
}

interface TypeLawyer {
  _id: string;
  type: string[];
  lawyer_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SubType {
  _id: string;
  parentType: string;
  subType: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CustomPrice {
  _id: string;
  type: string;
  price: number;
  description: string;
  lawyer_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Lawyer {
  _id: string;
  name: string;
  star: number;
  typeLawyer: TypeLawyer;
  subTypes: SubType[];
  role: string;
  province: string;
  avartar_url: string;
  email: string;
  phone: number;
  description: string;
  certificate: string[];
  experienceYear: number;
  customPrice: CustomPrice[];
}

const LawyerCategories: Record<string, string> = {
  INSURANCE: 'Bảo hiểm',
  CIVIL: 'Dân sự',
  LAND: 'Đất đai',
  CORPORATE: 'Doanh nghiệp',
  TRANSPORTATION: 'Giao thông - Vận tải',
  ADMINISTRATIVE: 'Hành chính',
  CRIMINAL: 'Hình sự',
  FAMILY: 'Hôn nhân gia đình',
  LABOR: 'Lao động',
  INTELLECTUAL_PROPERTY: 'Sở hữu trí tuệ',
  INHERITANCE: 'Thừa kế - Di chúc',
  TAX: 'Thuế',
};

export default function UpdateLawyerDetailInformation() {
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [priceForm, setPriceForm] = useState({ price: 0, description: '' });
  const [formattedPrice, setFormattedPrice] = useState('');
  const [formData, setFormData] = useState<FormData>({
    description: '',
    type_lawyer: [],
    sub_type_lawyers: '',
    experienceYear: 0,
    certificate: '',
  });

  useEffect(() => {
    const lawyerId = getLawyerIdFromProfile();
    if (!lawyerId) {
      setError('Không tìm thấy thông tin luật sư trong profile');
      setLoading(false);
      return;
    }

    const fetchLawyerDetail = async () => {
      try {
        const response = await axiosInstance.get(`/lawyer/vLawyer?id=${lawyerId}`);
        const lawyerData = response.data?.data?.data;
        console.log(lawyerData);

        if (lawyerData) {
          setLawyer(lawyerData);
          setFormData({
            description: lawyerData.description || '',
            type_lawyer: lawyerData.typeLawyer?.type || [],
            sub_type_lawyers: lawyerData.subTypes?.length ? lawyerData.subTypes[0]?.subType.join(', ') : '',
            experienceYear: lawyerData.experienceYear || 0,
            certificate: lawyerData.certificate?.join(', ') || '',
          });
        } else {
          setError('Không tìm thấy thông tin luật sư');
        }
      } catch (err) {
        console.error(err);
        setError('Lỗi khi tải thông tin luật sư');
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerDetail();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof FormData) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: keyof FormData, keys: any) => {
    const selectedKeys = keys instanceof Set ? Array.from(keys) as string[] : [String(keys)];
    setFormData((prev) => ({
      ...prev,
      [field]: selectedKeys,
    }));
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof typeof priceForm) => {
    if (field === 'price') {
      const rawValue = e.target.value.replace(/,/g, '');
      const numericValue = parseInt(rawValue) || 0;
      setPriceForm((prev) => ({ ...prev, [field]: numericValue }));
      setFormattedPrice(numericValue.toLocaleString('en-US'));
    } else {
      setPriceForm((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  useEffect(() => {
    setFormattedPrice(priceForm.price.toLocaleString('en-US'));
  }, [priceForm.price]);

  const handleSubmit = async () => {
    if (!formData.description || formData.experienceYear < 0 || formData.type_lawyer.length === 0) {
      setError('Vui lòng điền đầy đủ và hợp lệ các trường, bao gồm ít nhất một chuyên môn');
      return;
    }

    const payload = {
      ...formData,
      sub_type_lawyers: formData.sub_type_lawyers.split(',').map(item => item.trim()).filter(Boolean),
      certificate: formData.certificate.split(',').map(item => item.trim()).filter(Boolean),
    };

    try {
      const response = await axiosInstance.patch('/lawyer/lawyerUpdate', payload);
      console.log('Thông tin đã được cập nhật:', response.data);
      addToast({
        title: '🎉 Cập nhật thành công!',
        description: 'Thông tin của bạn đã được cập nhật.',
        color: 'success',
        variant: 'flat',
        timeout: 3000,
      });

      const lawyerId = getLawyerIdFromProfile();
      if (lawyerId) {
        const response = await axiosInstance.get(`/lawyer/vLawyer?id=${lawyerId}`);
        const lawyerData = response.data?.data?.data;
        if (lawyerData) {
          setLawyer(lawyerData);
          setFormData({
            description: lawyerData.description || '',
            type_lawyer: lawyerData.typeLawyer?.type || [],
            sub_type_lawyers: lawyerData.subTypes?.length ? lawyerData.subTypes[0]?.subType.join(', ') : '',
            experienceYear: lawyerData.experienceYear || 0,
            certificate: lawyerData.certificate?.join(', ') || '',
          });
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      setError('Cập nhật thông tin thất bại');
      addToast({
        title: '❌ Lỗi khi cập nhật',
        description: 'Vui lòng thử lại sau.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handlePriceSubmit = async () => {
    if (!selectedType || priceForm.price < 0) {
      addToast({
        title: '❌ Lỗi',
        description: 'Vui lòng nhập giá hợp lệ và chọn loại chuyên môn.',
        color: 'danger',
        variant: 'flat',
        timeout: 3000,
      });
      return;
    }
  
    try {
      const payload = {
        Type: selectedType,
        price: priceForm.price,
        description: priceForm.description,
      };
      const response = await axiosInstance.post('/price-range/LawyerCustomPrice', payload);
      console.log('Response from API:', response.data);
  
      addToast({
        title: '🎉 Cập nhật giá thành công!',
        description: response.data.message || 'Giá đã được cập nhật cho loại chuyên môn.',
        color: 'success',
        variant: 'flat',
        timeout: 3000,
      });
  
      // Fetch updated lawyer data to reflect the new price
      const lawyerId = getLawyerIdFromProfile();
      if (lawyerId) {
        const fetchResponse = await axiosInstance.get(`/lawyer/vLawyer?id=${lawyerId}`);
        const lawyerData = fetchResponse.data?.data?.data;
        if (lawyerData) {
          setLawyer(lawyerData);
        }
      }
  
      setIsPriceModalOpen(false);
      setPriceForm({ price: 0, description: '' });
      setSelectedType(null);
    } catch (error: any) {
      // Xử lý lỗi từ response của API
      if (error.response) {
        const { status, data } = error.response;
        const message = typeof data === 'string' ? data : data?.message || 'Đã xảy ra lỗi không xác định';
        console.log(message);
        
        if (status === 404 && message === 'Không đủ quyền') {
          addToast({
            title: '❌ Không đủ quyền',
            description: 'Bạn không có quyền thực hiện hành động này.',
            color: 'danger',
            variant: 'flat',
            timeout: 4000,
          });
        } else if (status === 401 && message === 'Yêu cầu là luật sư') {
          addToast({
            title: '❌ Lỗi quyền',
            description: 'Bạn phải là luật sư để cập nhật giá.',
            color: 'danger',
            variant: 'flat',
            timeout: 4000,
          });
        } else if (status === 404 && typeof message === 'string' && message.includes('Giá phải trong khoảng')) {
          addToast({
            title: '❌ Giá không hợp lệ',
            description: message,
            color: 'danger',
            variant: 'flat',
            timeout: 4000,
          });
        } else {
          addToast({
            title: '❌ Lỗi không xác định',
            description: message,
            color: 'danger',
            variant: 'flat',
            timeout: 4000,
          });
        }
      } else {
        addToast({
          title: '❌ Lỗi kết nối',
          description: 'Không thể kết nối đến máy chủ, vui lòng thử lại.',
          color: 'danger',
          variant: 'flat',
          timeout: 4000,
        });
      }
    }
  };

  if (loading) return <div>Đang tải thông tin luật sư...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className={styles.container}>
      <img
        src={lawyer?.avartar_url !== 'null' ? lawyer?.avartar_url : '/default-avatar.png'}
        alt={lawyer?.name}
        className={styles.avatar}
      />
      <h2 className={styles.name}>{lawyer?.name}</h2>
      <p className={styles.province}>Địa chỉ: {lawyer?.province}</p>

      <div className={styles.content}>
        <div className={styles.leftSection}>
          <p className={styles.description}>
            <strong>Mô tả:</strong>
            <br />
            {lawyer?.description || 'Chưa có mô tả'}
          </p>

          <div>
            <strong>Chuyên môn:</strong>
            {lawyer?.typeLawyer?.type?.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Chuyên môn</th>
                    <th>Giá/ ngày làm việc (VNĐ)</th>
                    <th>Cập nhật giá</th>
                  </tr>
                </thead>
                <tbody>
                  {lawyer.typeLawyer.type.map((type, idx) => {
                    const priceEntry = lawyer.customPrice?.find((price) => price.type === type);
                    return (
                      <tr key={idx}>
                        <td>{LawyerCategories[type] || type}</td>
                        <td>
                          {priceEntry ? priceEntry.price.toLocaleString('en-US') : 'Chưa có giá'}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            onPress={() => {
                              setSelectedType(type);
                              setPriceForm({
                                price: priceEntry?.price || 0,
                                description: priceEntry?.description || '',
                              });
                              setIsPriceModalOpen(true);
                            }}
                            style={{ marginLeft: '10px', backgroundColor: '#3d3d3d', color: 'white', borderRadius: '10px' }}
                          >
                            Cập nhật giá
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              'Chưa có thông tin'
            )}
          </div>

          <div>
            <strong>Chuyên ngành chi tiết:</strong>
            {lawyer?.subTypes?.length ? (
              <ul>
                {lawyer.subTypes[0]?.subType.map((subType, idx) => (
                  <li key={idx}>{subType}</li>
                ))}
              </ul>
            ) : (
              'Chưa có thông tin'
            )}
          </div>

          <div>
            <strong>Chứng chỉ, bằng cấp: </strong>
            {lawyer?.certificate?.length ? lawyer.certificate.join(', ') : 'Chưa có thông tin'}
          </div>

          <Button
            color="primary"
            className={styles.bookButton}
            onPress={() => setIsOpen(true)}
          >
            Sửa thông tin cá nhân
          </Button>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.expYears}>{lawyer?.experienceYear || 0}</div>
          <div className={styles.expLabel}>năm kinh nghiệm làm việc</div>
        </div>
      </div>

      <Modal style={{ backgroundColor: 'white', color: 'black' }} isOpen={isOpen} onClose={() => setIsOpen(false)} className={styles.modal}>
        <ModalContent className={styles.modalContent}>
          <ModalHeader>Cập nhật thông tin</ModalHeader>
          <ModalBody>
            <div>
              Mô tả:
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange(e, 'description')}
              />
            </div>
            <div>
              Chuyên môn:
              <Select
                placeholder="Chọn chuyên môn"
                selectionMode="multiple"
                selectedKeys={formData.type_lawyer}
                onSelectionChange={(keys) => handleSelectChange('type_lawyer', keys)}
                className="w-full"
              >
                {Object.keys(LawyerCategories).map((key) => (
                  <SelectItem style={{ backgroundColor: '#3c3c3c' }} key={key}>
                    {LawyerCategories[key]}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              Chuyên ngành chi tiết (cách nhau bằng dấu phẩy):
              <Textarea
                label=""
                placeholder="Nhập chuyên ngành (ví dụ: Tư vấn dân sự, Tư vấn đất đai)"
                value={formData.sub_type_lawyers}
                onChange={(e) => handleInputChange(e, 'sub_type_lawyers')}
              />
            </div>
            <div>
              Năm kinh nghiệm:
              <Input
                type="number"
                value={formData.experienceYear.toString()}
                onChange={(e) => handleInputChange(e, 'experienceYear')}
              />
            </div>
            <div>
              Chứng chỉ (cách nhau bằng dấu phẩy):
              <Textarea
                label=""
                placeholder="Nhập chứng chỉ (ví dụ: Bằng luật sư, Chứng chỉ hành nghề)"
                value={formData.certificate}
                onChange={(e) => handleInputChange(e, 'certificate')}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleSubmit}>
              Cập nhật
            </Button>
            <Button color="secondary" onClick={() => setIsOpen(false)}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal style={{ backgroundColor: 'white', color: 'black' }} isOpen={isPriceModalOpen} onClose={() => setIsPriceModalOpen(false)} className={styles.modal}>
        <ModalContent className={styles.modalContent}>
          <ModalHeader>Cập nhật giá cho {selectedType && LawyerCategories[selectedType]}</ModalHeader>
          <ModalBody>
            <div>
              Giá (VNĐ):
              <Input
                type="text"
                value={formattedPrice}
                onChange={(e) => handlePriceInputChange(e, 'price')}
              />
            </div>
            <div>
              Mô tả:
              <Textarea
                label=""
                placeholder="Nhập mô tả cho giá (tùy chọn)"
                value={priceForm.description}
                onChange={(e) => handlePriceInputChange(e, 'description')}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handlePriceSubmit}>
              Lưu giá
            </Button>
            <Button color="secondary" onClick={() => setIsPriceModalOpen(false)}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function getLawyerIdFromProfile(): string | null {
  const userProfileStr = localStorage.getItem(USER_PROFILE);
  if (!userProfileStr) return null;
  try {
    const userProfile = JSON.parse(userProfileStr);
    return userProfile._id || null;
  } catch {
    return null;
  }
}