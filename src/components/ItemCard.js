import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import styles from './ItemCard.module.css';

export default function ItemCard({ item, onClick, onDelete }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <button 
        className={styles.deleteBtn} 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
      >
        <Trash2 size={16} />
      </button>
      <div className={styles.imageContainer}>
        {item.image ? (
          <Image 
            src={item.image} 
            alt={item.name} 
            fill 
            className={styles.image} 
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.placeholder}>Немає фото</div>
        )}
      </div>
      <div className={styles.info}>
        <h4 className={styles.name}>{item.name}</h4>
        <span className={styles.category}>{item.category}</span>
      </div>
    </div>
  );
}
