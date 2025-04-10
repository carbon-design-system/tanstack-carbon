import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  FilterFn,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  TableController,
} from '@tanstack/lit-table';

// A TanStack fork of Kent C. Dodds' match-sorter library that provides ranking information
import { rankItem } from '@tanstack/match-sorter-utils';

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
    enableGlobalFilter: false,
  }),
];

const data: Resource[] = makeData(10);

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

@customElement('global-filter-tanstack-table')
export class MyBasicTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @state()
  private _globalFilter = '';

  render() {
    const table = this.tableController.table({
      columns,
      data,
      filterFns: {
        fuzzy: fuzzyFilter,
      },
      state: {
        globalFilter: this._globalFilter,
      },
      onGlobalFilterChange: (value: string) => {
        this._globalFilter = value;
      },
      globalFilterFn: fuzzyFilter, //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    });

    return html`
      <cds-table>
        <cds-table-header-title slot="title"
          >Global filter</cds-table-header-title
        >
        <cds-table-toolbar slot="toolbar">
          <cds-table-toolbar-content>
            <cds-table-toolbar-search
              placeholder="Search all columns..."
              @cds-search-input=${(e: CustomEvent) => {
                this._globalFilter = e.detail.value;
              }}
              persistent>
            </cds-table-toolbar-search>
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
                    html`<cds-table-header-cell>
                      ${header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </cds-table-header-cell>`
                )}
              </cds-table-header-row>`
          )}
        </cds-table-head>
        <cds-table-body>
          ${repeat(
            table.getFilteredRowModel().rows,
            (row) => row.id,
            (row) => html`
              <cds-table-row>
                ${repeat(
                  row.getVisibleCells(),
                  (cell) => cell.id,
                  (cell) =>
                    html`<cds-table-cell>
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'global-filter-tanstack-table': MyBasicTable;
  }
}
