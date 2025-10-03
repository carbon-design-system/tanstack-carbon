import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/ibm-products-web-components/es/components/tearsheet/index.js';
import Column from '@carbon/icons/es/column/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import { CDSTableToolbarSearch } from '@carbon/web-components/es';
import './dnd-example.js';

import { makeData } from './makeData';

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

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

const data: Resource[] = makeData(10);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('basic-tanstack-table')
export class MyBasicTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @state()
  private _globalFilter = '';

  @state()
  private _columnOrder: string[] = [];

  @state()
  private _columnVisibility: Record<string, boolean> = {};

  @state()
  private _columnOrderTemp: string[] = [];

  @state()
  private _columnVisibilityTemp: Record<string, boolean> = {};

  @state()
  private _tearsheetOpen = false;

  private _toggleTearsheet() {
    this._tearsheetOpen = !this._tearsheetOpen;
  }

  protected async firstUpdated() {
    await this.updateComplete;
    const tearsheet = this.renderRoot.querySelector(
      'c4p-tearsheet'
    ) as LitElement | null;
    const content = tearsheet?.renderRoot.querySelector(
      'cds-modal-body .c4p--tearsheet__content'
    ) as HTMLElement | null;
    if (content) content.style.padding = '0';

    // Initialize a table instance to get column order and visibility. this can be removed if table instance is moved from render method to a this.someState
    const table = this.tableController.table({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
    });

    this._columnOrder = table.getAllLeafColumns().map((col) => col.id);
    this._columnVisibility = table.getAllLeafColumns().reduce((acc, col) => {
      acc[col.id] = true;
      return acc;
    }, {} as Record<string, boolean>);

    this._columnOrderTemp = [...this._columnOrder];
    this._columnVisibilityTemp = { ...this._columnVisibility };
  }

  render() {
    const table = this.tableController.table({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      state: {
        columnOrder: this._columnOrder,
        columnVisibility: this._columnVisibility,
        globalFilter: this._globalFilter,
      },
    });

    interface toolbarSearchDetail {
      detail: {
        value: string;
      };
    }
    interface searchFull extends CDSTableToolbarSearch, toolbarSearchDetail {}

    return html`
      <cds-table>
        <cds-table-toolbar slot="toolbar">
          <cds-table-toolbar-content>
            <cds-table-toolbar-search
              placeholder="Filter table"
              @cds-search-input=${(e: searchFull) =>
                (this._globalFilter =
                  e.detail.value)}></cds-table-toolbar-search>
            <cds-button
              @click=${this._toggleTearsheet}
              tooltipText="Customize columns"
              kind="ghost"
              >${iconLoader(Column, {
                slot: 'icon',
                class: `customize-col-icon`,
              })}</cds-button
            >
          </cds-table-toolbar-content>
        </cds-table-toolbar>
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
              <cds-table-row>
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
              </cds-table-row>
            `
          )}
        </cds-table-body>
      </cds-table>
      <c4p-tearsheet
        class="customize-col-tearsheet"
        ?open=${this._tearsheetOpen}
        prevent-close-on-click-outside
        width="narrow"
        @c4p-tearsheet-closed=${() => (this._tearsheetOpen = false)}>
        <span slot="title">Customize column order</span>
        ${repeat(
          table.getHeaderGroups(),
          (headerGroup) => headerGroup.id,
          () => {
            return html` <div class="drag-wrapper">
              <dnd-example
                .items=${table.getAllLeafColumns()}
                .columnOrderTemp=${this._columnOrderTemp}
                .columnVisibilityTemp=${this._columnVisibilityTemp}
                .setColumnOrderTemp=${(order: string[]) => {
                  this._columnOrderTemp = order;
                }}
                .setColumnVisibilityTemp=${(
                  visibility: Record<string, boolean>
                ) => {
                  this._columnVisibilityTemp = visibility;
                }}>
              </dnd-example>
            </div>`;
          }
        )}
        <cds-button
          @click=${() => {
            this._columnVisibilityTemp = { ...this._columnVisibility };
            this._columnOrderTemp = [...this._columnOrder];
            this._tearsheetOpen = false;
          }}
          slot="actions"
          kind=${'secondary'}
          >Cancel</cds-button
        >
        <cds-button
          @click=${() => {
            this._columnVisibility = { ...this._columnVisibilityTemp };
            this._columnOrder = [...this._columnOrderTemp];
            this._tearsheetOpen = false;
          }}
          slot="actions"
          kind=${'primary'}
          >Save</cds-button
        >
      </c4p-tearsheet>
    `;
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      place-items: center;
    }

    .customize-col-icon {
      fill: var(--cds-icon-primary);
    }

    .drag-wrapper {
      gap: 2px;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .item {
      display: flex;
      align-items: center;
      padding: 0 1rem;
      border: none;
      min-height: 3rem;
      width: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: hand;
      border-bottom: 1px solid var(--cds-border-subtle);
    }
    .dragging-item {
      border: 2px solid blue;
      opacity: 1;
    }

    .ghost-item {
      opacity: 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'basic-tanstack-table': MyBasicTable;
  }
}
