"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, Filter, UploadCloud } from "lucide-react";
import ItemCard from "@/components/ItemCard";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import styles from "./page.module.css";

import { createClient } from "@/lib/supabase/client";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
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
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        // Map database fields to app fields
        const formattedItems = data.map(item => ({
          ...item,
          image: item.image_url // DB uses image_url, our app uses image
        }));
        setItems(formattedItems);
      }
    }
    setIsLoading(false);
  };

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
      alert("Будь ласка, введіть назву речі");
      return;
    }
    if (!selectedFile) {
      alert("Будь ласка, завантажте фото");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Користувач не авторизований");

      // Upload image to Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wardrobe_images')
        .upload(fileName, selectedFile);
        
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe_images')
        .getPublicUrl(fileName);

      // Save item to Database
      const { data: newItem, error: dbError } = await supabase
        .from('items')
        .insert({
          user_id: user.id,
          name: itemName,
          category: itemCategory,
          season: itemSeason,
          image_url: publicUrl
        })
        .select()
        .single();
        
      if (dbError) throw dbError;

      // Update local state
      setItems([{...newItem, image: newItem.image_url}, ...items]);
      closeModal();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Помилка збереження. Перевірте консоль для деталей.");
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
    </div>
  );
}
