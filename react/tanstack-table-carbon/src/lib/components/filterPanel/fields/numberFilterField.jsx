import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Layer, NumberInput } from '@carbon/react';

const NumberFilterField = ({
  id,
  label,
  value = '',
  onChange,
  disabled = false,
  error,
  min,
  max,
  step = 1,
  hideSteppers = false,
  size = 'md',
  allowEmpty = false,
  stopPropagation = false,
}) => {
  const content = (
    <NumberInput
      id={id}
      label={label}
      value={value ?? ''}
      onChange={(_, { value: nextValue }) => onChange(nextValue)}
      disabled={disabled}
      invalid={!!error}
      invalidText={error}
      min={min}
      max={max}
      step={step}
      hideSteppers={hideSteppers}
      size={size}
      allowEmpty={allowEmpty}
    />
  );

  if (!stopPropagation) {
    return <Layer level={1}>{content}</Layer>;
  }

  return (
    <Layer level={1} onClick={(event) => event.stopPropagation()}>
      {content}
    </Layer>
  );
};

NumberFilterField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  hideSteppers: PropTypes.bool,
  size: PropTypes.string,
  allowEmpty: PropTypes.bool,
  stopPropagation: PropTypes.bool,
};

export default memo(NumberFilterField);
