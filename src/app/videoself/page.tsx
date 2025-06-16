import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import VideoManager from '@/components/module/quanlivideochominh/VideoManager'
import React from 'react'

// lấy cái quản lí video cho mình
export default function QuanLiVideo() {
  return (
    <div>
      <Navbar/>
      <VideoManager/>
      <Footer/>
    </div>
  )
}
