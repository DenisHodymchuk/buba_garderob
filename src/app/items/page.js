"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, Filter, UploadCloud } from "lucide-react";
import ItemCard from "@/components/ItemCard";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import styles from "./page.module.css";

// MOCK DATA
const MOCK_ITEMS = [
  { id: 1, name: "Біла футболка", category: "Верх", season: "Літо", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60" },
  { id: 2, name: "Сині джинси", category: "Низ", season: "Демісезон", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60" },
  { id: 3, name: "Чорна куртка", category: "Верхній одяг", season: "Осінь", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60" },
  { id: 4, name: "Кросівки", category: "Взуття", season: "Всесезонна", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60" }
];

export default function ItemsPage() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("Всі");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Form states
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Верх");
  const [itemSeason, setItemSeason] = useState("Літо");

  const fileInputRef = useRef(null);

  const categories = ["Всі", "Верх", "Низ", "Верхній одяг", "Взуття", "Аксесуари"];
  const filteredItems = filter === "Всі" ? items : items.filter(i => i.category === filter);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setItemName("");
    setItemCategory("Верх");
    setItemSeason("Літо");
  };

  const handleSave = () => {
    if (!itemName.trim()) {
      alert("Будь ласка, введіть назву речі");
      return;
    }
    if (!previewUrl) {
      alert("Будь ласка, завантажте фото");
      return;
    }
    
    const newItem = {
      id: Date.now(),
      name: itemName,
      category: itemCategory,
      season: itemSeason,
      image: previewUrl
    };
    
    setItems([newItem, ...items]);
    closeModal();
  };

  return (
    <div className={`${styles.container} container`}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.backLink}>← На головну</Link>
          <h1 className={styles.title}>Мої речі</h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Додати річ
        </Button>
      </header>

      <div className={styles.filters}>
        <Filter size={20} className={styles.filterIcon} />
        {categories.map(cat => (
          <button 
            key={cat}
            className={`${styles.filterBtn} ${filter === cat ? styles.active : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filteredItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Додати нову річ">
        <div className={styles.uploadForm}>
          <div 
            className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={triggerSelect}
            style={dragActive ? { borderColor: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)' } : {}}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleChange} 
              accept="image/*" 
              style={{ display: "none" }} 
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ maxHeight: "150px", objectFit: "contain", borderRadius: "8px" }} />
            ) : (
              <>
                <UploadCloud size={48} className={styles.uploadIcon} />
                <p>Перетягніть фото сюди або клікніть для завантаження</p>
                <span className={styles.aiBadge}>AI автоматично видалить фон ✨</span>
              </>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label>Назва речі</label>
            <input 
              type="text" 
              placeholder="Наприклад: Біла базова футболка" 
              className={styles.input} 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Категорія</label>
              <select className={styles.input} value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
                <option>Верх</option>
                <option>Низ</option>
                <option>Верхній одяг</option>
                <option>Взуття</option>
                <option>Аксесуари</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Сезон</label>
              <select className={styles.input} value={itemSeason} onChange={(e) => setItemSeason(e.target.value)}>
                <option>Літо</option>
                <option>Демісезон</option>
                <option>Зима</option>
                <option>Всесезонна</option>
              </select>
            </div>
          </div>
          
          <Button variant="primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleSave}>
            Зберегти річ
          </Button>
        </div>
      </Modal>
    </div>
  );
}
