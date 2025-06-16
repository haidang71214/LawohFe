"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar } from "lucide-react";

import { axiosInstance } from "@/fetchApi"; // Ensure this is correctly defined
import { addToast } from "@heroui/toast";
import './index.css';
// Enum and categories
enum ETypeLawyer {
  INSURANCE = "INSURANCE",
  CIVIL = "CIVIL",
  CRIMINAL = "CRIMINAL",
  FAMILY = "FAMILY",
  BUSINESS = "BUSINESS",
  REAL_ESTATE = "REAL_ESTATE",
  LABOR = "LABOR",
  ADMINISTRATIVE = "ADMINISTRATIVE",
  TAX = "TAX",
  INTELLECTUAL_PROPERTY = "INTELLECTUAL_PROPERTY",
}

const LawyerCategories = {
  INSURANCE: "Bảo hiểm",
  CIVIL: "Dân sự",
  CRIMINAL: "Đất đai",
  FAMILY: "Giao thông - Vận tải",
  BUSINESS: "Hành chính",
  REAL_ESTATE: "Hình sự",
  LABOR: "Hôn nhân gia đình",
  ADMINISTRATIVE: "Lao động",
  TAX: "Thuế kế - Dí chúc",
  INTELLECTUAL_PROPERTY: "Thuế",
};

interface Form {
  _id: string;
  type: ETypeLawyer;
  mainContent: string;
  description?: string;
  createdAt: string;
}

export default function ManagerFormIndex() {
  const [formFile, setFormFile] = useState<File | null>(null);
  const [type, setType] = useState<ETypeLawyer>(ETypeLawyer.INSURANCE);
  const [mainContent, setMainContent] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch danh sách form khi component mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axiosInstance.get("/form/heheForm");
        setForms(response.data.data || []);
      } catch (error: any) {
        console.error("Error fetching forms:", error);
        addToast({
          title: "Lỗi",
          description: `Lỗi khi lấy danh sách form: ${error.message || "Lỗi không xác định"}`,
          variant: "solid",
        });
      }
    };
    fetchForms();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormFile(file || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!type || !mainContent) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ loại form và nội dung chính",
        variant: "solid",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (formFile) {
        formData.append("formFile", formFile);
      }
      formData.append("type", type);
      formData.append("mainContent", mainContent);
      formData.append("description", description);

      console.log("Sending form data:", Object.fromEntries(formData));

      const response = await axiosInstance.post("/form", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response data:", response.data);

      if (!response.data) {
        throw new Error("No response data received");
      }

      addToast({
        title: "Thành công",
        description: "Gửi dữ liệu thành công",
      });
      setFormFile(null);
      setMainContent("");
      setDescription("");
      setType(ETypeLawyer.INSURANCE);
      setIsModalOpen(false);

      const updatedResponse = await axiosInstance.get("/form/heheForm");
      setForms(updatedResponse.data.data || []);
    } catch (error: any) {
      console.error("Error:", error);
      addToast({
        title: "Lỗi",
        description: `Gửi dữ liệu thất bại: ${error.message || "Lỗi không xác định"}`,
        variant: "solid",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormFile(null);
    setMainContent("");
    setDescription("");
    setType(ETypeLawyer.INSURANCE);
  };

  return (
    <div className="container mx-auto py-6 space-y-6" style={{marginTop:100,paddingLeft:'10%'}}>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Form</h1>
          <p className="text-muted-foreground">Quản lý các mẫu form pháp lý</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Form Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-center">Thêm Form Mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="formFile">File Form (tùy chọn):</Label>
                <Input
                  id="formFile"
                  type="file"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Loại Form (bắt buộc):</Label>
                <Select value={type} onValueChange={(value) => setType(value as ETypeLawyer)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại form" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LawyerCategories).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainContent">Nội dung chính (bắt buộc):</Label>
                <Input
                  id="mainContent"
                  type="text"
                  value={mainContent}
                  onChange={(e) => setMainContent(e.target.value)}
                  required
                  placeholder="Nhập nội dung chính"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả (tùy chọn):</Label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Đóng
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
                  {loading ? "Đang gửi..." : "Gửi Form"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Forms List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Danh sách Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forms.length > 0 ? (
            <div className="space-y-3">
              {forms.map((form) => (
                <div
                  key={form._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-blue-600 font-medium">
                        Loại: {LawyerCategories[form.type as keyof typeof LawyerCategories] || form.type}
                      </span>
                    </div>
                    <div className="font-medium text-foreground">
                      Tên: {form.mainContent}
                    </div>
                    {form.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {form.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(form.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có form nào để hiển thị.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}