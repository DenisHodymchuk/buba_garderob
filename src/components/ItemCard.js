import Image from 'next/image';
import styles from './ItemCard.module.css';

export default function ItemCard({ item, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
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
