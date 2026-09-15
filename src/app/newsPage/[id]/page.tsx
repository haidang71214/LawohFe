import NewsDetailIndex from '@/components/module/newsDetail/NewsDetailIndex';
import React from 'react';

export default async function NewsPageDetailAlias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Lỗi: Không tìm thấy ID tin tức.
      </div>
    );
  }

  return <NewsDetailIndex id={id} />;
}
