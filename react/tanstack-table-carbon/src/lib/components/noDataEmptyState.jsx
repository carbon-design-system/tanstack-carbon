import React from 'react';
import emptyIcon from '../assets/empty.svg';
import { useLabels } from '../contexts/labelsContext.jsx';
import styles from './scss/noDataEmptyState.module.scss';

const NoDataEmptyState = ({ title, subtitle }) => {
  const labels = useLabels();

  const displayTitle = title || labels.emptyStateTitle;
  const displaySubtitle = subtitle || labels.emptyStateSubtitle;
  return (
    <div className={styles.noDataEmptyState}>
      <div className={styles.illustration}>
        <img src={emptyIcon} alt={labels.emptyStateImageAlt} />
      </div>
      <h3 className={styles.title}>{displayTitle}</h3>
      {displaySubtitle && <p className={styles.subtitle}>{displaySubtitle}</p>}
    </div>
  );
};

export default NoDataEmptyState;
