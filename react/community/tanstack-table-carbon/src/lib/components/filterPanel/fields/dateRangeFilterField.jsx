import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker, DatePickerInput, Layer } from '@carbon/react';
import { STANDARD_SIZE_MAP } from '../../../constants/constants';

const DateRangeFilterField = ({
  startId,
  endId,
  startLabel,
  endLabel = 'End date',
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
        datePickerType="range"
        value={[value?.start, value?.end]}
        onChange={(dates) => {
          if (dates && dates.length === 2) {
            onChange({ start: dates[0], end: dates[1] });
            return;
          }
          onChange(undefined);
        }}
        disabled={disabled}
      >
        <DatePickerInput
          id={startId}
          placeholder={placeholder}
          labelText={startLabel}
          size={STANDARD_SIZE_MAP[size]}
          invalid={!!error}
          invalidText={error}
        />
        <DatePickerInput
          id={endId}
          placeholder={placeholder}
          labelText={endLabel}
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

DateRangeFilterField.propTypes = {
  startId: PropTypes.string.isRequired,
  endId: PropTypes.string.isRequired,
  startLabel: PropTypes.string.isRequired,
  endLabel: PropTypes.string,
  value: PropTypes.shape({
    start: PropTypes.any,
    end: PropTypes.any,
  }),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  size: PropTypes.string,
  placeholder: PropTypes.string,
  stopPropagation: PropTypes.bool,
};

export default DateRangeFilterField;
