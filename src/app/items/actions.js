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

  // 1. Remove background using Remove.bg
  let processedFile = file;
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (apiKey) {
    try {
      const formDataBg = new FormData();
      formDataBg.append('image_file', file);
      formDataBg.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formDataBg,
      });

      if (response.ok) {
        const blob = await response.blob();
        processedFile = new File([blob], file.name, { type: 'image/png' });
      } else {
        const errorText = await response.text();
        console.error("Remove.bg error:", errorText);
        // Fallback to original file if BG removal fails
      }
    } catch (error) {
      console.error("Background removal failed:", error);
      // Fallback to original file
    }
  }

  // 2. Upload processed image to Storage
  const fileExt = processedFile.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('wardrobe_images')
    .upload(fileName, processedFile);

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
