'use client';
import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import LoginIndex from '@/components/module/login/login'
import React from 'react'

export default function LoginPage() {
  return (
    <div>
      <Navbar/>
      <LoginIndex/>
      <Footer/>
    </div>
  )
}
