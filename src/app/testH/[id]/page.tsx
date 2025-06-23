import UserHai from "./user2";

interface TestPageProps {
   params: {id: string} | Promise<{id: string}>
}

export default async function TestPage({params}: Readonly<TestPageProps>) {
   const p = await params;

   return <UserHai id={p.id}/>
}
