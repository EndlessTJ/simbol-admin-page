import { Divider, Space, Statistic } from 'antd';
import styles from './index.module.scss';
export default function Dashboard() {
  return (

    <div className={styles.dashboard}>
      <div className={styles.dataContainer}>
      <Space split={<Divider type="vertical" />}>
      <Statistic title="Active Users" value={112893} />
      <Statistic title="Active Users" value={112893} />
      <Statistic title="Active Users" value={112893} />

  </Space>
      </div>
      <div className={styles.charsContainer}>

      </div>
    </div>
  );
}