import { getSession } from "@/lib/actions/auth";
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'

import CreateClient from "@/components/CreateClient";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/')

  return <CreateClient />
}
