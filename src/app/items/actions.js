'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveItemAction(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const file = formData.get('file');
  const name = formData.get('name');
  const category = formData.get('category');
  const season = formData.get('season');

  if (!file || !name) {
    throw new Error("Missing required fields");
  }

  // Upload image to Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('wardrobe_images')
    .upload(fileName, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Failed to upload image");
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('wardrobe_images')
    .getPublicUrl(fileName);

  // Save item to Database
  const { data: newItem, error: dbError } = await supabase
    .from('items')
    .insert({
      user_id: user.id,
      name,
      category,
      season,
      image_url: publicUrl
    })
    .select()
    .single();

  if (dbError) {
    console.error("DB error:", dbError);
    throw new Error("Failed to save item to database");
  }

  return { ...newItem, image: newItem.image_url };
}
