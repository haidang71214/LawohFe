"use client";
import React, { useState, useEffect } from "react";
import { axiosInstance, BASE_URL } from "@/fetchApi";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import styles from "./DocumentCard.module.css";
import { LawyerCategories } from "@/components/common/EnumCommon";

interface Form {
  _id: string;
  uri_secure: string;
  mainContent: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
}

interface DocumentIndexProps {
  typeDocument: string;
}

const typeDocumentMap: Record<string, string> = {
  INSURANCE: LawyerCategories.INSURANCE,
  CIVIL: LawyerCategories.CIVIL,
  LAND: LawyerCategories.LAND,
  CORPORATE: LawyerCategories.BUSINESS,
  TRANSPORTATION: LawyerCategories.TRANSPORTATION,
  ADMINISTRATIVE: LawyerCategories.ADMINISTRATIVE,
  CRIMINAL: LawyerCategories.CRIMINAL,
  FAMILY: LawyerCategories.FAMILY,
  LABOR: LawyerCategories.LABOR,
  INTELLECTUAL_PROPERTY: LawyerCategories.INTELLECTUAL_PROPERTY,
  INHERITANCE: LawyerCategories.INHERITANCE,
  TAX: LawyerCategories.TAX,
};

export default function DocumentIndex({ typeDocument }: DocumentIndexProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchForms = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/form/heheForm", {
        params: { page: pageNum, limit: 10, type: typeDocument },
      });
      if (response.data.success) {
        setForms(response.data.data);
        setMeta(response.data.meta);
      } else {
        setError("Không thể tải biểu mẫu");
      }
    } catch (err) {
      setError("Lỗi khi tải biểu mẫu: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms(page);
  }, [page, typeDocument]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(meta.total / meta.limit)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleViewForm = (form: Form) => {
    setSelectedForm(form);
  };

  const handleCloseModal = () => {
    setSelectedForm(null);
  };

  const handleDownloadForm = async (id: string, mainContent: string) => {
    setDownloading(id);
    try {
      //  8080
      const response = await fetch(`${BASE_URL}/form/download/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(`Không thể tải file ${mainContent}: Mã lỗi ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from content-disposition header
      const disposition = response.headers.get("content-disposition");
      let filename = `${mainContent}.pdf`; // Fallback
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.match(/filename="([^"]+)"/)?.[1] || filename;
      }
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up
    } catch (err) {
      console.error("Lỗi khi tải file:", err);
      setError(`Không thể tải file ${mainContent}: ${err}`);
    } finally {
      setDownloading(null);
    }
  };

  const typeDocumentVietnamese = typeDocumentMap[typeDocument] || typeDocument;

  return (
    <div className={styles.cardContainer} style={{ paddingTop: "110px" }}>
      <main className={styles.mainContent}>
        <h1 className={styles.header}>
          Loại biểu mẫu - <span className={styles.headerSpan}>{typeDocumentVietnamese}</span>
        </h1>

        {loading && <p className={styles.loading}>Đang tải biểu mẫu...</p>}

        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && forms.length === 0 && (
          <p className={styles.noForms}>Không tìm thấy biểu mẫu cho loại này.</p>
        )}

        <div className={styles.cardGrid}>
          {forms.map((form) => (
            <div
              key={form._id}
              className={`${styles.card} ${styles.cardItem}`}
              style={{ opacity: 0 }}
            >
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{form.mainContent}</h2>
                <p className={styles.cardDescription}>{form.description}</p>
              </div>
              <div className={styles.cardFooter}>
                <time className={styles.time} dateTime={form.createdAt}>
                  Ngày tạo: {new Date(form.createdAt).toLocaleDateString("vi-VN")}
                </time>
                <Button
                  variant="bordered"
                  size="sm"
                  onClick={() => handleViewForm(form)}
                  aria-label={`Xem chi tiết: ${form.mainContent}`}
                  style={{ borderColor: "#007bff", color: "#007bff", marginRight: "10px" }}
                >
                  Xem chi tiết
                </Button>
                <Button
                  variant="shadow"
                  size="sm"
                  onClick={() => handleDownloadForm(form._id, form.mainContent)}
                  aria-label={`Tải về: ${form.mainContent}`}
                  style={{ backgroundColor: "#28a745", color: "#fff" }}
                  disabled={downloading === form._id}
                >
                  {downloading === form._id ? "Đang tải..." : "Tải về"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {meta.total > 0 && (
          <nav className={styles.pagination} aria-label="Phân trang">
            <Button
              variant={page === 1 ? "bordered" : "shadow"}
              size="md"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className={
                page === 1
                  ? "bg-gray-600 text-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            >
              Trang trước
            </Button>
            <span className={styles.pageInfo}>
              Trang {meta.page} / {Math.ceil(meta.total / meta.limit)}
            </span>
            <Button
              variant={
                page === Math.ceil(meta.total / meta.limit) ? "bordered" : "shadow"
              }
              size="md"
              disabled={page === Math.ceil(meta.total / meta.limit)}
              onClick={() => handlePageChange(page + 1)}
              className={
                page === Math.ceil(meta.total / meta.limit)
                  ? "bg-gray-600 text-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            >
              Trang sau
            </Button>
          </nav>
        )}

<Modal isOpen={!!selectedForm} onClose={handleCloseModal}>
  <ModalContent
    style={{
      backgroundColor: 'rgba(30, 41, 59, 0.95)', // Dark slate background with slight transparency
      color: '#e2e8f0', // Light gray text for readability
      borderRadius: '8px',
      paddingTop: '100px',
      maxWidth: '700px',
      margin: 'auto',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)', // Slightly stronger shadow for depth
      backdropFilter: 'blur(10px)', // Keep the blur effect
    }}
  >
    <ModalHeader
      style={{
        fontWeight: '700',
        fontSize: '1.75rem',
        borderBottom: '2px solid #3b82f6', // Keep the blue border but slightly muted
        paddingBottom: '10px',
        marginBottom: '20px',
        color: '#3b82f6', // Match the blue to the border
      }}
    >
      Chi tiết biểu mẫu
    </ModalHeader>
    <ModalBody style={{ textAlign: 'left' }}>
      {selectedForm && (
        <>
          <h2
            style={{
              fontSize: '1.5rem',
              marginBottom: '15px',
              fontWeight: 'bold',
              color: '#e2e8f0', // Light gray for the title to match the body text
            }}
          >
            {selectedForm.mainContent}
          </h2>
          <p style={{ marginBottom: '12px', lineHeight: 1.6 }}>
            <strong>Mô tả:</strong> {selectedForm.description}
          </p>
          <p style={{ marginBottom: '12px', lineHeight: 1.6 }}>
            <strong>Loại:</strong> {typeDocumentVietnamese}
          </p>
          <p style={{ marginBottom: '12px', lineHeight: 1.6 }}>
            <strong>Ngày tạo:</strong>{' '}
            {new Date(selectedForm.createdAt).toLocaleDateString('vi-VN')}
          </p>
          <p style={{ marginBottom: '12px', lineHeight: 1.6 }}>
            <strong>Ngày cập nhật:</strong>{' '}
            {new Date(selectedForm.updatedAt).toLocaleDateString('vi-VN')}
          </p>
        </>
      )}
    </ModalBody>
    <ModalFooter style={{ justifyContent: 'flex-end' }}>
      <Button
        variant="bordered"
        onClick={handleCloseModal}
        style={{
          borderColor: '#3b82f6', // Blue border to match the theme
          color: '#3b82f6', // Blue text
          padding: '8px 20px',
          fontWeight: '600',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s, color 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#3b82f6';
          e.currentTarget.style.color = '#ffffff'; // White text on hover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#3b82f6'; // Back to blue text
        }}
      >
        Đóng
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
      </main>
    </div>
  );
}