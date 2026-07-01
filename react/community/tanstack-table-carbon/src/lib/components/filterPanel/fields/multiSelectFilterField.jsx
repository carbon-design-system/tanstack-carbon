import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Layer, MultiSelect } from '@carbon/react';
import { STANDARD_SIZE_MAP } from '../../../constants/constants';

const defaultItemToString = (item) => {
  if (!item) {
    return '';
  }
  return item.text ?? item.label ?? item.value ?? item.id ?? '';
};

const MultiSelectFilterField = ({
  id,
  titleText,
  label = 'Choose options',
  items = [],
  selectedItems = [],
  onChange,
  itemToString = defaultItemToString,
  disabled = false,
  error,
  size = 'md',
  stopPropagation = false,
}) => {
  const content = (
    <MultiSelect
      id={id}
      titleText={titleText}
      label={label}
      items={items}
      selectedItems={selectedItems}
      itemToString={itemToString}
      onChange={({ selectedItems: nextSelectedItems }) => onChange(nextSelectedItems ?? [])}
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

MultiSelectFilterField.propTypes = {
  id: PropTypes.string.isRequired,
  titleText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  label: PropTypes.string,
  items: PropTypes.array,
  selectedItems: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  itemToString: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  size: PropTypes.string,
  stopPropagation: PropTypes.bool,
};

export default memo(MultiSelectFilterField);
