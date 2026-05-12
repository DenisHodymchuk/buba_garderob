"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Save, RefreshCw, X, Image as ImageIcon } from "lucide-react";
import Button from "@/components/Button";
import styles from "./page.module.css";
import Image from "next/image";

import { saveLookAction } from "./actions";

export default function ConstructorPage({ initialWardrobeItems }) {
  const [wardrobeItems] = useState(initialWardrobeItems);
  const [canvasItems, setCanvasItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);

  const addItemToCanvas = (item) => {
    // Check if item is already on canvas
    if (canvasItems.find(i => i.id === item.id)) return;
    
    setCanvasItems([
      ...canvasItems,
      {
        ...item,
        x: 50, // Initial position
        y: 50,
        zIndex: canvasItems.length + 1,
        scale: 1,
      }
    ]);
  };

  const removeItem = (id) => {
    setCanvasItems(canvasItems.filter(i => i.id !== id));
  };

  const bringToFront = (id) => {
    const maxZ = Math.max(...canvasItems.map(i => i.zIndex), 0);
    setCanvasItems(canvasItems.map(item => 
      item.id === id ? { ...item, zIndex: maxZ + 1 } : item
    ));
  };

  const handleSaveLook = async () => {
    if (canvasItems.length === 0) {
      alert("Додайте хоча б одну річ, щоб зберегти образ!");
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, we'd get positions from the DOM/motion state
      // but for now we'll send the state as is
      await saveLookAction({
        items: canvasItems
      });
      
      alert("Образ успішно збережено у вашій колекції! 🎉");
      setCanvasItems([]);
    } catch (error) {
      console.error("Error saving look:", error);
      alert("Помилка при збереженні образу: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar with Wardrobe Items */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.backLink}>← Назад</Link>
          <h2>Гардероб</h2>
        </div>
        
        <div className={styles.itemsList}>
          {wardrobeItems.length === 0 && (
            <div className={styles.emptyWardrobe}>
              <p>У вашому гардеробі поки що немає речей.</p>
              <Link href="/items" className={styles.addBtn}>Додати речі</Link>
            </div>
          )}
          {wardrobeItems.map(item => (
            <div 
              key={item.id} 
              className={styles.sidebarItem}
              onClick={() => addItemToCanvas(item)}
            >
              <div className={styles.itemImageWrapper}>
                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className={styles.mainCanvas}>
        <header className={styles.canvasHeader}>
          <h1 className={styles.title}>Новий образ</h1>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setCanvasItems([])} disabled={isSaving}>
              <RefreshCw size={18} />
              Очистити
            </Button>
            <Button variant="primary" onClick={handleSaveLook} disabled={isSaving}>
              <Save size={18} />
              {isSaving ? "Збереження..." : "Зберегти лук"}
            </Button>
          </div>
        </header>

        <div className={styles.canvasWrapper}>
          <div className={styles.canvas} ref={canvasRef}>
            {canvasItems.length === 0 && (
              <div className={styles.emptyState}>
                <ImageIcon size={48} />
                <p>Клікніть на речі зліва, щоб додати їх на полотно</p>
              </div>
            )}
            
            {canvasItems.map((item) => (
              <motion.div
                key={item.id}
                drag
                dragConstraints={canvasRef}
                dragElastic={0.1}
                dragMomentum={false}
                onDragStart={() => bringToFront(item.id)}
                onMouseDown={() => bringToFront(item.id)}
                className={styles.draggableItem}
                style={{
                  x: item.x,
                  y: item.y,
                  zIndex: item.zIndex,
                  scale: item.scale,
                  position: 'absolute',
                  cursor: 'grab'
                }}
              >
                <button className={styles.deleteBtn} onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}>
                  <X size={14} />
                </button>
                <div className={styles.draggableImageWrapper}>
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    style={{ objectFit: 'contain', pointerEvents: 'none' }} 
                    unoptimized
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

