import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
  Table,
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
    id: 'name',
    cell: (info) => info.getValue(),
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

// if we want to update the globally referenced data, we can add a custom event on the table, that emits the updated data, and sync it globally with event listener
const data: Resource[] = makeData(10);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('editable-tanstack-table')
export class MyBasicTable extends LitElement {
  private tableController = new TableController<Resource>(this);
  @state()
  private editingCellId: string | null = null;

  private setEditingCell(id: string) {
    this.editingCellId = id;
    requestAnimationFrame(() => {
      const input = this.shadowRoot?.querySelector(
        'cds-text-input'
      ) as HTMLInputElement;
      input?.focus();
    });
  }

  private handleInputKeydown(e: KeyboardEvent) {
    if (e.target && e.key === 'Enter') {
      let cellId = this.editingCellId;
      (e.target as HTMLElement).blur();
      setTimeout(() => {
        const cell = this.shadowRoot?.querySelector(
          `#cell__${cellId}`
        ) as HTMLElement;
        cell?.setAttribute('tabindex', '0');
        cell?.focus();
      });
    }
  }
  private handleCellKeydown(e: KeyboardEvent, cell: any) {
    const { id } = cell;
    const activeCellElement = this.shadowRoot?.querySelector(
      'cds-table-cell[tabindex="0"]'
    ) as any;
    const activeCellRowIndex = Array.prototype.indexOf.call(
      activeCellElement.parentNode.children,
      activeCellElement
    );
    const parentRow = activeCellElement?.closest('cds-table-row');
    const allTableCells = this.shadowRoot?.querySelectorAll('cds-table-cell');

    const setActiveCell = (newActiveCell: HTMLElement | null) => {
      (allTableCells as NodeListOf<HTMLElement>)?.forEach((cell: HTMLElement) => {
        cell.tabIndex = -1;
      });
      (document.activeElement as HTMLElement | null)?.blur();
      if (newActiveCell) {
        newActiveCell.tabIndex = 0;
        newActiveCell.focus();
      }
    };

    switch (e.key) {
      case 'Enter':
        this.setEditingCell(id);
        break;
      case 'Escape':
        console.log('Escape');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (activeCellElement?.previousElementSibling) {
          const prevCell = activeCellElement.previousElementSibling.closest(
            'cds-table-cell'
          ) as any;
          setActiveCell(prevCell);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (activeCellElement?.nextElementSibling) {
          const nextCell = activeCellElement.nextElementSibling.closest(
            'cds-table-cell'
          ) as any;
          setActiveCell(nextCell);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (parentRow?.previousElementSibling) {
          const newParentRow = parentRow.previousElementSibling;
          const newRowCells = newParentRow.children;
          const upperCell = newRowCells[activeCellRowIndex]?.closest(
            'cds-table-cell'
          ) as any;
          setActiveCell(upperCell);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (parentRow?.nextElementSibling) {
          const newParentRow = parentRow.nextElementSibling;
          const newRowCells = newParentRow.children;
          const lowerCell = newRowCells[activeCellRowIndex]?.closest(
            'cds-table-cell'
          ) as any;
          setActiveCell(lowerCell);
        }
        break;
      case 'Tab':
        allTableCells?.forEach((cell: any) => {
          cell.tabIndex = -1;
        });
        (document.activeElement as HTMLElement).blur();
        break;
    }
  }

  private handleCellClick(e: MouseEvent) {
    this.editingCellId = null;
    const cells = this.shadowRoot?.querySelectorAll(
      'cds-table-cell'
    ) as NodeListOf<HTMLElement>;
    cells?.forEach((cell) => {
      cell.tabIndex = -1;
    });
    const target = e.target as any;
    target.tabIndex = 0;
    requestAnimationFrame(() => {
      target.closest('cds-table-cell').focus();
    });
  }

  private updateCell(colId: string, rowId: string, table: Table<Resource>, value: string) {
    const newData = [...data] as any;
    newData[rowId][colId] = value;
    table.setOptions((prev: any) => ({
      ...prev,
      data: newData,
    }));
    this.editingCellId = null;
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
                      ${this.editingCellId === cell.id
                        ? html`
                            <cds-table-cell
                              style="padding: 0px; width: ${cell.column.getSize()}px;">
                              <cds-text-input
                                style="height: 47px; display: block;"
                                size="lg"
                                autoComplete="off"
                                @keydown=${this.handleInputKeydown}
                                @blur=${(e: FocusEvent) => {
                                  this.updateCell(
                                    cell.column.id,
                                    row.id,
                                    table as any,
                                    (e.target as HTMLInputElement).value ?? cell.getValue()
                                  );
                                }}
                                value=${cell.getValue() as string}
                                }></cds-text-input>
                            </cds-table-cell>
                          `
                        : html`<cds-table-cell
                            id="cell__${cell.id}"
                            style="width: ${cell.column.getSize()}px"
                            @keydown=${(e: KeyboardEvent) =>
                              this.handleCellKeydown(e, cell)}
                            @click=${(e: MouseEvent) =>
                              this.handleCellClick(e)}
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
    'editable-tanstack-table': MyBasicTable;
  }
}
