import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TextFilterField from '../textFilterField';

const mockTextInput = vi.fn(
  ({ id, labelText, placeholder, value, onChange, disabled, invalid, invalidText, size }) => (
    <div
      data-testid="mock-text-input"
      data-id={id}
      data-label={typeof labelText === 'string' ? labelText : 'node-label'}
      data-placeholder={placeholder}
      data-value={String(value)}
      data-disabled={String(Boolean(disabled))}
      data-invalid={String(Boolean(invalid))}
      data-invalid-text={invalidText || ''}
      data-size={size}
    >
      <button type="button" onClick={() => onChange({ target: { value: 'updated text value' } })}>
        Trigger Text Change
      </button>
    </div>
  )
);

const mockLayer = vi.fn(({ children, level, onClick }) => (
  <div data-testid="mock-layer" data-level={String(level)} onClick={onClick}>
    {children}
  </div>
));

vi.mock('@carbon/react', () => ({
  Layer: (props) => mockLayer(props),
  TextInput: (props) => mockTextInput(props),
}));

describe('TextFilterField', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props and null value fallback', () => {
    render(<TextFilterField id="owner" label="Owner" value={null} onChange={onChange} />);

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-id', 'owner');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-label', 'Owner');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-placeholder', '');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-value', '');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-disabled', 'false');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-invalid', 'false');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-size', 'md');
  });

  it('renders with custom props and invalid state', () => {
    render(
      <TextFilterField
        id="host"
        label="Host"
        value="server01"
        onChange={onChange}
        placeholder="Enter host"
        disabled
        error="Host is invalid"
        size="sm"
      />
    );

    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-placeholder', 'Enter host');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-value', 'server01');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute(
      'data-invalid-text',
      'Host is invalid'
    );
    expect(screen.getByTestId('mock-text-input')).toHaveAttribute('data-size', 'sm');
  });

  it('forwards text input changes to onChange callback', () => {
    render(<TextFilterField id="owner" label="Owner" value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Text Change' }));

    expect(onChange).toHaveBeenCalledWith('updated text value');
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <TextFilterField id="owner" label="Owner" value="" onChange={onChange} stopPropagation />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
