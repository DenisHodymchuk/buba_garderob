import Link from "next/link";
import { redirect } from "next/navigation";
import { Shirt, Scissors, CalendarDays, BarChart2, PackageOpen, Sparkles, LogIn, LogOut } from "lucide-react";
import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect("/");
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={`${styles.nav} container`}>
          <div className={styles.logo}>Wardrobe</div>
          <nav className={styles.navLinks}>
            <Link href="/items" className={styles.navLink}>Речі</Link>
            <Link href="/constructor" className={styles.navLink}>Конструктор</Link>
            <Link href="/calendar" className={styles.navLink}>Календар</Link>
            <Link href="/analytics" className={styles.navLink}>Аналітика</Link>
            
            {user ? (
              <form action={signOut} style={{ margin: 0 }}>
                <button type="submit" className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
                  <LogOut size={16} /> Вийти
                </button>
              </form>
            ) : (
              <Link href="/login" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogIn size={16} /> Увійти
              </Link>
            )}
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className={styles.heroTitle}>Твій цифровий <span>гардероб</span> нового покоління</h1>
          <p className={styles.heroSubtitle}>
            Керуй своїми речами, створюй неймовірні образи, плануй капсули для подорожей та отримуй аналітику свого стилю.
          </p>
          <div className={styles.actions}>
            <Link href="/constructor" className={styles.primaryBtn}>
              <Sparkles size={20} />
              Створити образ
            </Link>
            <Link href="/items" className={styles.secondaryBtn}>
              Мої речі
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.dashboard} container`}>
        <div className={`${styles.card} glass-panel`}>
          <div className={styles.cardIcon}>
            <Shirt size={24} />
          </div>
          <h3 className={styles.cardTitle}>Мої речі</h3>
          <p className={styles.cardDesc}>Завантажуйте одяг з автоматичним видаленням фону та сортуйте за сезонами.</p>
        </div>

        <div className={`${styles.card} glass-panel`}>
          <div className={styles.cardIcon}>
            <Scissors size={24} />
          </div>
          <h3 className={styles.cardTitle}>Конструктор образів</h3>
          <p className={styles.cardDesc}>Поєднуйте речі на зручному полотні (Drag & Drop) та зберігайте найкращі луки.</p>
        </div>

        <div className={`${styles.card} glass-panel`}>
          <div className={styles.cardIcon}>
            <CalendarDays size={24} />
          </div>
          <h3 className={styles.cardTitle}>Календар луків</h3>
          <p className={styles.cardDesc}>Плануйте свої образи на тиждень вперед та ніколи не думайте "що сьогодні вдягнути".</p>
        </div>

        <div className={`${styles.card} glass-panel`}>
          <div className={styles.cardIcon}>
            <PackageOpen size={24} />
          </div>
          <h3 className={styles.cardTitle}>Капсули в подорож</h3>
          <p className={styles.cardDesc}>Збирайте цифрові валізи, щоб точно знати, які речі взяти з собою у відпустку.</p>
        </div>

        <div className={`${styles.card} glass-panel`}>
          <div className={styles.cardIcon}>
            <BarChart2 size={24} />
          </div>
          <h3 className={styles.cardTitle}>Аналітика</h3>
          <p className={styles.cardDesc}>Відслідковуйте вартість одного носіння (Cost Per Wear) та дізнайтеся, що ви носите найчастіше.</p>
        </div>
      </section>
    </main>
  );
}
