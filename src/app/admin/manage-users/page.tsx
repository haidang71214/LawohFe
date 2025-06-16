import Navbar from '@/components/common/navbar'
import NavbarSider from '@/components/common/NavbarSider'
import QuanliUser from '@/components/module/admin/manage-users/quanliUser'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar/>
      <NavbarSider/>
      <QuanliUser/>
    </div>
  )
}
