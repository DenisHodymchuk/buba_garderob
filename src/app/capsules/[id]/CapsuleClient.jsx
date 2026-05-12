'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import { addItemToCapsule } from '../actions';

export default function CapsuleClient({ capsule, allItems }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = async (itemId) => {
    if (capsule.capsule_items.some(ci => ci.item_id === itemId)) {
      setToast({ message: "Ця річ вже є в капсулі", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      await addItemToCapsule(capsule.id, itemId);
      setToast({ message: "Річ додано до капсули! ✨", type: "success" });
      setIsModalOpen(false);
    } catch (error) {
      setToast({ message: "Помилка: " + error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <Link href="/capsules" className={styles.backLink}><ArrowLeft size={18} /> До капсул</Link>
          <h1 className={styles.title}>{capsule.title}</h1>
          <p className={styles.desc}>{capsule.description}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Додати речі
        </Button>
      </header>

      <div className={styles.grid}>
        {capsule.capsule_items.length === 0 ? (
          <div className={styles.empty}>
            <p>У цій капсулі ще немає речей. Натисніть "Додати речі", щоб почати збирати валізу!</p>
          </div>
        ) : (
          capsule.capsule_items.map(ci => (
            <div key={ci.id} className={styles.itemCard}>
              <div className={styles.imageWrapper}>
                <Image 
                  src={ci.items.image_url} 
                  alt={ci.items.name} 
                  fill 
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>
              <div className={styles.itemInfo}>
                <h4>{ci.items.name}</h4>
                <span>{ci.items.category}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Оберіть речі для капсули">
        <div className={styles.selectorGrid}>
          {allItems.map(item => (
            <div 
              key={item.id} 
              className={`${styles.selectorItem} ${capsule.capsule_items.some(ci => ci.item_id === item.id) ? styles.alreadyIn : ''}`}
              onClick={() => handleAddItem(item.id)}
            >
              <div className={styles.selectorImage}>
                <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
              <span className={styles.selectorName}>{item.name}</span>
            </div>
          ))}
        </div>
      </Modal>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
