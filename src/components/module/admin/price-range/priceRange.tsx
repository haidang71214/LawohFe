'use client';
import { axiosInstance } from "@/fetchApi";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Modal,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { addToast } from "@heroui/toast";

// Định nghĩa enum cho các danh mục luật sư
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

export enum ETypeLawyer {
  INSURANCE = 'INSURANCE',
  CIVIL = 'CIVIL',
  LAND = 'LAND',
  CORPORATE = 'CORPORATE',
  TRANSPORTATION = 'TRANSPORTATION',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  CRIMINAL = 'CRIMINAL',
  FAMILY = 'FAMILY',
  LABOR = 'LABOR',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  INHERITANCE = 'INHERITANCE',
  TAX = 'TAX',
}

// Ánh xạ từ ETypeLawyer sang LawyerCategories để hiển thị tiếng Việt
const lawyerTypeToCategory = (type: ETypeLawyer): string => {
  switch (type) {
    case ETypeLawyer.INSURANCE:
      return LawyerCategories.INSURANCE;
    case ETypeLawyer.CIVIL:
      return LawyerCategories.CIVIL;
    case ETypeLawyer.LAND:
      return LawyerCategories.LAND;
    case ETypeLawyer.CORPORATE:
      return LawyerCategories.BUSINESS;
    case ETypeLawyer.TRANSPORTATION:
      return LawyerCategories.TRANSPORTATION;
    case ETypeLawyer.ADMINISTRATIVE:
      return LawyerCategories.ADMINISTRATIVE;
    case ETypeLawyer.CRIMINAL:
      return LawyerCategories.CRIMINAL;
    case ETypeLawyer.FAMILY:
      return LawyerCategories.FAMILY;
    case ETypeLawyer.LABOR:
      return LawyerCategories.LABOR;
    case ETypeLawyer.INTELLECTUAL_PROPERTY:
      return LawyerCategories.INTELLECTUALPROPERTY;
    case ETypeLawyer.INHERITANCE:
      return LawyerCategories.INHERITANCE;
    case ETypeLawyer.TAX:
      return LawyerCategories.TAX;
    default:
      return "Không xác định";
  }
};

// Định nghĩa interface cho dữ liệu khoảng giá
interface PriceRange {
  _id: string;
  type: ETypeLawyer;
  minPrice: number;
  maxPrice: number;
  description: string;
  updatedAt?: string;
}

export default function PriceRangePage() {
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false); // Trạng thái hiển thị modal
  const [selectedRange, setSelectedRange] = useState<PriceRange | null>(null); // Theo dõi hàng được chọn để chỉnh sửa
  const [formData, setFormData] = useState<Partial<PriceRange>>({});

  useEffect(() => {
    async function fetchPriceRanges() {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/price-range");
        console.log("Phản hồi API:", response.data);
        const mappedData = response.data.map((item: any) => ({
          ...item,
          type: item.type as ETypeLawyer,
        }));
        setPriceRanges(mappedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchPriceRanges();
  }, []);

  const handleInputChange = (field: keyof PriceRange, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'minPrice' || field === 'maxPrice' ? Number(value) : value,
    }));
  };

  const startEditing = (range: PriceRange) => {
    setSelectedRange(range);
    setFormData({
      minPrice: range.minPrice,
      maxPrice: range.maxPrice,
      description: range.description,
    });
    setOpenModal(true);
  };

  const saveChanges = async () => {
    if (!selectedRange) return;

    try {
      const payload = {
        minPrice: formData.minPrice ?? selectedRange.minPrice,
        maxPrice: formData.maxPrice ?? selectedRange.maxPrice,
        description: formData.description ?? selectedRange.description,
      };

      // Kiểm tra minPrice <= maxPrice
      if (payload.minPrice > payload.maxPrice) {
        addToast({
          title: "Lỗi",
          description: "Giá thấp nhất không được lớn hơn giá cao nhất.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
        return; // Ngừng thực thi nếu kiểm tra thất bại
      }

      await axiosInstance.patch(`/price-range/${selectedRange.type}`, payload);

      setPriceRanges((prev) =>
        prev.map((range) =>
          range._id === selectedRange._id
            ? { ...range, ...payload, updatedAt: new Date().toISOString() }
            : range
        )
      );
      setOpenModal(false);
      setSelectedRange(null);
      setFormData({});

      addToast({
        title: "Thành công",
        description: "Cập nhật khoảng giá dịch vụ thành công.",
        color: "success",
        variant: "flat",
        timeout: 4000,
      });
    } catch (err) {
      console.log(err);
      addToast({
        title: "Lỗi",
        description: "Cập nhật khoảng giá dịch vụ thất bại.",
        color: "warning",
        variant: "flat",
        timeout: 4000,
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRange(null);
    setFormData({});
  };

  if (loading) return <div className="text-white p-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-white p-5">Lỗi: {error}</div>;

  return (
    <div className="ml-60 p-5 w-4/5 mt-16" style={{ marginLeft: 240, padding: 20, width: '80%', marginTop: 60 }}>
      <h1 className="text-2xl font-bold text-white mb-4">Quản Lý Khoảng Giá Dịch Vụ</h1>
      {priceRanges.length === 0 ? (
        <div className="text-white p-5">Không có dữ liệu khoảng giá dịch vụ.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-full bg-gray-800 text-white">
            <TableHead>
              <TableRow>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Loại Dịch Vụ</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Giá Thấp Nhất (VND)</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Giá Cao Nhất (VND)</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Mô Tả</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Cập Nhật Lần Cuối</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Hành Động</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priceRanges.map((range) => (
                <TableRow key={range._id} className="bg-gray-900 hover:bg-gray-700">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {lawyerTypeToCategory(range.type)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {range.minPrice.toLocaleString()} VND
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {range.maxPrice.toLocaleString()} VND
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {range.description}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {range.updatedAt ? new Date(range.updatedAt).toLocaleString('vi-VN') : "Chưa có dữ liệu"}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => startEditing(range)}
                      className="flex items-center space-x-2"
                    >
                      <span>Chỉnh Sửa</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal để chỉnh sửa */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            Chỉnh Sửa Khoảng Giá Dịch Vụ
          </Typography>
          <TextField
            label="Giá Thấp Nhất (VND)"
            type="number"
            value={formData.minPrice ?? selectedRange?.minPrice ?? ''}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            inputProps={{ min: 0 }} // Ngăn nhập số âm
          />
          <TextField
            label="Giá Cao Nhất (VND)"
            type="number"
            value={formData.maxPrice ?? selectedRange?.maxPrice ?? ''}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            inputProps={{ min: 0 }} // Ngăn nhập số âm
          />
          <TextField
            label="Mô Tả"
            value={formData.description ?? selectedRange?.description ?? ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseModal}
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={saveChanges}
            >
              Lưu Thay Đổi
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}