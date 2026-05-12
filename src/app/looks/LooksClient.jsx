'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shirt, ArrowLeft, Filter, Search, Tag, Calendar, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import { deleteLookAction } from '../constructor/actions';
import Toast from '@/components/Toast';
import { AnimatePresence } from 'framer-motion';

export default function LooksClient({ initialLooks }) {
  const [looks, setLooks] = useState(initialLooks);
  const [filterSeason, setFilterSeason] = useState('Всі');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Ви впевнені, що хочете видалити цю колекцію?')) return;
    
    try {
      await deleteLookAction(id);
      setLooks(looks.filter(l => l.id !== id));
      setToast({ message: "Колекцію видалено", type: "success" });
    } catch (error) {
      setToast({ message: "Помилка видалення: " + error.message, type: "error" });
    }
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    initialLooks.forEach(look => {
      look.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [initialLooks]);

  const filteredLooks = useMemo(() => {
    return initialLooks.filter(look => {
      const matchesSeason = filterSeason === 'Всі' || look.season === filterSeason;
      const matchesSearch = look.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          look.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSeason && matchesSearch;
    });
  }, [initialLooks, filterSeason, searchQuery]);

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.headerTopRow}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} /> Назад
          </Link>
          <h1 className={styles.title}>Мої колекції</h1>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Пошук за назвою або тегом..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.seasonsFilter}>
            {['Всі', 'Літо', 'Осінь', 'Зима', 'Весна', 'Універсальний'].map(s => (
              <button 
                key={s}
                onClick={() => setFilterSeason(s)}
                className={`${styles.seasonBtn} ${filterSeason === s ? styles.activeSeason : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      {filteredLooks.length === 0 ? (
        <div className={styles.emptyState}>
          <Shirt size={48} />
          <p>Нічого не знайдено за вашим запитом.</p>
          <button onClick={() => {setFilterSeason('Всі'); setSearchQuery('');}} className={styles.resetBtn}>
            Скинути фільтри
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredLooks.map((look) => (
            <div key={look.id} className={styles.lookCard}>
              <div className={styles.lookInner}>
                <div className={styles.lookHeader}>
                  <div className={styles.lookMainInfo}>
                    <h3 className={styles.lookTitle}>{look.title}</h3>
                    <div className={styles.lookMetaTags}>
                      <span className={`${styles.seasonTag} ${styles[look.season]}`}>
                        <Calendar size={12} /> {look.season}
                      </span>
                      {look.tags?.map(tag => (
                        <span key={tag} className={styles.customTag}>
                          <Tag size={12} /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.lookHeaderRight}>
                    <span className={styles.lookDate}>
                      {new Date(look.created_at).toLocaleDateString('uk-UA')}
                    </span>
                    <button className={styles.deleteLookBtn} onClick={() => handleDelete(look.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
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

                <div className={styles.lookFooter}>
                  <span className={styles.itemCount}>
                    {look.look_items.length} {look.look_items.length === 1 ? 'річ' : 'речі'}
                  </span>
                  <Link href={`/constructor?edit=${look.id}`} className={styles.editBtn}>
                    Редагувати
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
