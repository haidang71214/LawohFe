import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import BookingListForLawyer from '@/components/module/booking-listForLaywer/BookingListForLawyer'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar/>
      <BookingListForLawyer/>
      <Footer/>
    </div>
  )
}
