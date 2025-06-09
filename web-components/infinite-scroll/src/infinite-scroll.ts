import { LitElement, css, html, nothing, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/skeleton-text/index.js';
import { VirtualizerController } from '@tanstack/lit-virtual';
import { createRef, ref, Ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';

import { fetchData } from './makeData';

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

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('infinite-scroll-tanstack-table')
export class InfiniteScrollTable extends LitElement {
  private tableController = new TableController<Resource>(this);
  private tableContainerRef: Ref = createRef();
  private rowVirtualizerController: VirtualizerController<Element, Element>;

  @property()
  private loading: boolean = false;

  @property()
  private data: Resource[] = [];

  @property()
  private page: number = 0;

  // containerRefElement: Ref<HTMLDivElement> = createRef();

  connectedCallback() {
    this.rowVirtualizerController = new VirtualizerController(this, {
      count: 1,
      getScrollElement: () => this.tableContainerRef.value!,
      estimateSize: () => 48,
      overscan: 5,
    });
    super.connectedCallback();
  }

  updated(props: PropertyValues) {
    if (props.has('data')) {
      const instance = this.rowVirtualizerController.getVirtualizer();
      instance.setOptions({
        ...instance.options,
        count: this.data.length,
      });
    }
  }

  firstUpdated() {
    this.fetchData();
    this.fetchMoreOnBottomReached();
  }

  fetchMoreOnBottomReached() {
    if (this.tableContainerRef.value) {
      const { scrollHeight, scrollTop, clientHeight } =
        this.tableContainerRef.value;
      if (
        scrollHeight - scrollTop - clientHeight === 0 &&
        this.loading === false
      ) {
        this.fetchData();
      }
    }
  }

  async fetchData() {
    this.loading = true;
    this.page = this.page + 1;
    const numOfResults = 20;
    const index = this.page * numOfResults + 1;
    const { data } = await fetchData(index, numOfResults);
    this.data = [...this.data, ...data];
    this.loading = false;
  }

  render() {
    const controller = this.rowVirtualizerController;
    const table = this.tableController.table({
      columns,
      data: this.data,
      getSortedRowModel: getSortedRowModel(),
      getCoreRowModel: getCoreRowModel(),
    });
    const { rows } = table.getRowModel();
    const virtualizer = controller.getVirtualizer();

    if (this.data.length === 0 && this.loading) {
      return html`loading...`;
    }

    return html`
      <div
        ${ref(this.tableContainerRef)}
        class="container"
        @scroll=${this.fetchMoreOnBottomReached}
        style="${styleMap({
          overflow: 'auto', //our scrollable table container
          position: 'relative', //needed for sticky header
          height: '540px', //should be a fixed height
        })}">
        <cds-table style="display: grid">
          <cds-table-head
            style="${styleMap({
              display: 'grid',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            })}">
            ${repeat(
              table.getHeaderGroups(),
              (headerGroup) => headerGroup.id,
              (headerGroup) =>
                html`<cds-table-header-row
                  style="${styleMap({ display: 'flex', width: '100%' })}">
                  ${repeat(
                    headerGroup.headers,
                    (header) => header.id,
                    (header) =>
                      html` <cds-table-header-cell
                        style="${styleMap({
                          display: 'flex',
                          width: `${header.getSize()}px`,
                          alignItems: 'center',
                        })}">
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
          <cds-table-body
            style=${styleMap({
              display: 'grid',
              height: `${virtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: 'relative', //needed for absolute positioning of rows
            })}>
            ${repeat(
              virtualizer.getVirtualItems(),
              (item) => item.key,
              (item) => {
                const row = rows[item.index] as Row<Resource>;
                const displaySkeleton =
                  this.loading && this.data.length - 1 === item.index;
                return html`
                  <cds-table-row
                    data-index="${row.index}"
                    style=${styleMap({
                      display: 'flex',
                      position: 'absolute',
                      transform: `translateY(${item.start}px)`,
                      width: '100%',
                    })}
                    ${ref((node) => virtualizer.measureElement(node))}>
                    ${repeat(
                      row.getVisibleCells(),
                      (cell) => cell.id,
                      (cell) => html`
                        <cds-table-cell
                          style=${styleMap({
                            display: 'flex',
                            width: `${cell.column.getSize()}px`,
                            alignItems: 'center',
                          })}>
                          ${flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </cds-table-cell>
                      `
                    )}
                  </cds-table-row>
                  ${displaySkeleton
                    ? html` <cds-table-row
                        style=${styleMap({
                          display: 'flex',
                          position: 'absolute',
                          transform: `translateY(${virtualizer.getTotalSize()}px)`,
                          width: '100%',
                          alignItems: 'center',
                          height: '48px',
                        })}>
                        ${repeat(
                          columns,
                          () => html` <cds-table-cell
                            style=${styleMap({
                              display: 'flex',
                              width: '148px',
                              alignItems: 'center',
                              height: '48px',
                            })}>
                            <cds-skeleton-text></cds-skeleton-text>
                          </cds-table-cell>`
                        )}
                      </cds-table-row>`
                    : nothing}
                `;
              }
            )}
          </cds-table-body>
        </cds-table>
      </div>
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
    'infinite-scroll-tanstack-table': InfiniteScrollTable;
  }
}
