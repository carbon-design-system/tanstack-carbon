import React from 'react';
import PropTypes from 'prop-types';
import { Layer, Slider } from '@carbon/react';

const SliderFilterField = ({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onRelease,
  disabled = false,
  error,
  hideTextInput,
  stopPropagation = false,
  minLabelPrefix = 'Min',
  maxLabelPrefix = 'Max',
}) => {
  const content = (
    <Layer level={1}>
      <p className="filterSliderLabel_filterSidePanel">{label}</p>
      <Slider
        id={id}
        labelText=""
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        onRelease={onRelease}
        disabled={disabled}
        invalid={!!error}
        invalidText={error}
        hideTextInput={hideTextInput}
      />
      <div className="sliderMinMaxValues_filterSidePanel">
        <span>
          {minLabelPrefix}: {Number(min).toLocaleString()}
        </span>
        <span>
          {maxLabelPrefix}: {Number(value).toLocaleString()}
        </span>
      </div>
    </Layer>
  );

  if (!stopPropagation) {
    return content;
  }

  return <div onClick={(e) => e.stopPropagation()}>{content}</div>;
};

SliderFilterField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onRelease: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  hideTextInput: PropTypes.bool,
  stopPropagation: PropTypes.bool,
  minLabelPrefix: PropTypes.string,
  maxLabelPrefix: PropTypes.string,
};

export default SliderFilterField;
