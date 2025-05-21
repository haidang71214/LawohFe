import Navbar from '@/components/common/navbar'
import AdminDashboard from '@/components/module/admin/adminIndex'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar/>
      <AdminDashboard/> 
    </div>
  )
}
