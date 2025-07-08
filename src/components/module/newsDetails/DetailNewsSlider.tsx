'use client';
import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/fetchApi';
import { useRouter } from 'next/navigation';

interface SliderItem {
  image: string;
  title: string;
  author:string;
  publicDate:string
  _id:string
}

interface DetailNewsSliderProps {
  type?: string;
}

export default function DetailNewsSlider({ type }: DetailNewsSliderProps) {
  const router = useRouter()
const handleNavigate =(id:string)=>{
  router.push(`/newsDetail/${id}`)
}
  const [sliderData, setSliderData] = useState<SliderItem[]>([]);
  console.log(sliderData);
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get('/news/GetAllNews');
        const data = response.data;
        console.log(response);
        
        const filteredData = data.filter(
          (news: any) => news.isAccept === true && (!type || news.type === type)
        );

        const sliderItems = filteredData.map((news: any) => ({
          image: news.image_url[0],
          title: news.mainTitle,
          author:news.userId.name,
          publicDate: new Date(news.createdAt).toLocaleDateString('vi-VN'),
          _id:news._id

        }));
        console.log(sliderItems);
        
        setSliderData(sliderItems.slice(0, 3)); // chỉ lấy 3 phần tử đầu tiên

      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, [type]);

  return (
   <div className="container slider" style={{padding:70,width:'30%'}}>
   <div>
      <h1 style={{fontSize:30}}>Các tin liên quan</h1>
   </div>
      <div style={{borderRadius:20}}>
      {sliderData.length > 0 ? (
  sliderData.map((item, index) => (
    <div
    style={{marginBottom:30,}}
      key={index}
      className="flex items-center bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 m-2 p-3 max-w-[500px] cursor-pointer"
      onClick={()=>{handleNavigate(item._id)}}
    >
      <img
        src={item.image}
        alt={item.title}
        className="object-cover rounded-md mr-4 flex-shrink-0"
        style={{width:'30%',height:'auto'}}
      />
      <div className="flex-1">
  <h2
    style={{
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: '15px',
      lineHeight: '1.4',
      color: '#333',
      wordBreak: 'break-word',
      whiteSpace: 'normal',
    }}
  >
    {item.title}
  </h2>

  <div className="mt-2 text-sm text-gray-600">
    <p><strong>Tác giả:</strong> {item.author}</p>
    <p><strong>Ngày cập nhật:</strong> {item.publicDate}</p>
  </div>
</div>

    </div>
  ))
) : (
  <p className="text-gray-500">Không có tin tức nào phù hợp.</p>
)}

      </div>
    </div>
  );
}
