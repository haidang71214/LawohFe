import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import BookingList from '@/components/module/booking-list/BookingList'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar/>
      <BookingList/>
      <Footer/>
    </div>
  )
}
