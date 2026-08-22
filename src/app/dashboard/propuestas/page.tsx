import { redirect } from 'next/navigation';

export default function DashboardPropuestasPage() {
  redirect('/dashboard?tab=mensajes');
}
