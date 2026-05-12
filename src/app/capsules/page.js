import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Archive, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default async function CapsulesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const { data: capsules } = await supabase
    .from('capsules')
    .select(`
      *,
      capsule_items (count)
    `)
    .eq('user_id', user.id);

  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.header}>
          <div>
            <Link href="/" className={styles.backLink}><ArrowLeft size={18} /> Назад</Link>
            <h1 className={styles.title}>Капсульні гардероби</h1>
          </div>
          <Link href="/capsules/new" className={styles.createBtn}>
            <Plus size={20} /> Створити капсулу
          </Link>
        </header>

        <div className={styles.grid}>
          {capsules?.length === 0 ? (
            <div className={styles.empty}>
              <Archive size={48} />
              <p>У вас ще немає капсул. Створіть першу для поїздки або сезону!</p>
            </div>
          ) : (
            capsules?.map(capsule => (
              <div key={capsule.id} className={styles.capsuleCard}>
                <div className={styles.cardHeader}>
                  <h3>{capsule.title}</h3>
                  <span className={styles.countBadge}>{capsule.capsule_items?.[0]?.count || 0} речей</span>
                </div>
                <p className={styles.description}>{capsule.description || 'Немає опису'}</p>
                <div className={styles.cardFooter}>
                  <Link href={`/capsules/${capsule.id}`} className={styles.viewBtn}>Переглянути</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
