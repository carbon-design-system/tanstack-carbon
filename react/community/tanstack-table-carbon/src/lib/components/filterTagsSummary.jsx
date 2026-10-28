import React, { useState } from 'react';
import { DismissibleTag, Tag, Button } from '@carbon/react';
import { MAX_VISIBLE_FILTER_TAGS } from '../constants/constants';
import styles from './scss/filterTagsSummary.module.scss';

/**
 * FilterTagsSummary Component
 * Displays active column filters as dismissible tags with a clear all button.
 * Also displays custom filter tags when custom filter config is used.
 *
 * @param {Array}    columnFilters        - Active TanStack column filters
 * @param {Function} onRemoveFilter       - Remove a specific column filter
 * @param {Function} onClearAll           - Clear all column filters
 * @param {Object}   table                - TanStack table instance
 * @param {Object}   appliedCustomFilters - Flat key/value map of applied custom filters
 * @param {Function} onClearCustomFilters - Clears all custom filters (calls onReset)
 */
const FilterTagsSummary = ({
  columnFilters,
  onRemoveFilter,
  onClearAll,
  table,
  appliedCustomFilters = {},
  onRemoveCustomFilter,
  onClearCustomFilters,
}) => {
  const [showAllTags, setShowAllTags] = useState(false);

  const formatFilterValue = (value) => {
    if (!value || typeof value !== 'object') {
      return String(value ?? '');
    }
    // Slider: { min, max }
    if (value.min !== undefined && value.max !== undefined) {
      return `${Number(value.min).toLocaleString()} – ${Number(
        value.max
      ).toLocaleString()}`;
    }
    // DateRange: { start, end }
    if (value.start !== undefined || value.end !== undefined) {
      const fmt = (d) =>
        d
          ? new Date(d).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '…';
      return `${fmt(value.start)} – ${fmt(value.end)}`;
    }
    return String(value);
  };

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
            isCustom: false,
          });
        });
      } else {
        // NOTE: Handle single values — format objects (slider, dateRange, date) into readable strings
        tags.push({
          id: `${filter.id}-${formatFilterValue(filter.value)}`,
          columnId: filter.id,
          label: `${columnName}: ${formatFilterValue(filter.value)}`,
          value: filter.value,
          isArray: false,
          isCustom: false,
        });
      }
    });

    return tags;
  };

  // Build tags from applied custom filters — one tag per non-empty key
  const buildCustomFilterTags = () => {
    return Object.entries(appliedCustomFilters)
      .filter(([, value]) => {
        if (value === null || value === undefined || value === '') {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        // Object where every value is falsy — e.g. { start: undefined, end: undefined }
        if (typeof value === 'object' && !Array.isArray(value)) {
          return Object.values(value).some(Boolean);
        }
        return true;
      })
      .map(([key, value]) => ({
        id: `custom-${key}-${formatFilterValue(value)}`,
        columnId: key,
        label: `${key}: ${formatFilterValue(value)}`,
        value,
        isArray: false,
        isCustom: true,
      }));
  };

  const columnFilterTags = buildFilterTags();
  const customFilterTags = buildCustomFilterTags();
  const filterTags = [...columnFilterTags, ...customFilterTags];

  const hasColumnFilters = columnFilters && columnFilters.length > 0;
  const hasCustomFilters = customFilterTags.length > 0;

  if (!hasColumnFilters && !hasCustomFilters) {
    return null;
  }

  const visibleTags = showAllTags
    ? filterTags
    : filterTags.slice(0, MAX_VISIBLE_FILTER_TAGS);
  const remainingCount = Math.max(
    filterTags.length - MAX_VISIBLE_FILTER_TAGS,
    0
  );

  const handleRemoveTag = (tag) => {
    if (tag.isCustom) {
      // Remove this single key from appliedCustomFilters and re-apply the rest
      if (onRemoveCustomFilter) {
        onRemoveCustomFilter(tag.columnId);
      }
    } else {
      onRemoveFilter(tag.columnId, tag.value, tag.isArray);
    }
  };

  const handleClearAll = () => {
    if (hasColumnFilters) {
      onClearAll();
    }
    if (hasCustomFilters && onClearCustomFilters) {
      onClearCustomFilters();
    }
  };

  return (
    <div className={styles['filter-tags-summary']} data-filter-tags-summary="true">
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
            className={styles.moreTags}>
            +{remainingCount} more
          </Tag>
        )}

        {showAllTags && filterTags.length > MAX_VISIBLE_FILTER_TAGS && (
          <Tag
            type="high-contrast"
            filter={false}
            onClick={() => setShowAllTags(false)}
            className={styles.moreTags}>
            Show less
          </Tag>
        )}
      </div>
      <Button kind="ghost" size="sm" onClick={handleClearAll}>
        Clear filters
      </Button>
    </div>
  );
};

export default React.memo(FilterTagsSummary);
