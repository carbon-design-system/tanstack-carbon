import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Layer, TextInput } from '@carbon/react';

const TextFilterField = ({
  id,
  label,
  value = '',
  onChange,
  placeholder = '',
  disabled = false,
  error,
  size = 'md',
  stopPropagation = false,
}) => {
  const content = (
    <TextInput
      id={id}
      labelText={label}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      invalid={!!error}
      invalidText={error}
      size={size}
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

TextFilterField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  size: PropTypes.string,
  stopPropagation: PropTypes.bool,
};

export default memo(TextFilterField);
