import React from 'react';
import styles from './AccessibleSpinner.module.css';

const AccessibleSpinner: React.FC = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}>
        <div className={styles.doubleBounce1}></div>
        <div className={styles.doubleBounce2}></div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    </div>
  );
};

export default AccessibleSpinner;