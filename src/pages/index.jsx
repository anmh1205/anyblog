import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {articles, lessons} from '../content.js';
import styles from './index.module.css';

function CourseHero() {
  const image = useBaseUrl('/img/firmware-bench.webp');
  return (
    <header className={styles.hero}>
      <div className={styles.intro}>
        <p className={styles.kicker}>Giáo trình IVTS</p>
        <h1>Dựng lại<br />firmware <span>IVTS</span></h1>
        <p className={styles.description}>
          Từ project ESP-IDF trống đến firmware theo dõi xe trên ESP32-S3.
          Tự build, đọc log và kiểm tra từng phần trên bàn thử.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} to="/docs/ivts/khoi-dong/">Bắt đầu bài 1</Link>
          <a className={styles.secondary} href="#lo-trinh">Xem lộ trình</a>
        </div>
        <dl className={styles.specs}>
          <div><dt>Vi điều khiển</dt><dd>ESP32-S3</dd></div>
          <div><dt>SDK</dt><dd>ESP-IDF 6.1.1</dd></div>
          <div><dt>Thực hành</dt><dd>{lessons.length} bài</dd></div>
        </dl>
      </div>
      <figure className={styles.figure}>
        <img
          src={image}
          alt="Hai đầu dò đo tín hiệu trên một bảng mạch điện tử"
          width="1448"
          height="1086"
          fetchPriority="high"
        />
        <figcaption>Bàn thử hệ thống nhúng <span>Ảnh minh họa</span></figcaption>
      </figure>
    </header>
  );
}

function CourseRoadmap() {
  return (
    <section className={styles.roadmap} id="lo-trinh" aria-labelledby="roadmap-title">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="roadmap-title">Lộ trình thực hành</h2>
          <p>Build một phần nhỏ, kiểm tra kết quả, rồi ghép phần tiếp theo.</p>
        </div>
        <Link className={styles.sectionLink} to="/docs/ivts/">Mở trang tài liệu</Link>
      </div>
      <ol className={styles.lessonGrid}>
        {lessons.map(({slug, title, summary}, index) => (
          <li key={slug}>
            <Link className={styles.lesson} to={`/docs/ivts/${slug}/`}>
              <span className={styles.lessonNumber}>Bài {String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{title}</h3>
                <p>{summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EditorialNotes() {
  return (
    <section className={styles.notes} aria-labelledby="notes-title">
      <div className={styles.sectionHeading}>
        <h2 id="notes-title">Ghi chép kỹ thuật</h2>
        <Link className={styles.sectionLink} to="/blog/">Tất cả bài viết</Link>
      </div>
      <div className={styles.articleGrid}>
        {articles.map(({slug, topic, title, summary}) => (
          <article key={slug}>
            <Link className={styles.article} to={`/blog/${slug}/`}>
              <p className={styles.articleTopic}>{topic}</p>
              <h3>{title}</h3>
              <p>{summary}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Firmware và hệ thống nhúng"
      description="Học dựng lại firmware IVTS trên ESP32-S3 qua bảy bài thực hành, từ project ESP-IDF trống đến MQTT, OBD và OTA."
    >
      <main className={styles.page}>
        <CourseHero />
        <CourseRoadmap />
        <EditorialNotes />
      </main>
    </Layout>
  );
}
