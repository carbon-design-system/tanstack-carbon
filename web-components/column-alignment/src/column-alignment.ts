import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/icon-indicator/index.js';
import { ICON_INDICATOR_KIND } from '@carbon/web-components/es/components/icon-indicator/defs.js';

import { makeData, Resource } from './makeData';

const getStatusIconValue = (kind: string): ICON_INDICATOR_KIND => {
  if (kind === 'disabled') {
    return ICON_INDICATOR_KIND.FAILED;
  }
  if (kind === 'starting') {
    return ICON_INDICATOR_KIND['NOT-STARTED'];
  }
  if (kind === 'active') {
    return ICON_INDICATOR_KIND['IN-PROGRESS'];
  }
  return ICON_INDICATOR_KIND['IN-PROGRESS'];
};

const columnHelper = createColumnHelper<Resource>();

const columns = [
  columnHelper.accessor((row) => row.name, {
    id: 'name',
    header: 'Name',
  }),
  columnHelper.accessor('rule', {
    header: 'Rule',
  }),
  columnHelper.accessor('status', {
    header: () => html`<span class="center-align-cell">Status</span>`,
    cell: (info) => {
      return html`<cds-icon-indicator
        class="center-align-cell"
        size="16"
        kind="${getStatusIconValue(info.getValue())}"></cds-icon-indicator> `;
    },
  }),
  columnHelper.accessor('other', {
    header: 'Other',
  }),
  columnHelper.accessor('example', {
    header: () => html`<span class="right-align-cell">Example</span>`,
    cell: (info) =>
      html`<span class="right-align-cell">${info.getValue()}</span>`,
  }),
];

const data: Resource[] = makeData(10);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('column-alignment-tanstack-table')
export class ColumnAlignmentTanstackTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  render() {
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
    .right-align-cell {
      display: block;
      text-align: right;
    }
    .center-align-cell {
      display: block;
      text-align: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'column-alignment-tanstack-table': ColumnAlignmentTanstackTable;
  }
}
