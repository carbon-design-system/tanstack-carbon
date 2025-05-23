import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/button/index.js';
import ChevronRight from '@carbon/web-components/es/icons/chevron--right/16';
import { styleMap } from 'lit/directives/style-map.js';

import { makeData, Resource } from './makeData';

const columnHelper = createColumnHelper<Resource>();

const data: Resource[] = makeData(10, 5, 3);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('nested-row-table')
export class NestedRowTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  _columns = [
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: ({ table }) => html` <div class="flex">
        <cds-button
          @click=${table.getToggleAllRowsExpandedHandler()}
          class="row-expander"
          kind="ghost"
          size="sm">
          ${ChevronRight({
            slot: 'icon',
            class: table.getIsAllRowsExpanded()
              ? `row-expanded-icon`
              : 'row-expandable-icon',
          })}
        </cds-button>
        <span>Name</span>
      </div>`,
      cell: ({ row, renderValue }) => {
        return html` <div
          style="${styleMap({
            paddingLeft: `${row.depth * 2 + (!row.getCanExpand() ? 2 : 0)}rem`,
          })}">
          <div class="flex">
            ${row.getCanExpand()
              ? html`<cds-button
                  @click=${row.getToggleExpandedHandler()}
                  class="row-expander"
                  kind="ghost"
                  size="sm">
                  ${ChevronRight({
                    slot: 'icon',
                    class: row.getIsExpanded()
                      ? `row-expanded-icon`
                      : 'row-expandable-icon',
                  })}
                </cds-button>`
              : null}
            ${renderValue()}
          </div>
        </div>`;
      },
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

  @state()
  private _expanded = {};

  render() {
    const table = this.tableController.table({
      columns: this._columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getSubRows: (row) => row.subRows,
      state: {
        expanded: this._expanded,
      },
      onExpandedChange: (oldExpanded) => {
        this._expanded =
          typeof oldExpanded === 'function'
            ? oldExpanded(this._expanded)
            : oldExpanded;
      },
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

    .flex {
      display: flex;
      align-items: center;
    }

    .row-expander {
      margin-right: 1rem;
    }

    .row-expandable-icon {
      color: var(--cds-icon-primary, #161616);
      transition: transform 150ms ease-in;
    }

    .row-expanded-icon {
      color: var(--cds-icon-primary, #161616);
      transform: rotate(0.25turn);
      transition: transform 150ms ease-in; // replace with carbon motion easing
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'nested-row-table': NestedRowTable;
  }
}
