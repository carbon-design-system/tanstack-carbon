import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Layer } from '@carbon/react';
import { useLabels } from '../../../contexts/labelsContext.jsx';
import styles from '../../scss/filterSidePanel.module.scss';

const CHECKBOX_COLLAPSED_COUNT = 7;
const CHECKBOX_SHOW_ALL_THRESHOLD = 9;

const CheckboxGroupFilterField = ({
  legend,
  items = [],
  selectedValues = [],
  onChange,
  disabled = false,
  error,
  stopPropagation = false,
  emptyMessage,
  viewAllLabel,
  showLessLabel,
}) => {
  const labels = useLabels();
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowToggle = items.length > CHECKBOX_SHOW_ALL_THRESHOLD;
  const visibleItems =
    shouldShowToggle && !isExpanded
      ? items.slice(0, CHECKBOX_COLLAPSED_COUNT)
      : items;
  const hiddenCount = shouldShowToggle
    ? items.length - CHECKBOX_COLLAPSED_COUNT
    : 0;

  const resolvedViewAll = viewAllLabel || labels.filterCheckboxViewAll;
  const resolvedShowLess = showLessLabel || labels.filterCheckboxShowLess;

  const toggleButtonText = isExpanded
    ? resolvedShowLess
    : resolvedViewAll.replace('{count}', String(hiddenCount));

  const buttonTestId = `${String(legend)
    .toLowerCase()
    .replace(/\s+/g, '-')}-view-all-btn`;

  const content = (
    <Layer level={1}>
      <p className={styles.filterCheckboxGroupLabel}>{legend}</p>
      {error ? <p className={styles.filterError}>{error}</p> : null}
      <div className={styles.checkboxGroup}>
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <div key={item.id} className={styles.checkboxWithCount}>
              <Checkbox
                id={item.id}
                labelText={item.label}
                checked={selectedValues.includes(item.value)}
                onChange={(_, { checked }) => onChange(item.value, checked)}
                disabled={disabled}
              />
              {item.count !== undefined && item.count !== null ? (
                <span className={styles.checkboxCount}>({item.count})</span>
              ) : null}
            </div>
          ))
        ) : (
          <p className={styles.noResults}>
            {emptyMessage || labels.filterFieldNoOptionsText}
          </p>
        )}
        {shouldShowToggle && (
          <Button
            kind="ghost"
            size="xs"
            data-testid={buttonTestId}
            className={styles.checkboxViewMoreBtn}
            onClick={() => setIsExpanded((prev) => !prev)}>
            {toggleButtonText}
          </Button>
        )}
      </div>
    </Layer>
  );

  if (!stopPropagation) {
    return content;
  }

  return <div onClick={(e) => e.stopPropagation()}>{content}</div>;
};

CheckboxGroupFilterField.propTypes = {
  legend: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      value: PropTypes.any.isRequired,
      count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ),
  selectedValues: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  stopPropagation: PropTypes.bool,
  emptyMessage: PropTypes.string,
  viewAllLabel: PropTypes.string,
  showLessLabel: PropTypes.string,
};

export default CheckboxGroupFilterField;
