import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import React from 'react'
import VideoManager from './VideoManage'

export default function page() {
  return (
    <div>
      <Navbar/>
      <VideoManager/>
      <Footer/>
    </div>
  )
}
