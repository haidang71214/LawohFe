
import Navbar from '@/components/common/navbar'
import NavbarSider from '@/components/common/NavbarSider'
import NewsSelf from '@/components/module/news/newsIndex'
import React from 'react'

export default function NewsSelfPage() {
  return (
    <div>
    <Navbar/>
    <NavbarSider/>
    <NewsSelf/>
    </div>
  )
}
