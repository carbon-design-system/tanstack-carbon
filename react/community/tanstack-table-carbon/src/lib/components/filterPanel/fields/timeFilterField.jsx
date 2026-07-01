import React from 'react';
import PropTypes from 'prop-types';
import { Layer, SelectItem, TimePicker, TimePickerSelect } from '@carbon/react';
import { STANDARD_SIZE_MAP } from '../../../constants/constants';

const getTimeParts = (value) => {
  if (!value) {
    return { timeValue: '', periodValue: 'AM' };
  }

  const trimmedValue = String(value).trim();
  const parts = trimmedValue.split(/\s+/);
  const maybePeriod = parts[parts.length - 1];

  if (maybePeriod === 'AM' || maybePeriod === 'PM') {
    return {
      timeValue: parts.slice(0, -1).join(' '),
      periodValue: maybePeriod,
    };
  }

  return { timeValue: trimmedValue, periodValue: 'AM' };
};

const TimeFilterField = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
  error,
  size = 'md',
  stopPropagation = false,
}) => {
  const { timeValue, periodValue } = getTimeParts(value);

  const emitValue = (nextTimeValue, nextPeriodValue) => {
    const trimmedTime = (nextTimeValue || '').trim();

    if (!trimmedTime) {
      onChange('');
      return;
    }

    onChange(`${trimmedTime} ${nextPeriodValue}`);
  };

  const content = (
    <Layer level={1}>
      <TimePicker
        id={id}
        labelText={label}
        value={timeValue}
        size={STANDARD_SIZE_MAP[size]}
        onChange={(event) => {
          emitValue(event.target.value, periodValue);
        }}
        disabled={disabled}
        invalid={!!error}
        invalidText={error}
      >
        <TimePickerSelect
          id={`${id}-ampm`}
          value={periodValue}
          onChange={(event) => {
            emitValue(timeValue, event.target.value);
          }}
          disabled={disabled}
        >
          <SelectItem value="AM" text="AM" />
          <SelectItem value="PM" text="PM" />
        </TimePickerSelect>
      </TimePicker>
    </Layer>
  );

  if (!stopPropagation) {
    return content;
  }

  return <div onClick={(e) => e.stopPropagation()}>{content}</div>;
};

TimeFilterField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  size: PropTypes.string,
  stopPropagation: PropTypes.bool,
};

export default TimeFilterField;
