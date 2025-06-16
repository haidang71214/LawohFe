import Navbar from '@/components/common/navbar'
import NavbarSider from '@/components/common/NavbarSider'
import ManagerFormIndex from '@/components/module/admin/ManagerForm'
import React from 'react'

export default function ManagerFormPage() {
  return (
    <div>
      <Navbar/>
      <NavbarSider/>
      <ManagerFormIndex/>
    </div>
  )
}
