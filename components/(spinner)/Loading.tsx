import React from 'react';
import styles from './AccessibleSpinner.module.css';

const AccessibleSpinner: React.FC = () => {
  return (
    <div className={styles.spinner}>
      <div className={styles.doubleBounce1}></div>
      <div className={styles.doubleBounce2}></div>
    </div>
  );
};

export default AccessibleSpinner;