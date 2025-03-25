import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import TrashCan16 from '@carbon/web-components/es/icons/trash-can/16';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import { makeData } from './makeData';

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

@customElement('context-row')
export class ContextRow extends LitElement {
  @property({ type: Object }) row: any;
  @property({ type: Array })
  data: Resource[] = [];
  @property({ type: Function })
  updateData!: (data: any[]) => void;

  @state() private menuOpen = false;
  @state() private menuX = 0;
  @state() private menuY = 0;
  static styles = css`
    :host {
      display: contents;
    }
    .context-menu {
      position: fixed;
      background: white;
      border: 1px solid #ccc;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      padding: 0.5rem;
      min-width: 120px;
    }
    .menu-item {
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .menu-item:hover {
      background: #f4f4f4;
    }
    .icon {
      margin-right: 0.5rem;
    }
    cds-table-row {
      display: table-row;
      block-size: 3rem;
      inline-size: 100%;
    }
  `;

  private handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.menuX = e.clientX;
    this.menuY = e.clientY;
    this.menuOpen = true;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!this.contains(event.target as Node)) {
        this.menuOpen = false;
        window.removeEventListener('click', handleOutsideClick);
      }
    };

    window.addEventListener('click', handleOutsideClick);
  }

  private removeItem() {
    const indexToRemove = this.data.findIndex(
      (r: any) => r.id === this.row.original.id
    );
    const newData = [
      ...this.data.slice(0, indexToRemove),
      ...this.data.slice(indexToRemove + 1),
    ];
    this.updateData(newData);
    this.menuOpen = false;
  }

  render() {
    return html`
      <cds-table-row @contextmenu=${this.handleContextMenu}>
        <slot></slot>
      </cds-table-row>
      ${this.menuOpen
        ? html`
            <div
              class="context-menu"
              style="top: ${this.menuY}px; left: ${this.menuX}px;">
              <div class="menu-item" @click=${this.removeItem}>
                <span class="icon">${TrashCan16()}</span>
                Delete
              </div>
            </div>
          `
        : ''}
    `;
  }
}

const columnHelper = createColumnHelper<Resource>();

const columns = [
  columnHelper.accessor((row) => row.name, {
    id: 'lastName',
    cell: (info) => html`<i>${info.getValue()}</i>`,
    header: () => html`<span>Name</span>`,
  }),
  columnHelper.accessor('rule', {
    header: () => 'Rule',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('status', {
    header: () => html`<span>Status</span>`,
  }),
  columnHelper.accessor('other', {
    header: 'Other',
  }),
  columnHelper.accessor('example', {
    header: 'Example',
  }),
];

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('row-with-context-menu-tanstack-table')
export class RowWithContextMenuTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @property({ type: Object })
  data: Resource[] = makeData(10);

  render() {
    const { data } = this;
    const table = this.tableController.table({
      columns,
      data: this.data,
      getCoreRowModel: getCoreRowModel(),
    });
    table.setOptions((prev) => ({
      ...prev,
      data: this.data,
    }));

    return html`
      <cds-table>
        <cds-table-header-title slot="title">Row with context menu</cds-table-header-title>
        <cds-table-head>
          ${repeat(
            table.getHeaderGroups(),
            (headerGroup) => headerGroup.id,
            (headerGroup) =>
              html`<cds-table-header-row>
                ${repeat(
                  headerGroup.headers,
                  (header) => header.id,
                  (header) =>
                    html` <cds-table-header-cell>
                      ${header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </cds-table-header-cell>`
                )}</cds-table-header-row
              >`
          )}
        </cds-table-head>
        <cds-table-body>
          ${repeat(
            table.getRowModel().rows,
            (row) => row.id,
            (row) => html`
              <context-row
                .row="${row}"
                .data="${data}"
                .updateData="${this._setData}">
                ${repeat(
                  row.getVisibleCells(),
                  (cell) => cell.id,
                  (cell) =>
                    html` <cds-table-cell>
                      ${flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </cds-table-cell>`
                )}
              </context-row>
            `
          )}
        </cds-table-body>
      </cds-table>
    `;
  }
  _setData = (dataRow: Resource[]) => {
    this.data = dataRow;
  };

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      place-items: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'row-with-context-menu-tanstack-table': RowWithContextMenuTable;
  }
}
