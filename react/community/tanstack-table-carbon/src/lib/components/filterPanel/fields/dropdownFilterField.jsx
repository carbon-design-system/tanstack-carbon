import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Layer } from '@carbon/react';
import { STANDARD_SIZE_MAP } from '../../../constants/constants';

const defaultItemToString = (item) => {
  if (!item) {
    return '';
  }
  if (typeof item === 'string') {
    return item;
  }
  return item.label ?? item.text ?? item.value ?? item.id ?? '';
};

const DropdownFilterField = ({
  id,
  titleText,
  label = 'Choose an option',
  items = [],
  selectedItem = null,
  onChange,
  itemToString = defaultItemToString,
  disabled = false,
  error,
  size = 'md',
  stopPropagation = false,
}) => {
  const content = (
    <Dropdown
      id={id}
      titleText={titleText}
      label={label}
      items={items}
      selectedItem={selectedItem ?? null}
      itemToString={itemToString}
      onChange={({ selectedItem: nextSelectedItem }) => onChange(nextSelectedItem ?? null)}
      disabled={disabled}
      invalid={!!error}
      invalidText={error}
      size={STANDARD_SIZE_MAP[size]}
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

DropdownFilterField.propTypes = {
  id: PropTypes.string.isRequired,
  titleText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  label: PropTypes.string,
  items: PropTypes.array,
  selectedItem: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  itemToString: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  size: PropTypes.string,
  stopPropagation: PropTypes.bool,
};

export default memo(DropdownFilterField);
