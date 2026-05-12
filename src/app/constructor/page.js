import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ConstructorClient from './ConstructorClient';

export default async function ConstructorPage({ searchParams }) {
  const params = await searchParams;
  const lookId = params.edit;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch wardrobe items
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch existing look if in edit mode
  let initialCanvasItems = [];
  let existingLook = null;
  
  if (lookId) {
    const { data: look } = await supabase
      .from('looks')
      .select(`
        *,
        look_items (
          *,
          items (*)
        )
      `)
      .eq('id', lookId)
      .single();
      
    if (look) {
      existingLook = look;
      initialCanvasItems = look.look_items.map(li => ({
        ...li.items,
        image: li.items.image_url,
        x: li.x,
        y: li.y,
        zIndex: li.z_index,
        scale: li.scale
      }));
    }
  }

  const formattedWardrobe = items?.map(item => ({
    ...item,
    image: item.image_url
  })) || [];

  return (
    <ConstructorClient 
      initialWardrobeItems={formattedWardrobe} 
      initialCanvasItems={initialCanvasItems}
      existingLook={existingLook}
    />
  );
}
