"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Button from "@/components/Button";
import styles from "./page.module.css";
import Image from "next/image";

// Mock Data
const MOCK_CALENDAR = {
  "2026-05-13": [
    { id: 1, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&auto=format&fit=crop&q=60" },
    { id: 2, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&auto=format&fit=crop&q=60" }
  ],
  "2026-05-15": [
    { id: 3, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&auto=format&fit=crop&q=60" }
  ]
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 12)); // May 2026 for mock

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];

  const days = [];
  // Fill empty slots for first week
  for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
    days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const outfit = MOCK_CALENDAR[dateStr];
    
    days.push(
      <div key={i} className={`${styles.day} ${i === 12 ? styles.today : ''}`}>
        <span className={styles.dayNumber}>{i}</span>
        {outfit ? (
          <div className={styles.outfitPreview}>
            {outfit.map(item => (
              <div key={item.id} className={styles.outfitItem}>
                <Image src={item.image} alt="outfit item" fill style={{ objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        ) : (
          <button className={styles.addOutfitBtn}>
            <Plus size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.container} container`}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.backLink}>← На головну</Link>
          <h1 className={styles.title}>Календар образів</h1>
        </div>
      </header>

      <div className={styles.calendarWrapper}>
        <div className={styles.calendarHeader}>
          <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={24} /></button>
          <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={24} /></button>
        </div>
        
        <div className={styles.weekdays}>
          <div>Пн</div><div>Вв</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Нд</div>
        </div>
        
        <div className={styles.calendarGrid}>
          {days}
        </div>
      </div>
    </div>
  );
}
