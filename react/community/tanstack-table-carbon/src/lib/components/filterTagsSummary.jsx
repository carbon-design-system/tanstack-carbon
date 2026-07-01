import React, { useState } from 'react';
import { DismissibleTag, Tag, Button } from '@carbon/react';
import { MAX_VISIBLE_FILTER_TAGS } from '../constants/constants';
import styles from './scss/filterTagsSummary.module.scss';

/**
 * FilterTagsSummary Component
 * Displays active column filters as dismissible tags with a clear all button
 *
 * @param {Array} columnFilters - Array of active column filters from TanStack Table
 * @param {Function} onRemoveFilter - Callback to remove a specific filter
 * @param {Function} onClearAll - Callback to clear all filters
 * @param {Object} table - TanStack table instance to get column metadata
 */
const FilterTagsSummary = ({ columnFilters, onRemoveFilter, onClearAll, table }) => {
  const [showAllTags, setShowAllTags] = useState(false);

  if (!columnFilters || columnFilters.length === 0) {
    return null;
  }

  const buildFilterTags = () => {
    const tags = [];

    columnFilters.forEach((filter) => {
      const column = table.getColumn(filter.id);
      const columnName = column?.columnDef?.header || filter.id;

      // NOTE: Handle array values (checkbox filters)
      if (Array.isArray(filter.value)) {
        filter.value.forEach((val) => {
          tags.push({
            id: `${filter.id}-${val}`,
            columnId: filter.id,
            label: `${columnName}: ${val}`,
            value: val,
            isArray: true,
          });
        });
      } else {
        // NOTE: Handle single values (text, select, number filters)
        tags.push({
          id: `${filter.id}-${filter.value}`,
          columnId: filter.id,
          label: `${columnName}: ${filter.value}`,
          value: filter.value,
          isArray: false,
        });
      }
    });

    return tags;
  };

  const filterTags = buildFilterTags();

  const visibleTags = showAllTags ? filterTags : filterTags.slice(0, MAX_VISIBLE_FILTER_TAGS);

  const remainingCount = Math.max(filterTags.length - MAX_VISIBLE_FILTER_TAGS, 0);

  const handleRemoveTag = (tag) => {
    onRemoveFilter(tag.columnId, tag.value, tag.isArray);
  };

  return (
    <div className={styles['filter-tags-summary']}>
      <div className={styles['filter-tags-container']}>
        {visibleTags.map((tag) => (
          <DismissibleTag
            key={tag.id}
            type="gray"
            onClose={() => handleRemoveTag(tag)}
            text={tag.label}
            data-testid={`filter-tag-${tag.columnId}`}
          />
        ))}
        {!showAllTags && remainingCount > 0 && (
          <Tag
            type="high-contrast"
            filter={false}
            onClick={() => setShowAllTags(true)}
            className={styles.moreTags}
          >
            +{remainingCount} more
          </Tag>
        )}

        {showAllTags && filterTags.length > MAX_VISIBLE_FILTER_TAGS && (
          <Tag
            type="high-contrast"
            filter={false}
            onClick={() => setShowAllTags(false)}
            className={styles.moreTags}
          >
            Show less
          </Tag>
        )}
      </div>
      <Button kind="ghost" size="sm" onClick={onClearAll}>
        Clear filters
      </Button>
    </div>
  );
};

export default React.memo(FilterTagsSummary);
