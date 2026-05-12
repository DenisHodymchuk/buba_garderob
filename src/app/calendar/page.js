import { createClient } from '@/lib/supabase/server';
import CalendarClient from './CalendarClient';
import styles from './page.module.css';

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Будь ласка, увійдіть в систему</div>;
  }

  // Fetch calendar entries with looks and items
  const { data: calendarData } = await supabase
    .from('calendar')
    .select(`
      *,
      looks (
        id,
        title,
        look_items (
          id,
          items (image_url)
        )
      )
    `)
    .eq('user_id', user.id);

  // Fetch all looks for the selector
  const { data: looks } = await supabase
    .from('looks')
    .select(`
      id,
      title,
      look_items (
        id,
        items (image_url)
      )
    `)
    .eq('user_id', user.id);

  return (
    <main className={styles.main}>
      <CalendarClient 
        initialCalendar={calendarData || []} 
        looks={looks || []} 
      />
    </main>
  );
}
