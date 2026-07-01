import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TableOverflowMenu from '../tableOverflowMenu';

vi.mock('@carbon/react', () => ({
  OverflowMenu: ({ children, direction, onClick, label = 'overflow menu' }) => (
    <button type="button" data-testid="overflow-menu" data-direction={direction} onClick={onClick}>
      <span>{label}</span>
      {children}
    </button>
  ),
}));

describe('TableOverflowMenu', () => {
  it('sets direction to bottom when there is enough space below and calls onClick', () => {
    const onClick = vi.fn();

    render(
      <TableOverflowMenu onClick={onClick} label="Actions">
        <span>Item</span>
      </TableOverflowMenu>
    );

    const menu = screen.getByTestId('overflow-menu');
    menu.getBoundingClientRect = vi.fn(() => ({
      bottom: 400,
    }));
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    fireEvent.click(menu);

    expect(menu).toHaveAttribute('data-direction', 'bottom');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('sets direction to top when there is not enough space below and works without onClick', () => {
    render(
      <TableOverflowMenu label="More actions">
        <span>Item</span>
      </TableOverflowMenu>
    );

    const menu = screen.getByTestId('overflow-menu');
    menu.getBoundingClientRect = vi.fn(() => ({
      bottom: 900,
    }));
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    fireEvent.click(menu);

    expect(menu).toHaveAttribute('data-direction', 'top');
    expect(screen.getByText('More actions')).toBeInTheDocument();
  });
});
