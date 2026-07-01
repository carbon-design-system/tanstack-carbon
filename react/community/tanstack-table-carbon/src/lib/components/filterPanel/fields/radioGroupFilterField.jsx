import React from 'react';
import PropTypes from 'prop-types';
import { Layer, RadioButton, RadioButtonGroup } from '@carbon/react';
import styles from '../../scss/filterSidePanel.module.scss';

const RadioGroupFilterField = ({
  legend,
  name,
  items = [],
  selectedValue = '',
  onChange,
  disabled = false,
  error,
  stopPropagation = false,
  emptyMessage,
}) => {
  const content = (
    <Layer level={1}>
      <RadioButtonGroup
        legendText={legend}
        name={name}
        valueSelected={selectedValue}
        onChange={onChange}
        disabled={disabled}
        invalid={!!error}
        invalidText={error}
        orientation="vertical"
      >
        {items.length > 0 ? (
          items.map((item) => (
            <RadioButton key={item.id} id={item.id} value={item.value} labelText={item.label} />
          ))
        ) : (
          <p className={styles.noResults}>{emptyMessage || 'No options available'}</p>
        )}
      </RadioButtonGroup>
    </Layer>
  );

  if (!stopPropagation) {
    return content;
  }

  return <div onClick={(e) => e.stopPropagation()}>{content}</div>;
};

RadioGroupFilterField.propTypes = {
  legend: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      value: PropTypes.any.isRequired,
    })
  ),
  selectedValue: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  stopPropagation: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

export default RadioGroupFilterField;
