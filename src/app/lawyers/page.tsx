// app/lawyers/[type]/page.tsx

import ShittingFile from '@/components/module/lawyers/ShittingFile';
import React from 'react';

// // Định nghĩa kiểu cho params
// interface PageProps {
//   params: {
//     type: string; // Kiểu của type là string, vì đây là tham số động từ URL
//   };
// }
// { params }: PageProps
export default function Page() {
  // const { type } = params; // Lấy tham số 'type' từ URL

  return (
    <div>
  
      <ShittingFile/>

    </div>
  );
}