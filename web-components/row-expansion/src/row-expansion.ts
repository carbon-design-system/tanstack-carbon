import { LitElement, css, unsafeCSS, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
  getExpandedRowModel,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import { makeData } from './makeData';
import indexStyles from './index.scss?inline';

const styles = css`
  ${unsafeCSS(indexStyles)}
`;

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

const data: Resource[] = makeData(7);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('row-expansion-example')
export class MyBasicTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @state()
  private expanded: Record<string, boolean> = {};

  @state()
  private isAllExpanded: boolean = false;

  render() {
    const table = this.tableController.table({
      columns,
      data,
      state: {
        expanded: this.expanded,
      },
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      onExpandedChange: (updater) => {
        this.expanded =
          typeof updater === 'function'
            ? (updater(this.expanded) as Record<string, boolean>)
            : (updater as Record<string, boolean>);
      },
    });

    const handleRowExpansion = (e: CustomEvent): void => {
      // prevent default cds-table expansion
      e.preventDefault();
      const row = e.target as HTMLElement;
      const rowId = row.dataset.rowId;
      // console.log(row, rowId);
      if (rowId) {
        this.expanded = {
          ...this.expanded,
          [rowId]: !this.expanded[rowId],
        };
        this.requestUpdate();
      } else {
        // the event is not from a row but from header's expand all button
        if (!this.isAllExpanded) {
          table.getRowModel().rows.forEach((row) => {
            this.expanded[row.id] = true;
          });
          this.isAllExpanded = true;
        } else {
          this.expanded = {};
          this.isAllExpanded = false;
        }
      }
    };

    return html`
      <cds-table
        @cds-table-row-expando-beingtoggled=${handleRowExpansion}
        style="width: ${table.getCenterTotalSize()}px"
        expandable
        batch-expansion>
        <cds-table-header-title slot="title"
          >Row expansion</cds-table-header-title
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
              <cds-table-row
                data-row-id="${row.id}"
                ?expanded="${this.expanded[row.id]}"
                data-expanded="${this.expanded[row.id]}">
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
              <cds-table-expanded-row>
                <div class="child-row-inner-container">
                  <h6>Expandable row content</h6>
                  <div>Description here</div>
                </div>
              </cds-table-expanded-row>
            `
          )}
        </cds-table-body>
      </cds-table>
    `;
  }
  static styles = styles;
}

declare global {
  interface HTMLElementTagNameMap {
    'row-expansion-example': MyBasicTable;
  }
}
