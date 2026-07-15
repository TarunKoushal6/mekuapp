import { Link } from "react-router-dom";
import { Wallet as WalletIcon } from "lucide-react";
import styles from "./AnimatedWalletCard.module.css";

interface Props {
  to?: string;
  label?: string;
  onClick?: () => void;
}

/**
 * Animated wallet card (Uiverse.io by Pradeepsaranbishnoi).
 * Scoped via CSS module so its generic class names (`card`, `circle`, `overlay`)
 * don't collide with other components.
 */
export const AnimatedWalletCard = ({ to = "/wallet", label = "Wallet", onClick }: Props) => {
  return (
    <Link to={to} onClick={onClick} className={`${styles.wallet} ${styles.card}`}>
      <div className={styles.overlay} />
      <div className={styles.circle}>
        <WalletIcon size={64} strokeWidth={1.6} />
      </div>
      <p className={styles.label}>{label}</p>
    </Link>
  );
};

export default AnimatedWalletCard;
