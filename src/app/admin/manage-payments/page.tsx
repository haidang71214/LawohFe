import Navbar from '@/components/common/navbar'
import NavbarSider from '@/components/common/NavbarSider'
import AdminDashboard from '@/components/module/admin/manage-payments/adminIndex'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar/>
      <NavbarSider />
      <AdminDashboard/> 
    </div>
  )
}
