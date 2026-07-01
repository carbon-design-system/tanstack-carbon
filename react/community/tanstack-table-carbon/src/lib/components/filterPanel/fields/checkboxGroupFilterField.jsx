import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Layer } from '@carbon/react';
import styles from '../../scss/filterSidePanel.module.scss';

const CheckboxGroupFilterField = ({
  legend,
  items = [],
  selectedValues = [],
  onChange,
  disabled = false,
  error,
  stopPropagation = false,
  emptyMessage,
}) => {
  const content = (
    <Layer level={1}>
      <p className={styles.filterCheckboxGroupLabel}>{legend}</p>
      {error ? <p className={styles.filterError}>{error}</p> : null}
      <div className={styles.checkboxGroup}>
        {items.length > 0 ? (
          items.map((item) => (
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
          <p className={styles.noResults}>{emptyMessage || 'No options available'}</p>
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
};

export default CheckboxGroupFilterField;
