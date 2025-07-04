import Footer from '@/components/common/footer';
import Navbar from '@/components/common/navbar';
import NewsDetailIndex from '@/components/module/newsDetails/newsDetailIndex';
import React from 'react';

export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Validate id
  if (!id || typeof id !== 'string') {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-4 text-red-500">
          Lỗi: Không tìm thấy ID tin tức.
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <NewsDetailIndex id={id} />
      <Footer />
    </div>
  );
}