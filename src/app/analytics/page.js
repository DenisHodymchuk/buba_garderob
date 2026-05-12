import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { PieChart, TrendingUp, ShoppingBag, ArrowLeft, Layers, Calendar } from 'lucide-react';
import styles from './page.module.css';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  // Fetch real stats
  const { data: items } = await supabase.from('items').select('category, season').eq('user_id', user.id);
  const { count: looksCount } = await supabase.from('looks').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const { count: calendarCount } = await supabase.from('calendar').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

  const totalItems = items?.length || 0;
  
  // Categorization
  const categories = items?.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {}) || {};

  const seasons = items?.reduce((acc, item) => {
    acc[item.season] = (acc[item.season] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}><ArrowLeft size={18} /> Назад</Link>
          <h1 className={styles.title}>Аналітика гардеробу</h1>
        </header>

        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} glass-panel`}>
            <div className={styles.statHeader}>
              <h3>Всього речей</h3>
              <ShoppingBag className={styles.icon} />
            </div>
            <p className={styles.statValue}>{totalItems}</p>
            <span className={styles.statSub}>У вашому гардеробі</span>
          </div>

          <div className={`${styles.statCard} glass-panel`}>
            <div className={styles.statHeader}>
              <h3>Створено образів</h3>
              <Layers className={styles.icon} />
            </div>
            <p className={styles.statValue}>{looksCount || 0}</p>
            <span className={styles.statSub}>В конструкторі</span>
          </div>

          <div className={`${styles.statCard} glass-panel`}>
            <div className={styles.statHeader}>
              <h3>Заплановано виходів</h3>
              <Calendar className={styles.icon} />
            </div>
            <p className={styles.statValue}>{calendarCount || 0}</p>
            <span className={styles.statSub}>У календарі</span>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          <div className={`${styles.chartPanel} glass-panel`}>
            <div className={styles.panelHeader}>
              <PieChart size={20} />
              <h3>Розподіл за категоріями</h3>
            </div>
            <div className={styles.barList}>
              {Object.entries(categories).map(([cat, count]) => (
                <div key={cat} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span>{cat}</span>
                    <span>{count}</span>
                  </div>
                  <div className={styles.barBg}>
                    <div 
                      className={styles.barFill} 
                      style={{ width: `${(count / totalItems) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.chartPanel} glass-panel`}>
            <div className={styles.panelHeader}>
              <TrendingUp size={20} />
              <h3>Сезонність</h3>
            </div>
            <div className={styles.barList}>
              {Object.entries(seasons).map(([season, count]) => (
                <div key={season} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span>{season}</span>
                    <span>{count}</span>
                  </div>
                  <div className={styles.barBg}>
                    <div 
                      className={styles.barFill} 
                      style={{ width: `${(count / totalItems) * 100}%`, background: 'linear-gradient(to right, #a855f7, #ec4899)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
