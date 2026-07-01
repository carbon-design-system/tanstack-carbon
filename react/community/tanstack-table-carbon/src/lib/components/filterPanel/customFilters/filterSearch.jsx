import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { Search, Layer } from '@carbon/react';
import { STANDARD_SIZE_MAP as SIZE_MAP } from '../../../constants/constants';
import { useLabels } from '../../../contexts/labelsContext.jsx';

const FilterSearch = ({ value, onChange, placeholder, size = 'md' }) => {
  const labels = useLabels();
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);

  return (
    <Layer level={1}>
      <Search
        id="filter-search"
        labelText={labels.filterPanelSearchLabel}
        placeholder={placeholder || labels.filterPanelSearchPlaceholder}
        value={value}
        onChange={handleChange}
        size={SIZE_MAP[size]}
        closeButtonLabelText={labels.filterPanelClearSearchTooltip}
      />
    </Layer>
  );
};

FilterSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  size: PropTypes.string,
};

export default memo(FilterSearch);
