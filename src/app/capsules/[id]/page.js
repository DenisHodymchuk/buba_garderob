import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import CapsuleClient from './CapsuleClient';

export default async function CapsulePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: capsule } = await supabase
    .from('capsules')
    .select(`
      *,
      capsule_items (
        id,
        items (*)
      )
    `)
    .eq('id', id)
    .single();

  const { data: allItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id);

  if (!capsule) return <div>Капсулу не знайдено</div>;

  return (
    <main className={styles.main}>
      <CapsuleClient 
        capsule={capsule} 
        allItems={allItems || []} 
      />
    </main>
  );
}
