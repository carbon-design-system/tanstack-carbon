import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/pagination/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import Settings from '@carbon/web-components/es/icons/settings/16.js';
import TrashCan from '@carbon/web-components/es/icons/trash-can/16.js';
import Add from '@carbon/web-components/es/icons/add/16.js';
import Save from '@carbon/web-components/es/icons/save/16.js';
import Download from '@carbon/web-components/es/icons/download/16.js';
import { makeData, Resource } from './makeData';
import {
  CDSPagination,
  CDSTableToolbarSearch,
} from '@carbon/web-components/es';
import indexStyles from './index.scss?inline';

const styles = css`
  ${unsafeCSS(indexStyles)}
`;

const columns: ColumnDef<Resource, any>[] = [
  {
    accessorKey: 'name',
    cell: (info) => info.getValue(),
  },
  {
    accessorFn: (row) => row.rule,
    id: 'rule',
    cell: (info) => info.getValue(),
    header: () => html`<span>Rule</span>`,
  },
  {
    accessorKey: 'status',
    header: () => 'Status',
  },
  {
    accessorKey: 'other',
    header: () => html`<span>Other</span>`,
  },
  {
    accessorKey: 'example',
    header: 'Example',
  },
];

const data: Resource[] = makeData(100, { aiLabelRows: [1, 3] });

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('with-selection-table')
export class MyBatchTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @state()
  private _rowSelection: Record<string, boolean> = {};

  @state()
  private _globalFilter = '';

  render() {
    const table = this.tableController.table({
      columns,
      data,
      filterFns: {},
      state: {
        rowSelection: this._rowSelection,
        globalFilter: this._globalFilter,
      },
      enableRowSelection: true,
      enableGlobalFilter: true,
      onRowSelectionChange: (updaterOrValue) => {
        if (typeof updaterOrValue === 'function') {
          this._rowSelection = updaterOrValue(this._rowSelection);
        } else {
          this._rowSelection = updaterOrValue;
        }
      },
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });

    interface paginationDetail {
      detail: {
        pageSize: number;
        page: number;
      };
    }
    interface toolbarSearchDetail {
      detail: {
        value: string;
      };
    }
    interface searchFull extends CDSTableToolbarSearch, toolbarSearchDetail {}
    interface paginationFull extends CDSPagination, paginationDetail {}

    return html`
      <cds-table with-row-ai-labels>
        <cds-table-header-title slot="title"
          >AI label, with row selection</cds-table-header-title
        >

        <cds-table-toolbar slot="toolbar">
          <cds-table-batch-actions
            ?active=${table.getIsSomeRowsSelected()}
            selected-rows-count=${table.getSelectedRowModel().rows.length}
            @cds-table-batch-actions-cancel-clicked=${() =>
              table.toggleAllRowsSelected(false)}>
            <cds-button>Delete ${TrashCan({ slot: 'icon' })}</cds-button>
            <cds-button tooltip-position="bottom" tooltip-text="Add"
              >${Add({ slot: 'icon' })}</cds-button
            >
            <cds-button tooltip-position="bottom" tooltip-text="Save"
              >${Save({ slot: 'icon' })}</cds-button
            >
            <cds-button href="javascript:void 0" download="table-data.json">
              Download ${Download({ slot: 'icon' })}
            </cds-button>
          </cds-table-batch-actions>
          <cds-table-toolbar-content>
            <cds-table-toolbar-search
              placeholder="Filter table"
              @cds-search-input=${(e: searchFull) =>
                (this._globalFilter =
                  e.detail.value)}></cds-table-toolbar-search>
            <cds-overflow-menu toolbar-action>
              ${Settings({
                slot: 'icon',
                class: `cds--overflow-menu__icon`,
              })}
              <cds-overflow-menu-body>
                <cds-overflow-menu-item @click=${() => alert('Alert 1')}>
                  Action 1
                </cds-overflow-menu-item>
                <cds-overflow-menu-item @click=${() => alert('Alert 2')}>
                  Action 2
                </cds-overflow-menu-item>
                <cds-overflow-menu-item @click=${() => alert('Alert 3')}>
                  Action 3
                </cds-overflow-menu-item>
              </cds-overflow-menu-body>
            </cds-overflow-menu>
            <cds-button>Primary button</cds-button>
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
            (row) => {
              return html`
                <cds-table-row selection-name=${row.id}>
                  ${row.original.aiLabel?.({
                    alignment: 'bottom-left',
                  })}
                  ${repeat(
                    row.getVisibleCells(),
                    (cell) => cell.id,
                    (cell) => html` <cds-table-cell>
                      ${flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </cds-table-cell>`
                  )}
                </cds-table-row>
              `;
            }
          )}
        </cds-table-body>
      </cds-table>
      <cds-pagination
        start="0"
        total-items="${table.getRowCount()}"
        @cds-pagination-changed-current="${(event: paginationFull) => {
          const { pageSize, page } = event.detail;
          table.setPageSize(Number(pageSize));
          table.setPageIndex(page - 1);
        }}">
        <cds-select-item value="10">10</cds-select-item>
        <cds-select-item value="20">20</cds-select-item>
        <cds-select-item value="30">30</cds-select-item>
        <cds-select-item value="40">40</cds-select-item>
        <cds-select-item value="50">50</cds-select-item>
      </cds-pagination>
    `;
  }

  static styles = [
    css`
      :host {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem;
        display: flex;
        place-items: center;
        flex-direction: column;
      }
    `,
    styles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'with-selection-table': MyBatchTable;
  }
}
