import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@carbon/web-components/es/components/checkbox/index.js';
import Draggable from '@carbon/icons/es/draggable/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import '@carbon/web-components/es/components/icon-button/index.js';

import styles from './dnd-example.scss?inline';
import { repeat } from 'lit/directives/repeat.js';
import { Column } from '@tanstack/lit-table';

@customElement('dnd-example')
export class DndExample extends LitElement {
  @property({ type: Array })
  items: Column<any, unknown>[] = [];

  @property({ type: Array })
  columnOrderTemp: string[] = [];

  @property({ type: Object })
  columnVisibilityTemp: Record<string, boolean> = {};

  @property()
  setColumnOrderTemp!: (order: string[]) => void;

  @property()
  setColumnVisibilityTemp!: (visibility: Record<string, boolean>) => void;

  private dragStartIndex: number = -1;

  // Keyboard navigation state
  private keyboardMovingItemId: string | null = null;
  private keyboardOriginalIndex: number = -1;

  private handleDragStart(e: DragEvent, index: number) {
    this.dragStartIndex = index;
    if (e.target instanceof HTMLElement) {
      e.target.classList.add('dragging');
    }
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  private handleDragLeave(e: DragEvent) {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  }

  private handleDrop(e: DragEvent, dropIndex: number) {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    const newOrder = [...this.columnOrderTemp];
    const [draggedItem] = newOrder.splice(this.dragStartIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    this.setColumnOrderTemp(newOrder);

    const draggingElement = this.shadowRoot?.querySelector('.dragging');
    if (draggingElement) {
      draggingElement.classList.remove('dragging');
    }
  }

  private handleDragEnd(e: DragEvent) {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('dragging');
    }

    const li = this.shadowRoot?.querySelectorAll('li');
    li?.forEach((item) => {
      item.classList.remove('drag-over');
    });
  }

  private handleKeyDown(e: KeyboardEvent, itemId: string, index: number) {
    const { key } = e;

    // Not in move mode - activate on Enter/Space
    if (this.keyboardMovingItemId === null) {
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        this.activateMoveMode(itemId, index);
      }
      return;
    }

    // In move mode - prevent Tab navigation
    if (key === 'Tab') {
      e.preventDefault();
      return;
    }

    // Only respond if this is the moving item
    if (this.keyboardMovingItemId !== itemId) return;

    const currentIndex = this.columnOrderTemp.indexOf(itemId);

    switch (key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          this.moveItemAndRefocus(currentIndex, currentIndex - 1);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < this.columnOrderTemp.length - 1) {
          this.moveItemAndRefocus(currentIndex, currentIndex + 1);
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        this.deactivateMoveMode();
        break;

      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        this.cancelMove(currentIndex);
        break;
    }
  }

  private activateMoveMode(itemId: string, index: number) {
    this.keyboardMovingItemId = itemId;
    this.keyboardOriginalIndex = index;
    this.requestUpdate();
  }

  private deactivateMoveMode() {
    this.keyboardMovingItemId = null;
    this.keyboardOriginalIndex = -1;
    this.requestUpdate();
  }

  private moveItemAndRefocus(fromIndex: number, toIndex: number) {
    this.moveItem(fromIndex, toIndex);
    this.requestUpdate();
    this.focusItemAtIndex(toIndex);
  }

  private cancelMove(currentIndex: number) {
    if (currentIndex !== this.keyboardOriginalIndex) {
      this.moveItem(currentIndex, this.keyboardOriginalIndex);
    }
    const originalIndex = this.keyboardOriginalIndex;
    this.deactivateMoveMode();
    this.focusItemAtIndex(originalIndex);
  }

  private focusItemAtIndex(index: number) {
    this.updateComplete.then(() => {
      const items = this.shadowRoot?.querySelectorAll('li');
      (items?.[index] as HTMLElement)?.focus();
    });
  }

  private moveItem(fromIndex: number, toIndex: number) {
    const newOrder = [...this.columnOrderTemp];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    this.setColumnOrderTemp(newOrder);
  }

  private handleCheckboxChange(columnId: string, checked: boolean) {
    const newVisibility = {
      ...this.columnVisibilityTemp,
      [columnId]: checked,
    };
    this.setColumnVisibilityTemp(newVisibility);
  }

  render() {
    return html`
      <ol>
        ${repeat(
          this.columnOrderTemp,
          (item) => item,
          (item, index) => html`
            <li
              draggable="true"
              tabindex="${this.keyboardMovingItemId &&
              this.keyboardMovingItemId !== item
                ? '-1'
                : '0'}"
              class="${this.keyboardMovingItemId === item
                ? 'keyboard-moving'
                : ''}"
              aria-grabbed="${this.keyboardMovingItemId === item}"
              @dragstart="${(e: DragEvent) => this.handleDragStart(e, index)}"
              @dragover="${this.handleDragOver}"
              @dragleave="${this.handleDragLeave}"
              @drop="${(e: DragEvent) => this.handleDrop(e, index)}"
              @dragend="${this.handleDragEnd}"
              @keydown="${(e: KeyboardEvent) =>
                this.handleKeyDown(e, item, index)}">
              <div class="li-content">
                <div class="drag-icon">
                  ${iconLoader(Draggable, { slot: 'icon' })}
                </div>
                <cds-checkbox
                  ?checked=${this.columnVisibilityTemp[item]}
                  @cds-checkbox-changed=${(e: CustomEvent) =>
                    this.handleCheckboxChange(item, e.detail.checked)}>
                  ${(() => {
                    const col = this.items.find((col) => col.id === item);
                    const header = col?.columnDef?.header;
                    // @ts-ignore
                    return typeof header === 'function' ? header() : header;
                  })()}
                </cds-checkbox>
              </div>
            </li>
          `
        )}
      </ol>
    `;
  }

  static styles = css`
    ${unsafeCSS(styles)}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'dnd-example': DndExample;
  }
}
