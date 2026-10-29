import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const userCookie = cookieStore.get('user')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const user = userCookie ? JSON.parse(userCookie) : null;
    if (user?.role === 'admin') {
      redirect('/dashboard/admin');
    }

    redirect('/dashboard/user');
  } catch {
    redirect('/login');
  }
}
