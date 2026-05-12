"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, Filter, UploadCloud } from "lucide-react";
import ItemCard from "@/components/ItemCard";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import { AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

import { saveItemAction } from "./actions";

export default function ItemsClient({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
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

  const handleSave = async () => {
    if (!itemName.trim()) {
      setToast({ message: "Будь ласка, введіть назву речі", type: "error" });
      return;
    }
    if (!selectedFile) {
      setToast({ message: "Будь ласка, завантажте фото", type: "error" });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', itemName);
      formData.append('category', itemCategory);
      formData.append('season', itemSeason);

      const newItem = await saveItemAction(formData);
      
      setItems([newItem, ...items]);
      setToast({ message: "Річ успішно додана! ✨", type: "success" });
      closeModal();
    } catch (error) {
      console.error("Error saving item:", error);
      setToast({ message: "Помилка збереження: " + error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
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
          
          <Button variant="primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Збереження..." : "Зберегти річ"}
          </Button>
        </div>
      </Modal>

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
