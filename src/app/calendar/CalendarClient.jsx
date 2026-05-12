'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Plus, X, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import styles from './page.module.css';
import { addLookToCalendar, removeFromCalendar } from './actions';

export default function CalendarClient({ initialCalendar, looks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];

  const handleDayClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleSelectLook = async (lookId) => {
    setIsSaving(true);
    try {
      await addLookToCalendar(lookId, selectedDate);
      setToast({ message: "Образ додано в календар! 📅", type: "success" });
      setIsModalOpen(false);
    } catch (error) {
      setToast({ message: "Помилка: " + error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await removeFromCalendar(id);
      setToast({ message: "Видалено з календаря", type: "success" });
    } catch (error) {
      setToast({ message: "Помилка: " + error.message, type: "error" });
    }
  };

  const calendarMap = useMemo(() => {
    const map = {};
    initialCalendar.forEach(item => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [initialCalendar]);

  const days = [];
  // Fill empty slots
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayLooks = calendarMap[dateStr] || [];
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString();
    
    days.push(
      <div 
        key={i} 
        className={`${styles.day} ${isToday ? styles.today : ''}`}
        onClick={() => handleDayClick(i)}
      >
        <span className={styles.dayNumber}>{i}</span>
        <div className={styles.dayContent}>
          {dayLooks.map(entry => (
            <div key={entry.id} className={styles.outfitPreview}>
              {entry.looks.look_items.slice(0, 3).map(li => (
                <div key={li.id} className={styles.miniItem}>
                  <Image src={li.items.image_url} alt="item" fill style={{ objectFit: 'contain' }} unoptimized />
                </div>
              ))}
              <button className={styles.removeDayBtn} onClick={(e) => handleDelete(e, entry.id)}>
                <X size={10} />
              </button>
            </div>
          ))}
          {dayLooks.length === 0 && (
            <div className={styles.addIndicator}>
              <Plus size={14} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backLink}><ArrowLeft size={18} /> Назад</Link>
          <h1 className={styles.title}>Календар стилю</h1>
        </div>
        <div className={styles.monthNav}>
          <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={20} /></button>
          <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={20} /></button>
        </div>
      </header>

      <div className={styles.calendarCard}>
        <div className={styles.weekdays}>
          <div>Пн</div><div>Вв</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Нд</div>
        </div>
        <div className={styles.calendarGrid}>
          {days}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Обрати образ на ${selectedDate}`}>
        <div className={styles.looksSelector}>
          {looks.length === 0 ? (
            <div className={styles.noLooks}>
              <p>У вас ще немає створених образів.</p>
              <Link href="/constructor" className={styles.createBtn}>Створити образ</Link>
            </div>
          ) : (
            <div className={styles.looksGrid}>
              {looks.map(look => (
                <div key={look.id} className={styles.lookOption} onClick={() => handleSelectLook(look.id)}>
                  <div className={styles.lookPreview}>
                    {look.look_items.slice(0, 4).map(li => (
                      <div key={li.id} className={styles.previewItem}>
                        <Image src={li.items.image_url} alt="item" fill style={{ objectFit: 'contain' }} unoptimized />
                      </div>
                    ))}
                  </div>
                  <span className={styles.lookTitle}>{look.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
