import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import CoursesIndex from '@/components/module/courses'
import React from 'react'

export default function CoursePage() {
  return (
    <div>
      <Navbar/>
      <CoursesIndex/>
      <Footer/>
    </div>
  )
}
