import AboutUs from '@/components/module/about'
import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar/>
      <AboutUs/>
      <Footer/>
    </div>
  )
}
