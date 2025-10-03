import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import '@carbon/web-components/es/components/button/index.js';
import Edit16 from '@carbon/icons/es/edit/16';
import TrashCan16 from '@carbon/icons/es/trash-can/16';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
  Row,
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
  {
    header: 'Actions',
    id: 'actions',
    cell: ({ row }: { row: Row<Resource> }) => {
      return html`
        <div class="flex">
          <cds-button
            aria-label="Delete"
            size="sm"
            type="button"
            kind="ghost"
            @click="${() => onDelete(row)}">
            ${iconLoader(TrashCan16)}
          </cds-button>
          <cds-button
            aria-label="Edit"
            size="sm"
            type="button"
            kind="ghost"
            @click="${() => onEdit(row)}">
            ${iconLoader(Edit16)}
          </cds-button>
        </div>
      `;
    },
  },
];

const onDelete = (row: object) => {
  console.log(row);
};
const onEdit = (row: object) => {
  console.log(row);
};

const data: Resource[] = makeData(10);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('row-action-tanstack-table')
export class RowActionTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  render() {
    const table = this.tableController.table({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
    });

    return html`
      <cds-table>
        <cds-table-header-title slot="title"
          >Row actions</cds-table-header-title
        >
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
    cds-button svg {
      fill: var(--cds-text-primary, #161616);
    }
    cds-table-row:hover cds-table-cell {
      background-color: var(--cds-layer-hover);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'row-action-tanstack-table': RowActionTable;
  }
}
