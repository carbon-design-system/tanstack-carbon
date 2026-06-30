import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SliderFilterField from '../sliderFilterField';

const mockSlider = vi.fn(
  ({
    id,
    value,
    min,
    max,
    step,
    onChange,
    onRelease,
    disabled,
    invalid,
    invalidText,
    hideTextInput,
  }) => (
    <div
      data-testid="mock-slider"
      data-id={id}
      data-value={String(value)}
      data-min={String(min)}
      data-max={String(max)}
      data-step={String(step)}
      data-disabled={String(Boolean(disabled))}
      data-invalid={String(Boolean(invalid))}
      data-invalid-text={invalidText || ''}
      data-hide-text-input={String(Boolean(hideTextInput))}
    >
      <button type="button" onClick={() => onChange({ value: 55 })}>
        Trigger Slider Change
      </button>
      <button type="button" onClick={() => onRelease?.({ value: 65 })}>
        Trigger Slider Release
      </button>
    </div>
  )
);

const mockLayer = vi.fn(({ children, level }) => (
  <div data-testid="mock-layer" data-level={String(level)}>
    {children}
  </div>
));

vi.mock('@carbon/react', () => ({
  Layer: (props) => mockLayer(props),
  Slider: (props) => mockSlider(props),
}));

describe('SliderFilterField', () => {
  const onChange = vi.fn();
  const onRelease = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default min/max/step labels and values', () => {
    render(
      <SliderFilterField
        id="score"
        label="Score"
        value={40}
        onChange={onChange}
        onRelease={onRelease}
      />
    );

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-id', 'score');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-value', '40');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-min', '0');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-max', '100');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-step', '1');
    expect(screen.getByText('Min: 0')).toBeInTheDocument();
    expect(screen.getByText('Max: 40')).toBeInTheDocument();
  });

  it('renders with custom props and invalid state', () => {
    render(
      <SliderFilterField
        id="volume"
        label="Volume"
        value={1500}
        min={100}
        max={5000}
        step={100}
        onChange={onChange}
        onRelease={onRelease}
        disabled
        error="Invalid range"
        hideTextInput
        minLabelPrefix="Start"
        maxLabelPrefix="Current"
      />
    );

    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-min', '100');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-max', '5000');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-step', '100');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-invalid-text', 'Invalid range');
    expect(screen.getByTestId('mock-slider')).toHaveAttribute('data-hide-text-input', 'true');
    expect(screen.getByText('Start: 100')).toBeInTheDocument();
    expect(screen.getByText('Current: 1,500')).toBeInTheDocument();
  });

  it('forwards slider change and release handlers', () => {
    render(
      <SliderFilterField
        id="score"
        label="Score"
        value={40}
        onChange={onChange}
        onRelease={onRelease}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Slider Change' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Slider Release' }));

    expect(onChange).toHaveBeenCalledWith({ value: 55 });
    expect(onRelease).toHaveBeenCalledWith({ value: 65 });
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <SliderFilterField
          id="score"
          label="Score"
          value={40}
          onChange={onChange}
          onRelease={onRelease}
          stopPropagation
        />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
