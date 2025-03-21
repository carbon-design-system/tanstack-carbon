import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  TableController,
  getFilteredRowModel,
} from '@tanstack/lit-table';
import Settings16 from '@carbon/web-components/es/icons/settings/16';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/popover/index.js';
import '@carbon/web-components/es/components/radio-button/index.js';
import { makeData } from './makeData';
import {
  CDSTableToolbarSearch,
} from '@carbon/web-components/es';

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

@customElement('row-settings-tanstack-table')
export class MyBasicTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @state()
  private _globalFilter = '';

  _onChange = (event: CustomEvent) =>{
    const value = event.detail.value;
    const dataTable = this.shadowRoot?.querySelector('cds-table');
    dataTable?.setAttribute('size', value);
  }
  _onClick = (event: Event) =>{
    event.stopPropagation();
    const popOver = this.shadowRoot?.querySelector('cds-popover');
    const path = event.composedPath();
    if (popOver && !path.includes(popOver)) {
      popOver?.removeAttribute('open')
    }else{
      popOver?.toggleAttribute('open')
    }
  }

  render() {
    const table = this.tableController.table({
      columns,
      data,
      filterFns: {},
      state: {
        globalFilter: this._globalFilter,
      },
      enableGlobalFilter: true,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    });
    interface toolbarSearchDetail {
      detail: {
        value: string;
      };
    }
    interface searchFull extends CDSTableToolbarSearch, toolbarSearchDetail {}
    return html`
    <cds-table>
     <cds-table-header-title slot="title"
          >Row settings</cds-table-header-title
        >
        <cds-table-toolbar slot="toolbar">
          <cds-table-toolbar-content>
            <cds-table-toolbar-search
              placeholder="Search all columns..."
              @cds-search-input=${(e: searchFull) =>
                (this._globalFilter =
                  e.detail.value)}
                  persistent></cds-table-toolbar-search>
          </cds-table-toolbar-content>
          <cds-popover tabTip autoalign align="top-right">
            <button aria-label="Settings" size="sm" type="button" @click="${this._onClick}">${Settings16()}</button>
            <cds-popover-content>
              <div class="content-wrapper">
                <cds-radio-button-group
                  label-position="right"
                  orientation="vertical"
                  legend-text="Row height"
                  name="radio-button-group"
                  value="lg"
                  @cds-radio-button-group-changed="${this._onChange}">
                    <cds-radio-button
                      label-text="Extra small"
                      value="xs"
                      id="radio-extra-small"></cds-radio-button>
                    <cds-radio-button
                      label-text="Small"
                      value="sm"
                      id="radio-small"></cds-radio-button>
                    <cds-radio-button
                      label-text="Medium"
                      value="md"
                      id="radio-medium"></cds-radio-button>
                    <cds-radio-button
                      label-text="Large"
                      value="lg"
                      id="radio-large"></cds-radio-button>
                    <cds-radio-button
                      label-text="Extra large"
                      value="xl"
                      id="radio-extra-large"></cds-radio-button>
                </cds-radio-button-group>
              </div>
            </cds-popover-content>
          </cds-popover>
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

  firstUpdated(){
    // const popOver = this.shadowRoot?.querySelector('cds-popover');
    window.addEventListener('click', this._onClick);
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      place-items: center;
    }
    .content-wrapper {
      padding: 1rem;
      background-color: var(--cds-background, #ffffff);
    }
    cds-popover {
      display: flex;
      align-items: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'basic-tanstack-table': MyBasicTable;
  }
}
