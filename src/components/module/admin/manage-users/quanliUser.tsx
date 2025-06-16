"use client";

import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/fetchApi';
import { addToast } from '@heroui/toast';
import { Modal, ModalContent, ModalHeader } from '@heroui/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';

interface User {
  _id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  phone: string;
  avartar_url: string;
  province: string;
  star?: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
  experienceYear?: number;
  typeLawyer?: string;
  password?: string;
}

export default function QuanliUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false); // State để kích hoạt useEffect

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    age: 0,
    role: '',
    phone: '',
    province: '',
  });
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    age: 0,
    password: '123456',
    role: 'user',
    phone: '',
    province: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [addSelectedFile, setAddSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/users/getAllUser');
        const mappedData = response.data.map((item: any) => ({
          _id: item._id,
          name: item.name,
          email: item.email,
          age: item.age,
          role: item.role,
          phone: item.phone?.toString() || '',
          avartar_url: item.avartar_url,
          province: item.province,
          star: item.star || 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          description: item.description,
          experienceYear: item.experienceYear,
          typeLawyer: item.typeLawyer,
          password: item.password || '',
        }));
        setUsers(mappedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [refresh]); // useEffect chạy lại khi refresh thay đổi

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role,
      phone: user.phone,
      province: user.province,
    });
    setSelectedFile(null);
    setOpenEditModal(true);
  };

  const handleOpenAddModal = () => {
    setAddFormData({
      name: '',
      email: '',
      age: 0,
      role: 'user',
      password: '123456',
      phone: '',
      province: '',
    });
    setAddSelectedFile(null);
    setOpenAddModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedUser(null);
    setSelectedFile(null);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setAddSelectedFile(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value,
    }));
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value,
    }));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const formPayload = new FormData();
      formPayload.append('name', editFormData.name);
      formPayload.append('email', editFormData.email);
      formPayload.append('age', editFormData.age.toString());
      formPayload.append('role', editFormData.role);
      formPayload.append('phone', editFormData.phone);
      formPayload.append('province', editFormData.province);
      if (selectedFile) {
        formPayload.append('img', selectedFile);
      }

      const response = await axiosInstance.patch(
        `/users/adminUpdateUser/${selectedUser._id}`,
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedUser = response.data;
      setUsers((prev) =>
        prev.map((user) => (user._id === selectedUser._id ? { ...user, ...updatedUser } : user))
      );

      addToast({
        title: 'Thành công',
        description: 'Cập nhật thông tin người dùng thành công!',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });

      handleCloseEditModal();
    } catch (err) {
      console.log(err);
      addToast({
        title: 'Lỗi',
        description: 'Cập nhật thất bại, vui lòng thử lại.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleAddUser = async () => {
    try {
      const formPayload = new FormData();
      formPayload.append('name', addFormData.name);
      formPayload.append('email', addFormData.email);
      formPayload.append('age', addFormData.age.toString());
      formPayload.append('role', addFormData.role);
      formPayload.append('phone', addFormData.phone);
      formPayload.append('province', addFormData.province);
      formPayload.append('password', addFormData.password);
      if (addSelectedFile) {
        formPayload.append('img', addSelectedFile);
      }

      const response = await axiosInstance.post(
        '/users',
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const newUser = response.data;
      setUsers((prev) => [...prev, newUser]);

      addToast({
        title: 'Thành công',
        description: 'Thêm người dùng thành công! Mật khẩu mặc định là 123456, vui lòng yêu cầu người dùng thay đổi sau khi đăng nhập.',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });

      // Kích hoạt useEffect để fetch lại danh sách
      setRefresh((prev) => !prev);

      handleCloseAddModal();
    } catch (err) {
      console.log(err);
      addToast({
        title: 'Lỗi',
        description: 'Thêm người dùng thất bại, vui lòng thử lại.',
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  const handleChangeToLawyer = async (id: any) => {
    try {
      const response = await axiosInstance.patch(
        `/lawyer/adminCreatelawyer/${id}`,
        {
          description: "string",
          type_lawyer: ["INSURANCE", "FAMILY"],
          sub_type_lawyers: ["bảo hiểm nhân thọ", "cái gì gì đó"],
          experienceYear: 0,
          certificate: ["string"],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Update successful:', response.data);
      addToast({
        title: 'Cập nhật thành công',
        description: 'Thông tin luật sư đã được cập nhật.',
        color: 'success',
        variant: 'flat',
        timeout: 4000,
      });
    } catch (error) {
      console.log(error);
      addToast({
        title: 'Cập nhật thất bại',
        description: `${error}`,
        color: 'danger',
        variant: 'flat',
        timeout: 4000,
      });
    }
  };

  if (loading) return <div className="text-white p-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-white p-5">Lỗi: {error}</div>;

  return (
    <div
      className="ml-60 p-5 w-4/5 mt-16"
      style={{ marginLeft: 240, padding: 20, width: '80%', marginTop: 60 }}
    >
      <h1 className="text-2xl font-bold text-white mb-4">Quản Lý Người Dùng</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenAddModal}
        style={{ marginBottom: '20px' }}
      >
        Thêm Người Dùng
      </Button>
      {users.length === 0 ? (
        <div className="text-white p-5">Không có dữ liệu người dùng.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-full bg-gray-800 text-white">
            <TableHead>
              <TableRow>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Tên</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Email</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Tuổi</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Vai Trò</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Số Điện Thoại</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Tỉnh/Thành</strong>
                </TableCell>
                <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <strong>Hành Động</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} className="bg-gray-900 hover:bg-gray-700">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.name}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.email}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.age}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.role === 'admin' ? 'Quản trị viên' : user.role === 'lawyer' ? 'Luật sư' : 'Người dùng'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.phone}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.province}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <Button variant="contained" color="primary" onClick={() => handleOpenEditModal(user)}>
                      <span>Chỉnh Sửa</span>
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => handleChangeToLawyer(user._id)}>
                      <span>Thay đổi thành luật sư</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal chỉnh sửa */}
      <Modal isOpen={openEditModal} style={{ backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
        <ModalContent className="bg-white rounded-lg p-8 w-full max-w-2xl relative">
          <button
            onClick={handleCloseEditModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ModalHeader className="text-2xl font-bold mb-6 text-gray-800">Chỉnh Sửa Người Dùng</ModalHeader>
          <div className="space-y-6">
            <TextField
              fullWidth
              label="Tên người dùng"
              name="name"
              value={editFormData.name}
              onChange={handleEditInputChange}
              required
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              label="Tuổi *"
              name="age"
              type="number"
              value={editFormData.age}
              onChange={handleEditInputChange}
              required
              variant="outlined"
              size="medium"
              inputProps={{ min: 0 }}
            />
            <TextField
              select
              fullWidth
              label="Vai trò"
              name="role"
              value={editFormData.role}
              onChange={handleEditInputChange}
              required
              size="medium"
            >
              <MenuItem value="admin">Quản trị viên</MenuItem>
              <MenuItem value="lawyer">Luật sư</MenuItem>
              <MenuItem value="user">Người dùng</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Số Điện Thoại"
              name="phone"
              type="text"
              value={editFormData.phone}
              onChange={handleEditInputChange}
              required
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              label="Tỉnh/Thành"
              name="province"
              value={editFormData.province}
              onChange={handleEditInputChange}
              required
              variant="outlined"
              size="medium"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              onClick={handleCloseEditModal}
              variant="outlined"
              style={{ color: '#800080', borderColor: '#800080' }}
            >
              HỦY
            </Button>
            <Button
              onClick={handleUpdateUser}
              variant="contained"
              style={{ backgroundColor: '#007bff', color: '#fff' }}
            >
              CẬP NHẬT
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* Modal thêm người dùng */}
      <Modal isOpen={openAddModal} style={{ backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
        <ModalContent className="bg-white rounded-lg p-8 w-full max-w-2xl relative">
          <button
            onClick={handleCloseAddModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ModalHeader className="text-2xl font-bold mb-6 text-gray-800">Thêm Người Dùng</ModalHeader>
          <div className="space-y-6">
            <TextField
              fullWidth
              label="Tên người dùng"
              name="name"
              value={addFormData.name}
              onChange={handleAddInputChange}
              required
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={addFormData.email}
              onChange={handleAddInputChange}
              required
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              label="Tuổi *"
              name="age"
              type="number"
              value={addFormData.age}
              onChange={handleAddInputChange}
              required
              variant="outlined"
              size="medium"
              inputProps={{ min: 0 }}
            />
            <TextField
              select
              fullWidth
              label="Vai trò"
              name="role"
              value={addFormData.role}
              onChange={handleAddInputChange}
              required
              size="medium"
            >
              <MenuItem value="user">Người dùng</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Số Điện Thoại"
              name="phone"
              type="text"
              value={addFormData.phone}
              onChange={handleAddInputChange}
              required
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              label="Tỉnh/Thành"
              name="province"
              value={addFormData.province}
              onChange={handleAddInputChange}
              required
              variant="outlined"
              size="medium"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setAddSelectedFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              onClick={handleCloseAddModal}
              variant="outlined"
              style={{ color: '#800080', borderColor: '#800080' }}
            >
              HỦY
            </Button>
            <Button
              onClick={handleAddUser}
              variant="contained"
              style={{ backgroundColor: '#007bff', color: '#fff' }}
            >
              THÊM
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}