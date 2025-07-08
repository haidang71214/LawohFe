import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import NewManagerr from '@/components/module/newsManagerr/newManagerr'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar/>
      <NewManagerr/>
      <Footer/>
    </div>
  )
}
