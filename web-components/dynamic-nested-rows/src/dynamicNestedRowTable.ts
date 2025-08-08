import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  Row,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/button/index.js';
import '@carbon/web-components/es/components/skeleton-text/index.js';
import ChevronRight from '@carbon/web-components/es/icons/chevron--right/16';
import { styleMap } from 'lit/directives/style-map.js';

import { makeData, Resource } from './makeData';

const columnHelper = createColumnHelper<Resource>();

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('dynamic-nested-row-table')
export class DynamicNestedRowTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @state()
  private _expanded = {};

  @state()
  private data: Resource[] = makeData(5);

  @state()
  private _rowsFetchingList: Set<string> = new Set();

  // expansion indicator: state variables
  @state()
  private _hoveredRowIds: string[] = [];

  @state()
  private _expIndPos = 0;

  // expansion indicator: method to get row ids of all sub-rows
  private _getAllSubRowIds(row: Row<Resource>) {
    const ids: string[] = [];

    const collectIds = (row: Row<Resource>) => {
      if (row.subRows && row.subRows.length > 0) {
        for (const subRow of row.subRows) {
          ids.push(subRow.id);
          collectIds(subRow); // Recursive for deep nesting
        }
      }
    };

    collectIds(row);

    return ids;
  }

  // for expansion indicator
  private _onRowHover(row: Row<Resource>) {
    if (row.getCanExpand() && row.getIsExpanded()) {
      this._expIndPos = row.depth * 2 + 1;
      this._hoveredRowIds = this._getAllSubRowIds(row);
    } else {
      this._hoveredRowIds = [];
    }
  }

  private updateSubRows(resources: Resource[], uuid: string) {
    return resources.map((resource: Resource) => {
      if (resource.uuid === uuid) {
        resource.subRows = makeData(2);
      } else if (resource.subRows) {
        this.updateSubRows(resource.subRows, uuid);
      }
      return resource;
    });
  }

  private async addSubRows(row: Row<Resource>) {
    this._rowsFetchingList.add(row.id);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cloneData = [...this.data];
    this.data = this.updateSubRows(cloneData, row.original.uuid);

    this._rowsFetchingList.delete(row.id);
  }

  _columns = [
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: () => html`<div class="flex expand-spacer">
        <span class="row-content">Name</span>
      </div>`,
      cell: ({ row, renderValue }) => {
        return html`<div
          class="flex"
          style="${styleMap({
            paddingLeft: `${
              row.depth * 2 + (row.getCanExpand() || row.depth < 2 ? 0 : 0.5)
            }rem`,
          })}">
          ${row.getCanExpand() || row.depth < 2
            ? html`<cds-button
                @click=${() => {
                  const isExpanded = row.getIsExpanded();
                  row.toggleExpanded();
                  if (!isExpanded && !row.subRows.length) {
                    this.addSubRows(row);
                  }
                }}
                ?disabled=${this._rowsFetchingList.has(row.id)}
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
          <span class="row-content">${renderValue()}</span>
          <div
            class="border-line"
            style="${styleMap({
              width: `${
                row.depth * 2 + (row.depth || row.getIsExpanded() ? 2 : 0)
              }rem`,
            })}"></div>
          <div
            class="expansion-indicator"
            style="${styleMap({
              left: `${this._expIndPos}rem`,
            })}"></div>
        </div> `;
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

  render() {
    const table = this.tableController.table({
      columns: this._columns,
      data: this.data,
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
        <cds-table-header-title slot="title"
          >Dynamic nested rows</cds-table-header-title
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
            (row) => {
              return html`
                <cds-table-row
                  @mouseenter="${() => this._onRowHover(row)}"
                  @mouseleave="${() => (this._hoveredRowIds = [])}"
                  class="${this._hoveredRowIds.includes(row.id)
                    ? 'row-hovered'
                    : ''}">
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
                ${row.getIsExpanded() && this._rowsFetchingList.has(row.id)
                  ? html`<cds-table-row
                      @mouseenter="${() => this._onRowHover(row)}"
                      @mouseleave="${() => (this._hoveredRowIds = [])}"
                      class="${this._hoveredRowIds.includes(row.id)
                        ? 'row-hovered'
                        : ''}">
                      ${repeat(
                        row.getVisibleCells(),
                        (cell) => cell.id,
                        (cell) =>
                          html`<cds-table-cell>
                            ${cell.column.id === 'name'
                              ? html`<div
                                  style="${styleMap({
                                    paddingLeft: `${row.depth * 2 + 2.5}rem`,
                                  })}">
                                  <cds-skeleton-text></cds-skeleton-text>
                                </div>`
                              : html`<cds-skeleton-text></cds-skeleton-text>`}
                          </cds-table-cell>`
                      )}
                    </cds-table-row>`
                  : null}
              `;
            }
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

    :host cds-table-cell:first-of-type,
    :host cds-table-header-cell:first-of-type {
      padding-inline-start: 0.5rem;
    }

    .flex {
      display: flex;
      align-items: center;
      position: relative;
    }

    .expand-spacer {
      padding-left: var(--cds-spacing-08, 2.5rem);
    }

    .row-expander {
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
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

    .row-content {
      flex: 1 0 auto;
      padding-left: 1rem;
      height: 3rem;
      align-content: center;
    }

    .border-line {
      content: '';
      position: absolute;
      bottom: -1px;
      left: -0.5rem;
      height: 1px;
      background-color: var(--cds-layer, #f4f4f4);
    }

    .row-hovered .expansion-indicator {
      content: '';
      position: absolute;
      top: 0;
      width: 1px;
      height: 3.125rem;
      background-color: var(--cds-border-subtle-01, #c6c6c6);
      z-index: 1;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'nested-row-table': DynamicNestedRowTable;
  }
}
