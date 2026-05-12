'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shirt, ArrowLeft, Filter, Search, Tag, Calendar, Trash2, Heart, Send, MoreHorizontal, Edit2, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import { deleteLookAction } from '../constructor/actions';
import Toast from '@/components/Toast';

export default function LooksClient({ initialLooks }) {
  const [looks, setLooks] = useState(initialLooks);
  const [filterSeason, setFilterSeason] = useState('Всі');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedLook, setSelectedLook] = useState(null);
  const [activeTab, setActiveTab] = useState('About');

  const handleDelete = async (id) => {
    if (!confirm('Ви впевнені, що хочете видалити цю колекцію?')) return;
    try {
      await deleteLookAction(id);
      setLooks(looks.filter(l => l.id !== id));
      setSelectedLook(null);
      setToast({ message: "Колекцію видалено", type: "success" });
    } catch (error) {
      setToast({ message: "Помилка видалення: " + error.message, type: "error" });
    }
  };

  const filteredLooks = useMemo(() => {
    return looks.filter(look => {
      const matchesSeason = filterSeason === 'Всі' || look.season === filterSeason;
      const matchesSearch = look.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          look.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSeason && matchesSearch;
    });
  }, [looks, filterSeason, searchQuery]);

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.headerTopRow}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} /> Назад
          </Link>
          <h1 className={styles.title}>Колекції</h1>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Пошук..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.seasonsFilter}>
            {['Всі', 'Літо', 'Осінь', 'Зима', 'Весна'].map(s => (
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

      <div className={styles.grid}>
        {filteredLooks.map((look) => (
          <div key={look.id} className={styles.lookCard} onClick={() => setSelectedLook(look)}>
            <div className={styles.cardPreview}>
              {look.look_items.slice(0, 3).map((li, idx) => (
                <div key={li.id} className={styles.cardThumb} style={{ zIndex: 10 - idx }}>
                  <Image src={li.items.image_url} alt="" fill style={{ objectFit: 'contain' }} unoptimized />
                </div>
              ))}
              {look.look_items.length > 3 && (
                <div className={styles.moreCount}>+{look.look_items.length - 3}</div>
              )}
            </div>
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>{look.title}</h3>
              <span className={styles.cardSeason}>{look.season}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Look Detail View (Overlay) */}
      <AnimatePresence>
        {selectedLook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.detailOverlay}
            onClick={() => setSelectedLook(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className={styles.detailSheet}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.sheetHeader}>
                <span className={styles.wornCount}>0 times worn</span>
                <button onClick={() => setSelectedLook(null)} className={styles.closeSheet}><X /></button>
              </div>

              <div className={styles.lookVisual}>
                <div className={styles.canvasPreview}>
                  {selectedLook.look_items.map((li) => (
                    <div 
                      key={li.id} 
                      className={styles.previewItem}
                      style={{
                        left: `${li.x}%`,
                        top: `${li.y}%`,
                        zIndex: li.z_index,
                        transform: `translate(-50%, -50%) scale(${li.scale}) rotate(${li.rotation}deg) ${li.flip_x ? 'scaleX(-1)' : ''}`,
                        position: 'absolute',
                        width: '100px',
                        height: '100px'
                      }}
                    >
                      <Image src={li.items.image_url} alt="" fill style={{ objectFit: 'contain' }} unoptimized />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.sheetActions}>
                <div className={styles.leftIcons}>
                  <Link href={`/constructor?edit=${selectedLook.id}`}><Edit2 size={24} /></Link>
                  <button><Heart size={24} /></button>
                  <button><Send size={24} /></button>
                  <button onClick={() => handleDelete(selectedLook.id)} className={styles.dangerIcon}><Trash2 size={24} /></button>
                </div>
                <button className={styles.scheduleBtn}>
                  <CalendarIcon size={18} /> Schedule
                </button>
              </div>

              <div className={styles.tabs}>
                {['About', 'Styling', 'Stats'].map(tab => (
                  <button 
                    key={tab} 
                    className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className={styles.tabContent}>
                {activeTab === 'About' && (
                  <div className={styles.aboutSection}>
                    <div className={styles.stylingTagsHeader}>
                      <h4>Styling tags</h4>
                      <ChevronUp size={20} />
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Tags</span>
                      <button className={styles.addBtn}>Add</button>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Season</span>
                      <span className={styles.metaValue}>{selectedLook.season}</span>
                      <button className={styles.addBtn}>Edit</button>
                    </div>
                    <button className={styles.fullSaveBtn}>Save</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ChevronUp({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
}
