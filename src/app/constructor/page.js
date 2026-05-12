"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Save, RefreshCw, X, Image as ImageIcon } from "lucide-react";
import Button from "@/components/Button";
import styles from "./page.module.css";
import Image from "next/image";

// MOCK DATA
const WARDROBE_ITEMS = [
  { id: 1, name: "Біла футболка", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60" },
  { id: 2, name: "Сині джинси", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60" },
  { id: 3, name: "Чорна куртка", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60" },
  { id: 4, name: "Кросівки", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60" }
];

export default function ConstructorPage() {
  const [canvasItems, setCanvasItems] = useState([]);
  const canvasRef = useRef(null);

  const addItemToCanvas = (item) => {
    // Check if item is already on canvas
    if (canvasItems.find(i => i.id === item.id)) return;
    
    setCanvasItems([
      ...canvasItems,
      {
        ...item,
        x: Math.random() * 100 + 50,
        y: Math.random() * 100 + 50,
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

  const handleSaveLook = () => {
    if (canvasItems.length === 0) {
      alert("Додайте хоча б одну річ, щоб зберегти образ!");
      return;
    }
    
    alert("Образ успішно збережено у вашій колекції! 🎉");
    setCanvasItems([]);
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
          {WARDROBE_ITEMS.map(item => (
            <div 
              key={item.id} 
              className={styles.sidebarItem}
              onClick={() => addItemToCanvas(item)}
            >
              <div className={styles.itemImageWrapper}>
                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
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
            <Button variant="secondary" onClick={() => setCanvasItems([])}>
              <RefreshCw size={18} />
              Очистити
            </Button>
            <Button variant="primary" onClick={handleSaveLook}>
              <Save size={18} />
              Зберегти лук
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
                }}
              >
                <button className={styles.deleteBtn} onClick={() => removeItem(item.id)}>
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
