import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClass = styles.btn;
  const variantClass = styles[variant] || styles.primary;
  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
