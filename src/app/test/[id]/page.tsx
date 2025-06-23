import PageComp from "./page-comp";

interface TestPageProps {
   params: {id: string} | Promise<{id: string}>
}

export default async function TestPage({params}: Readonly<TestPageProps>) {
   const p = await params;

   return <PageComp id={p.id} />
}
