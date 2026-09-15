import React from 'react';
import DocumentIndex from '@/components/module/document/documentTypeIndex';

export default function DocumentMainPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DocumentIndex typeDocument="ALL" />
    </div>
  );
}
