import styles from './ChartSkeleton.module.css'

export default function ChartSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.topBarItem} />
        <div className={styles.topBarItem} />
        <div className={styles.topBarItem} />
        <div className={styles.topBarItem} />
      </div>
      <div className={styles.body} />
      <div className={styles.label}>차트 불러오는 중...</div>
    </div>
  )
}
