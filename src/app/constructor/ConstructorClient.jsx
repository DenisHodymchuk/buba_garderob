"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RefreshCw, X, Image as ImageIcon } from "lucide-react";
import Button from "@/components/Button";
import styles from "./page.module.css";
import Image from "next/image";
import Toast from "@/components/Toast";
import CustomSelect from "@/components/CustomSelect";

import { saveLookAction } from "./actions";

export default function ConstructorPage({ initialWardrobeItems, initialCanvasItems, existingLook }) {
  const [wardrobeItems] = useState(initialWardrobeItems);
  const [canvasItems, setCanvasItems] = useState(initialCanvasItems || []);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Metadata states
  const [title, setTitle] = useState(existingLook?.title || "");
  const [season, setSeason] = useState(existingLook?.season || "Універсальний");
  const [tags, setTags] = useState(existingLook?.tags?.join(", ") || "");

  const seasons = ["Універсальний", "Літо", "Осінь", "Зима", "Весна"];

  const canvasRef = useRef(null);

  const removeItem = (id) => {
    setCanvasItems(canvasItems.filter(i => i.id !== id));
  };

  const bringToFront = (id) => {
    const maxZ = Math.max(...canvasItems.map(i => i.zIndex), 0);
    setCanvasItems(canvasItems.map(item => 
      item.id === id ? { ...item, zIndex: maxZ + 1 } : item
    ));
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
      
      setToast({ message: existingLook ? "Образ оновлено! 🎉" : "Образ збережено! 🎉", type: "success" });
      
      if (!existingLook) {
        setCanvasItems([]);
        setTitle("");
        setTags("");
      }
    } catch (error) {
      console.error("Error saving look:", error);
      setToast({ message: "Помилка: " + error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/looks" className={styles.backLink}>← До колекцій</Link>
          <h2>{existingLook ? 'Редагування' : 'Гардероб'}</h2>
        </div>
        
        <div className={styles.itemsList}>
          {wardrobeItems.map(item => (
            <div key={item.id} className={styles.sidebarItem} onClick={() => addItemToCanvas(item)}>
              <div className={styles.itemImageWrapper}>
                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.mainCanvas}>
        <header className={styles.canvasHeader}>
          <div className={styles.headerTop}>
            <input 
              type="text" 
              placeholder="Назва образу..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className={styles.titleInput}
            />
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => setCanvasItems([])} disabled={isSaving} className={styles.headerBtn}>
                <RefreshCw size={18} />
              </Button>
              <Button variant="primary" onClick={handleSaveLook} disabled={isSaving} className={styles.headerBtn}>
                <Save size={18} />
                {isSaving ? "..." : (existingLook ? "Оновити" : "Зберегти")}
              </Button>
            </div>
          </div>
          
          <div className={styles.metaRow}>
            <CustomSelect 
              value={season} 
              onChange={setSeason} 
              options={seasons} 
            />
            <input 
              type="text" 
              placeholder="Теги (через кому)..." 
              value={tags} 
              onChange={(e) => setTags(e.target.value)}
              className={styles.tagsInput}
            />
          </div>
        </header>

        <div className={styles.canvasWrapper}>
          <div className={styles.canvas} ref={canvasRef}>
            {canvasItems.length === 0 && (
              <div className={styles.emptyState}>
                <ImageIcon size={48} />
                <p>Клікніть на речі зліва</p>
              </div>
            )}
            
            {canvasItems.map((item) => (
              <motion.div
                key={item.id}
                drag
                dragConstraints={canvasRef}
                dragMomentum={false}
                onDragStart={() => bringToFront(item.id)}
                className={styles.draggableItem}
                initial={{ x: item.x, y: item.y }}
                animate={{ x: item.x, y: item.y }}
                onDragEnd={(event, info) => {
                  setCanvasItems(items => items.map(i => 
                    i.id === item.id ? { ...i, x: i.x + info.delta.x, y: i.y + info.delta.y } : i
                  ));
                }}
                style={{
                  zIndex: item.zIndex,
                  position: 'absolute',
                }}
              >
                <button className={styles.deleteBtn} onClick={() => removeItem(item.id)}>
                  <X size={14} />
                </button>
                <div className={styles.draggableImageWrapper}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: 'contain', pointerEvents: 'none' }} unoptimized />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
