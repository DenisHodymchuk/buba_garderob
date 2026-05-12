'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveLookAction(lookData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { id, items, title, season, tags } = lookData;

  let look;
  let lookError;

  if (id) {
    // Update existing look
    const { data, error } = await supabase
      .from('looks')
      .update({
        title: title || `Оновлений образ`,
        season: season || 'Універсальний',
        tags: tags || []
      })
      .eq('id', id)
      .select()
      .single();
    look = data;
    lookError = error;
  } else {
    // Create new look
    const { data, error } = await supabase
      .from('looks')
      .insert({
        user_id: user.id,
        title: title || `Образ ${new Date().toLocaleDateString('uk-UA')}`,
        season: season || 'Універсальний',
        tags: tags || []
      })
      .select()
      .single();
    look = data;
    lookError = error;
  }

  if (lookError) {
    console.error("Look saving error:", lookError);
    throw new Error("Failed to save look");
  }

  // 2. Save items belonging to the look (delete old ones first if updating)
  if (id) {
    await supabase.from('look_items').delete().eq('look_id', id);
  }

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
    console.error("Look items saving error:", itemsError);
    throw new Error("Failed to save look items");
  }

  return look;
}

export async function deleteLookAction(id) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('looks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  revalidatePath('/looks');
}
