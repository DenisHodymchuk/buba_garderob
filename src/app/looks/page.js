import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Shirt, Trash2, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default async function LooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch looks with their items
  const { data: looks, error } = await supabase
    .from('looks')
    .select(`
      *,
      look_items (
        *,
        items (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching looks:", error);
  }

  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} /> Назад
          </Link>
          <h1 className={styles.title}>Мої колекції</h1>
        </header>

        {looks?.length === 0 ? (
          <div className={styles.emptyState}>
            <Shirt size={48} />
            <p>Ви ще не створили жодного образу.</p>
            <Link href="/constructor" className={styles.createBtn}>
              Створити перший лук
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {looks?.map((look) => (
              <div key={look.id} className={`${styles.lookCard} glass-panel`}>
                <div className={styles.lookHeader}>
                  <h3 className={styles.lookTitle}>{look.title}</h3>
                  <span className={styles.lookDate}>
                    {new Date(look.created_at).toLocaleDateString('uk-UA')}
                  </span>
                </div>
                
                <div className={styles.itemsPreview}>
                  {look.look_items.map((li) => (
                    <div key={li.id} className={styles.itemThumb}>
                      <Image 
                        src={li.items.image_url} 
                        alt={li.items.name} 
                        fill 
                        style={{ objectFit: 'contain' }}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.lookActions}>
                  <span className={styles.itemCount}>
                    {look.look_items.length} {look.look_items.length === 1 ? 'річ' : 'речі'}
                  </span>
                  <Link href={`/constructor?edit=${look.id}`} className={styles.editBtn}>
                    Редагувати
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
