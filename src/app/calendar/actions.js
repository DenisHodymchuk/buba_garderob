'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addLookToCalendar(lookId, date) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('calendar')
    .insert({
      user_id: user.id,
      look_id: lookId,
      date: date
    });

  if (error) throw error;
  
  revalidatePath('/calendar');
}

export async function removeFromCalendar(id) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('calendar')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  
  revalidatePath('/calendar');
}
