import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ConstructorClient from './ConstructorClient';

export default async function ConstructorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching items for constructor:", error);
  }

  // Map database fields to app fields
  const formattedItems = items?.map(item => ({
    ...item,
    image: item.image_url
  })) || [];

  return <ConstructorClient initialWardrobeItems={formattedItems} />;
}
