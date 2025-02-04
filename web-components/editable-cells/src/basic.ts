import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
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

const data: Resource[] = makeData(10);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('basic-tanstack-table')
export class MyBasicTable extends LitElement {
  private tableController = new TableController<Resource>(this);
  private editingCell: {
    rowId: string;
    columnId: string;
  } | null = null;
  private editingValue: string = '';

  private setEditingCell(rowId: string, columnId: string, value: string) {
    this.editingCell = { rowId, columnId };
    this.editingValue = value;
    this.requestUpdate();
    requestAnimationFrame(() => {
      const input = this.shadowRoot?.querySelector(
        'cds-text-input'
      ) as HTMLInputElement;
      input?.focus();
    });
  }

  private handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.editingValue = input.value;
    // this.requestUpdate();
  }

  private handleInputModeKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      console.log('done editing');
      this.editingCell = null;
      this.requestUpdate();
      console.log(this.tableController.tableInstance);
    }
  }
  private handleCellKeyPress(
    e: KeyboardEvent,
    rowId: string,
    columnId: string,
    value: string
  ) {
    switch (e.key) {
      case 'Enter':
        console.log('Enter');

        this.setEditingCell(rowId, columnId, value);
        break;
      case 'Escape':
        console.log('Escape');
        break;
      case 'ArrowLeft':
        console.log('ArrowLeft');
        break;
      case 'ArrowRight':
        console.log('ArrowRight');
        break;
      case 'ArrowUp':
        console.log('ArrowUp');
        break;
      case 'ArrowDown':
        console.log('ArrowDown');
        break;
    }
  }

  private handleCellClick(e: MouseEvent, rowId: string, columnId: string) {
    this.editingCell = null;
    console.log(console.log(rowId, columnId));

    const cells = this.shadowRoot?.querySelectorAll(
      'cds-table-cell'
    ) as NodeListOf<HTMLElement>;
    cells?.forEach((cell) => {
      cell.tabIndex = -1;
    });
    const target = e.target as HTMLElement;
    target.tabIndex = 0;
    requestAnimationFrame(() => {
      target.focus();
    });
    this.requestUpdate();
    // this.setEditingCell(rowId, columnId, target.textContent || '');
  }

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
                    html` <cds-table-header-cell
                      style="width: ${header.getSize()}px">
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
                  (cell) => {
                    return html`
                      ${this.editingCell?.rowId === row.id &&
                      this.editingCell.columnId === cell.column.id
                        ? html`
                            <td
                              style="padding: 0px; display: table-cell; width: ${cell.column.getSize()}px;">
                              <cds-text-input
                                style="height: 47px; display: block;"
                                size="lg"
                                @keydown=${this.handleInputModeKeyDown}
                                value=${this.editingValue}
                                @input=${this.handleInputChange}
                                }></cds-text-input>
                            </td>
                          `
                        : html`<cds-table-cell
                            id="cell__${cell.id}"
                            style="width: ${cell.column.getSize()}px"
                            @keydown=${(e: any) =>
                              this.handleCellKeyPress(
                                e,
                                row.id,
                                cell.column.id,
                                cell.getValue() as string
                              )}
                            @click=${(e: any) =>
                              this.handleCellClick(e, row.id, cell.column.id)}
                            >${flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}</cds-table-cell
                          >`}
                    `;
                  }
                )}
              </cds-table-row>
            `
          )}
        </cds-table-body>
      </cds-table>
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
      }
    `,
    styles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'basic-tanstack-table': MyBasicTable;
  }
}
