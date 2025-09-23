import React from 'react';

import DocumentIndex from '@/components/module/document/documentTypeIndex';

export default async function DocumentPage({ params }: { params: Promise<{ typeDocument: string }> }) {
  const { typeDocument } = await params;
  console.log('TypeDocument in DocumentPage:', typeDocument);
  return (
    <div className="flex flex-col min-h-screen">

      <DocumentIndex typeDocument={typeDocument} />
  
    </div>
  );
}