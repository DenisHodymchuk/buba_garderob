"use client";
import Link from "next/link";
import { PieChart, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import styles from "./page.module.css";

export default function AnalyticsPage() {
  return (
    <div className={`${styles.container} container`}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.backLink}>← На головну</Link>
          <h1 className={styles.title}>Аналітика гардеробу</h1>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-panel`}>
          <div className={styles.statHeader}>
            <h3>Загальна вартість</h3>
            <DollarSign className={styles.icon} />
          </div>
          <p className={styles.statValue}>₴45,200</p>
          <span className={`${styles.statChange} ${styles.positive}`}>
            <ArrowUpRight size={16} /> +12% за місяць
          </span>
        </div>

        <div className={`${styles.statCard} glass-panel`}>
          <div className={styles.statHeader}>
            <h3>Кількість речей</h3>
            <PieChart className={styles.icon} />
          </div>
          <p className={styles.statValue}>124</p>
          <span className={styles.statChange}>
             В середньому 35 носінь на річ
          </span>
        </div>

        <div className={`${styles.statCard} glass-panel`}>
          <div className={styles.statHeader}>
            <h3>Cost Per Wear (CPW)</h3>
            <TrendingUp className={styles.icon} />
          </div>
          <p className={styles.statValue}>₴12.50</p>
          <span className={`${styles.statChange} ${styles.negative}`}>
            <ArrowDownRight size={16} /> -₴2.30 за місяць
          </span>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={`${styles.panel} glass-panel`}>
          <h3>Найпопулярніші речі</h3>
          <ul className={styles.itemList}>
            <li><span>Біла базова футболка</span> <span>45 носінь</span></li>
            <li><span>Сині джинси Levis</span> <span>38 носінь</span></li>
            <li><span>Кросівки Nike Air</span> <span>32 носіння</span></li>
          </ul>
        </div>
        <div className={`${styles.panel} glass-panel`}>
          <h3>Речі, які давно не вдягались</h3>
          <ul className={styles.itemList}>
            <li><span>Жовтий светр</span> <span>0 носінь (6 міс)</span></li>
            <li><span>Світлі штани</span> <span>1 носіння (4 міс)</span></li>
            <li><span>Класичний піджак</span> <span>2 носіння (1 рік)</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
