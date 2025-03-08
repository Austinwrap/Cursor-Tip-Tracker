import styles from './PremiumTeaser.module.css';

export default function PremiumTeaser() {
  return (
    <div className={styles.teaserContainer}>
      <h2 className={styles.teaserTitle}>Upgrade to Premium</h2>
      
      <div className={styles.featureList}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📊</div>
          <div className={styles.featureContent}>
            <h3>Advanced Analytics</h3>
            <p>See detailed breakdowns by day, week, month, and year</p>
          </div>
        </div>
        
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔮</div>
          <div className={styles.featureContent}>
            <h3>Smart Predictions</h3>
            <p>Get personalized recommendations on when to work for maximum earnings</p>
          </div>
        </div>
        
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📱</div>
          <div className={styles.featureContent}>
            <h3>Export & Backup</h3>
            <p>Download your data or sync across devices</p>
          </div>
        </div>
        
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔍</div>
          <div className={styles.featureContent}>
            <h3>Trend Analysis</h3>
            <p>Identify patterns in your earnings over time</p>
          </div>
        </div>
      </div>
      
      <div className={styles.pricingSection}>
        <div className={styles.price}>
          <span className={styles.amount}>$30</span>
          <span className={styles.period}>/year</span>
        </div>
        <p className={styles.pricingNote}>That's just $2.50 per month!</p>
      </div>
      
      <a href="/premium" className={styles.upgradeButton}>
        Upgrade Now
      </a>
    </div>
  );
} 