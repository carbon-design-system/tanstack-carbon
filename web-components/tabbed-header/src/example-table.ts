import { LitElement, css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  TableController,
} from '@tanstack/lit-table';

// A TanStack fork of Kent C. Dodds' match-sorter library that provides ranking information
import { rankItem } from '@tanstack/match-sorter-utils';

import '@carbon/web-components/es/components/data-table/index.js';

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

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

@customElement('example-tanstack-table')
export class MyExampleTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @property({ type: Array })
  columns: any[] = [];

  @property({ type: Array })
  data: any[] = [];

  @state()
  private _globalFilter = '';

  render() {
    const table = this.tableController.table({
      columns: this.columns,
      data: this.data,
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
      display: flex;
      place-items: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'example-tanstack-table': MyExampleTable;
  }
}
