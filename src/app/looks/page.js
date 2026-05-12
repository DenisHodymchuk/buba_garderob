import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Shirt, Trash2, ArrowLeft } from 'lucide-react';
import LooksClient from './LooksClient';
import styles from './page.module.css';

export default async function LooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch looks with their items
  const { data: looks, error } = await supabase
    .from('looks')
    .select(`
      *,
      look_items (
        *,
        items (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching looks:", error);
  }

  return (
    <main className={styles.main}>
      <LooksClient initialLooks={looks || []} />
    </main>
  );
}
