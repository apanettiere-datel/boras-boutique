import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { isAdminSession } from '@/lib/admin-auth'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies()
  if (!(await isAdminSession(cookieStore))) redirect('/admin/login')
  return <AdminShell>{children}</AdminShell>
}
