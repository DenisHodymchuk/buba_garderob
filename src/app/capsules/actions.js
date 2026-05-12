'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCapsule(title, description) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('capsules')
    .insert({
      user_id: user.id,
      title,
      description
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/capsules');
  return data;
}

export async function addItemToCapsule(capsuleId, itemId) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('capsule_items')
    .insert({
      capsule_id: capsuleId,
      item_id: itemId
    });

  if (error) throw error;
  revalidatePath(`/capsules/${capsuleId}`);
}
