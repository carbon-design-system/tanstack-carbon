import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import TrashCan from '@carbon/icons/es/trash-can/16';
import Edit from '@carbon/icons/es/edit/16';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import { makeData } from './makeData';
import { styleMap } from 'lit/directives/style-map.js';

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
    id: 'name',
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
    cell: () => {
      return html`<div className="flex">
        <cds-button tooltip-position="bottom" tooltip-text="Delete"
          >${iconLoader(TrashCan, { slot: 'icon' })}</cds-button
        >
        <cds-button tooltip-position="bottom" tooltip-text="Edit"
          >${iconLoader(Edit, { slot: 'icon' })}</cds-button
        >
      </div>`;
    },
  },
];

const data: Resource[] = makeData(10);

const getCommonPinningStyles = (column: Column<Resource>) => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right');

  console.log(column.getSize());
  return {
    borderRight: isLastLeftPinnedColumn
      ? '1px solid var(--cds-border-subtle)'
      : 0,
    borderLeft: isFirstRightPinnedColumn
      ? '1px solid var(--cds-border-subtle)'
      : 0,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width: `${column.getSize()}px`,
    zIndex: isPinned ? 1 : 0,
    backgroundColor: 'var(--cds-layer)',
    display: 'flex',
    alignItems: 'center',
  };
};

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('basic-tanstack-table')
export class MyBasicTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  render() {
    const table = this.tableController.table({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      initialState: {
        columnPinning: {
          left: ['name'],
          right: ['actions'],
        },
      },
    });

    return html`
      <div
        class="sticky-container"
        style=${styleMap({
          width: `${620}px`,
        })}>
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
                      html` <cds-table-header-cell
                        style=${styleMap({
                          ...getCommonPinningStyles(header.column),
                        })}>
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
                      html` <cds-table-cell
                        style=${styleMap({
                          ...getCommonPinningStyles(cell.column),
                        })}>
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
      </div>
    `;
  }

  static styles = css`
    :host {
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      place-items: center;
    }

    cds-table-row,
    cds-table-header-row {
      display: flex;
    }

    .sticky-container {
      overflow: auto;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'basic-tanstack-table': MyBasicTable;
  }
}
