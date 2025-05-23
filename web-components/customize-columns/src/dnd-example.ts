import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@carbon/web-components/es/components/checkbox/index.js';
import Draggable from '@carbon/web-components/es/icons/draggable/16.js';
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
              tabindex="0"
              @dragstart="${(e: DragEvent) => this.handleDragStart(e, index)}"
              @dragover="${this.handleDragOver}"
              @dragleave="${this.handleDragLeave}"
              @drop="${(e: DragEvent) => this.handleDrop(e, index)}"
              @dragend="${this.handleDragEnd}">
              <div class="li-content">
                <div class="drag-icon">${Draggable({ slot: 'icon' })}</div>
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
