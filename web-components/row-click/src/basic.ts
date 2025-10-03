import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowData,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/ibm-products-web-components/es/components/side-panel/index.js';

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
  private _panelRowData: null | RowData = null;

  @state()
  private _panelOpen = false;

  _handlePanelState(row: RowData) {
    // if (!this._panelRowData) {
    //   return this._panelRowData = row;
    // }
    // this._panelRowData = null;
    this._panelRowData = row;
    this._panelOpen = !this._panelOpen;
  }

  render() {
    console.log(this._panelRowData);
    const table = this.tableController.table({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
    });

    return html`
      <cds-table>
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
              <cds-table-row @click=${() => this._handlePanelState(row)}>
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
      <c4p-side-panel
        label-text="Resource"
        title=${this._panelOpen
          ? (this._panelRowData as any).original.name
          : ''}
        ?open=${this._panelOpen}
        @c4p-side-panel-closed=${() => (this._panelOpen = false)}
        ><p>children content</p></c4p-side-panel
      >
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'basic-tanstack-table': MyBasicTable;
  }
}
