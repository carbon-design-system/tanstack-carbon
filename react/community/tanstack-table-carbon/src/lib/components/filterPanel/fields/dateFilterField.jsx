import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker, DatePickerInput, Layer } from '@carbon/react';
import { STANDARD_SIZE_MAP } from '../../../constants/constants';

const DateFilterField = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
  error,
  size = 'md',
  placeholder = 'mm/dd/yyyy',
  stopPropagation = false,
}) => {
  const content = (
    <Layer level={1}>
      <DatePicker
        datePickerType="single"
        value={value || ''}
        onChange={(dates) => {
          onChange(dates?.[0] || null);
        }}
        disabled={disabled}
      >
        <DatePickerInput
          id={id}
          placeholder={placeholder}
          labelText={label}
          size={STANDARD_SIZE_MAP[size]}
          invalid={!!error}
          invalidText={error}
        />
      </DatePicker>
    </Layer>
  );

  if (!stopPropagation) {
    return content;
  }

  return <div onClick={(e) => e.stopPropagation()}>{content}</div>;
};

DateFilterField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  size: PropTypes.string,
  placeholder: PropTypes.string,
  stopPropagation: PropTypes.bool,
};

export default DateFilterField;
