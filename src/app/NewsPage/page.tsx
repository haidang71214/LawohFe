import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import NewsList from '@/components/module/newsPages/NewsPageIndex'
import React from 'react'

export default function NewsListPage() {
  return (
    <div>
      <Navbar/>
      <NewsList/>
      <Footer/>
    </div>
  )
}
