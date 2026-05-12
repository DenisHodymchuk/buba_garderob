'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveLookAction(lookData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { items } = lookData;

  // 1. Create the look
  const { data: look, error: lookError } = await supabase
    .from('looks')
    .insert({
      user_id: user.id,
      title: `Образ ${new Date().toLocaleDateString('uk-UA')}`
    })
    .select()
    .single();

  if (lookError) {
    console.error("Look creation error:", lookError);
    throw new Error("Failed to create look");
  }

  // 2. Save items belonging to the look
  const lookItems = items.map(item => ({
    look_id: look.id,
    item_id: item.id,
    x: item.x || 50,
    y: item.y || 50,
    z_index: item.zIndex || 1,
    scale: item.scale || 1
  }));

  const { error: itemsError } = await supabase
    .from('look_items')
    .insert(lookItems);

  if (itemsError) {
    console.error("Look items creation error:", itemsError);
    throw new Error("Failed to save look items");
  }

  return look;
}
