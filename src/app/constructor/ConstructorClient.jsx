'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, RotateCcw, ChevronUp, Layers, 
  Trash2, FlipHorizontal, RotateCw, Lock, Unlock 
} from 'lucide-react';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import CustomSelect from '@/components/CustomSelect';
import styles from './page.module.css';
import { saveLookAction } from './actions';

export default function ConstructorPage({ initialWardrobeItems, initialCanvasItems, existingLook }) {
  const [wardrobeItems] = useState(initialWardrobeItems);
  const [canvasItems, setCanvasItems] = useState(initialCanvasItems || []);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Metadata states
  const [title, setTitle] = useState(existingLook?.title || "");
  const [season, setSeason] = useState(existingLook?.season || "Універсальний");
  const [tags, setTags] = useState(existingLook?.tags?.join(", ") || "");

  const canvasRef = useRef(null);

  const removeItem = (id) => {
    setCanvasItems(canvasItems.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const updateItem = (id, updates) => {
    setCanvasItems(canvasItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const bringToFront = (id) => {
    const maxZ = Math.max(...canvasItems.map(i => i.zIndex), 0);
    updateItem(id, { zIndex: maxZ + 1 });
    setSelectedItemId(id);
  };

  const sendToBack = (id) => {
    const minZ = Math.min(...canvasItems.map(i => i.zIndex), 1);
    updateItem(id, { zIndex: minZ - 1 });
  };

  const handleRotate = (id) => {
    const item = canvasItems.find(i => i.id === id);
    const newRotation = ((item.rotation || 0) + 90) % 360;
    updateItem(id, { rotation: newRotation });
  };

  const handleFlip = (id) => {
    const item = canvasItems.find(i => i.id === id);
    updateItem(id, { flip_x: !item.flip_x });
  };

  const addItemToCanvas = (item) => {
    if (canvasItems.find(i => i.id === item.id)) return;
    
    setCanvasItems([
      ...canvasItems,
      {
        ...item,
        x: 0, 
        y: 0,
        zIndex: canvasItems.length + 1,
        scale: 1,
        rotation: 0,
        flip_x: false
      }
    ]);
  };

  const handleSaveLook = async () => {
    if (canvasItems.length === 0) {
      setToast({ message: "Додайте хоча б одну річ!", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const tagList = tags.split(",").map(t => t.trim()).filter(t => t !== "");
      await saveLookAction({
        id: existingLook?.id,
        items: canvasItems,
        title: title || `Образ ${new Date().toLocaleDateString('uk-UA')}`,
        season,
        tags: tagList
      });
      setToast({ message: "Образ збережено! ✨", type: "success" });
    } catch (error) {
      setToast({ message: "Помилка: " + error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Canvas Area */}
      <main className={styles.mainCanvas} onClick={() => setSelectedItemId(null)}>
        <header className={styles.canvasHeader}>
          <Link href="/looks" className={styles.closeBtn}><X /></Link>
          <h1 className={styles.canvasTitle}>Outfit canvas</h1>
          <div className={styles.topActions}>
             {/* Empty for symmetry or extra buttons */}
          </div>
        </header>

        <div className={styles.canvasArea} ref={canvasRef}>
          {canvasItems.map((item) => (
            <motion.div
              key={item.id}
              drag
              dragConstraints={canvasRef}
              dragMomentum={false}
              onDragStart={() => bringToFront(item.id)}
              onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}
              className={`${styles.draggableItem} ${selectedItemId === item.id ? styles.selected : ''}`}
              initial={{ x: item.x, y: item.y, scale: item.scale || 1, rotate: item.rotation || 0 }}
              animate={{ 
                x: item.x, 
                y: item.y, 
                scale: item.scale || 1, 
                rotate: item.rotation || 0,
                scaleX: item.flip_x ? -1 * (item.scale || 1) : (item.scale || 1)
              }}
              onDragEnd={(event, info) => {
                setCanvasItems(items => items.map(i => 
                  i.id === item.id ? { ...i, x: i.x + info.delta.x, y: i.y + info.delta.y } : i
                ));
              }}
              style={{ zIndex: item.zIndex, position: 'absolute' }}
            >
              <div className={styles.itemImageWrapper}>
                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'contain' }} unoptimized />
              </div>

              {/* Float Toolbar for Selected Item */}
              <AnimatePresence>
                {selectedItemId === item.id && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={styles.itemToolbar}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => handleFlip(item.id)}><FlipHorizontal size={20} /></button>
                    <button onClick={() => handleRotate(item.id)}><RotateCw size={20} /></button>
                    <button onClick={() => bringToFront(item.id)}><Layers size={20} /></button>
                    <button onClick={() => removeItem(item.id)} className={styles.deleteBtn}><Trash2 size={20} /></button>
                    
                    <div className={styles.scaleControl}>
                       <input 
                        type="range" min="0.3" max="2.5" step="0.1" 
                        value={item.scale || 1} 
                        onChange={(e) => updateItem(item.id, { scale: parseFloat(e.target.value) })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className={styles.bottomBar} onClick={(e) => e.stopPropagation()}>
           <button className={styles.undoBtn}><RotateCcw /></button>
           <button className={styles.saveBtn} onClick={handleSaveLook} disabled={isSaving}>
             {isSaving ? "..." : "Save"}
           </button>
           <button className={styles.redoBtn}><RotateCw /></button>
        </div>

        {/* Add Items Drawer Toggle */}
        <button 
          className={`${styles.drawerToggle} ${isSidebarOpen ? styles.drawerOpen : ''}`}
          onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
        >
          <ChevronUp />
          <span>Add Items</span>
        </button>
      </main>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className={styles.sidebar}
          >
            <div className={styles.sidebarHeader}>
              <h3>My Items</h3>
              <button onClick={() => setIsSidebarOpen(false)}><X /></button>
            </div>
            <div className={styles.itemsList}>
              {wardrobeItems.map(item => (
                <div key={item.id} className={styles.sidebarItem} onClick={() => addItemToCanvas(item)}>
                  <div className={styles.thumbWrapper}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
