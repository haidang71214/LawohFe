import Footer from '@/components/common/footer';
import Navbar from '@/components/common/navbar';
import DetailLawyer from '@/components/module/DetailLawyers/DetailLawyer';

// Mark the function as async to allow awaiting params
export default async function LawyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params to resolve the Promise
  const { id } = await params;

  return (
    <div>
      <Navbar />
      <DetailLawyer id={id} />
      <Footer />
    </div>
  );
}