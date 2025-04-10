// import CertificateTable from "./table/table"
// import { db } from '@/db/index';
// import { desc } from 'drizzle-orm';
// import { certificates } from '@/db/schema';

// export default async function Home() {
//   const certificatesData = await db.query.certificates.findMany({
//     orderBy: desc(certificates.date_Of_Calibration)
//   });

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24">
//       <CertificateTable initialData={certificatesData} />
//     </main>
//   )
// }
