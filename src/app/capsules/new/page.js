'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import { AnimatePresence } from 'framer-motion';
import { createCapsule } from '../actions';
import styles from './page.module.css';

export default function NewCapsulePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setToast({ message: "Введіть назву капсули", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      await createCapsule(title, description);
      setToast({ message: "Капсулу створено! 📦", type: "success" });
      setTimeout(() => router.push('/capsules'), 1500);
    } catch (error) {
      setToast({ message: "Помилка: " + error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <header className={styles.header}>
          <Link href="/capsules" className={styles.backLink}><ArrowLeft size={18} /> Скасувати</Link>
          <h1 className={styles.title}>Нова капсула</h1>
        </header>

        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.formGroup}>
            <label>Назва капсули</label>
            <input 
              type="text" 
              placeholder="Наприклад: Поїздка в Париж 🇫🇷" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Опис (необов'язково)</label>
            <textarea 
              placeholder="Що це за капсула?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <Button variant="primary" type="submit" disabled={isSaving} style={{ width: '100%', marginTop: '20px' }}>
            <Save size={18} />
            {isSaving ? "Збереження..." : "Створити капсулу"}
          </Button>
        </form>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </main>
  );
}
