import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import UpdateLawyerDetailInformation from '@/components/module/update-LawyerDetailInformation/updateLawyerDetailInformation'
import React from 'react'

export default function  LawyerDetailInformationPage() {
  return (
    <div>
      <Navbar/>
   <UpdateLawyerDetailInformation/>
      <Footer/>
    </div>
  )
}
