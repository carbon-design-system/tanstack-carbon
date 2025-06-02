import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
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
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import { prefix as carbonPrefix } from '@carbon/web-components/es/globals/settings.js';

import ChevronRight from '@carbon/web-components/es/icons/chevron--right/16';
import Settings from '@carbon/web-components/es/icons/settings/16';
import TrashCan from '@carbon/web-components/es/icons/trash-can/16';
import Add from '@carbon/web-components/es/icons/add/16';
import Save from '@carbon/web-components/es/icons/save/16';
import Download from '@carbon/web-components/es/icons/download/16';

import { makeData, Resource } from './makeData';

const columnHelper = createColumnHelper<Resource>();

const data: Resource[] = makeData(10, 3, 3, 2);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('selectable-nested-rows-table')
export class SelectableNestedRowsTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  _columns = [
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: ({ table }) => html`<div class="flex">
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
        <cds-checkbox
          class="row-selector"
          ?checked="${table.getIsAllRowsSelected()}"
          .indeterminate="${table.getIsSomeRowsSelected()}"
          @cds-checkbox-changed="${table.getToggleAllRowsSelectedHandler()}"></cds-checkbox>
        <span class="row-content">Name</span>
      </div>`,
      cell: ({ row, renderValue }) => {
        return html`
          <div class="flex"
          style="${styleMap({
            paddingLeft: `${row.depth * 2 + (row.getCanExpand() ? 0 : 1)}rem`,
          })}"
          >
            ${
              row.getCanExpand()
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
                : null
            }
            <cds-checkbox
              class="row-selector"
              @cds-checkbox-changed='${row.getToggleSelectedHandler()}'
              ?checked='${row.getIsSelected()}'
              ?disabled='${!row.getCanSelect()}'
              .indeterminate='${row.getIsSomeSelected()}'
            /></cds-checkbox>
            <span class="row-content">${renderValue()}</span>
            <div
              class="border-line"
              style="${styleMap({
                width: `${
                  row.depth * 2 + (row.depth || row.getIsExpanded() ? 3 : 0)
                }rem`,
              })}"
            ></div>
            <div
              class="expansion-indicator"
              style="${styleMap({
                left: `${this._expIndPos}rem`,
              })}"
            ></div>
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

  @state()
  private _rowSelection: Record<string, boolean> = {};

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
      this._expIndPos = row.depth * 2 + 0.5;
      this._hoveredRowIds = this._getAllSubRowIds(row);
    } else {
      this._hoveredRowIds = [];
    }
  }

  render() {
    const table = this.tableController.table({
      columns: this._columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getSubRows: (row) => row.subRows,
      state: {
        expanded: this._expanded,
        rowSelection: this._rowSelection,
      },
      onExpandedChange: (oldExpanded) => {
        this._expanded =
          typeof oldExpanded === 'function'
            ? oldExpanded(this._expanded)
            : oldExpanded;
      },
      enableRowSelection: true,
      onRowSelectionChange: (updaterOrValue) => {
        if (typeof updaterOrValue === 'function') {
          this._rowSelection = updaterOrValue(this._rowSelection);
        } else {
          this._rowSelection = updaterOrValue;
        }
      },
    });

    return html`
      <cds-table>
        <cds-table-header-title slot="title"
          >Selectable nested rows</cds-table-header-title
        >
        <cds-table-header-description slot="description"
          >With toolbar</cds-table-header-description
        >

        <cds-table-toolbar slot="toolbar">
          <cds-table-batch-actions
            ?active=${table.getIsSomeRowsSelected()}
            selected-rows-count=${table.getSelectedRowModel().flatRows.length}
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
            <cds-overflow-menu toolbar-action>
              ${Settings({
                slot: 'icon',
                class: `${carbonPrefix}--overflow-menu__icon`,
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
            <cds-button>Add new</cds-button>
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
      position: relative;
    }

    .row-expander {
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
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

    .row-selector {
      flex: none;
      padding-left: 1rem;
      width: 1.25rem;
      margin: 0;
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
      left: -1rem;
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
    'nested-row-table': SelectableNestedRowsTable;
  }
}
