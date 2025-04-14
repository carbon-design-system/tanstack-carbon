import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  ColumnDef,
  Column,
  ColumnFilter,
  ColumnFiltersState,
  Header,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  TableController,
  getFacetedUniqueValues,
} from '@tanstack/lit-table';
import { animate } from 'motion';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/pagination/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/number-input/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import Filter from '@carbon/web-components/es/icons/filter/16.js';
import TrashCan from '@carbon/web-components/es/icons/trash-can/16.js';
import Add from '@carbon/web-components/es/icons/add/16.js';
import Save from '@carbon/web-components/es/icons/save/16.js';
import Download from '@carbon/web-components/es/icons/download/16.js';
import Close from '@carbon/web-components/es/icons/close/16.js';
import { makeData } from './makeData';
import indexStyles from './index.scss?inline';
import './filter-tagset.ts';
import {
  CDSPagination,
  CDSTableToolbarSearch,
} from '@carbon/web-components/es';

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

const columns: ColumnDef<Resource, any>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      return html`
        <cds-checkbox
          ?checked="${table.getIsAllRowsSelected()}"
          .indeterminate="${table.getIsSomeRowsSelected()}"
          @cds-checkbox-changed="${table.getToggleAllRowsSelectedHandler()}"></cds-checkbox>
      `;
    },
    cell: ({ row }) => html`
      <cds-checkbox
        @cds-checkbox-changed='${row.getToggleSelectedHandler()}'
        ?checked='${row.getIsSelected()}'
        ?disabled='${!row.getCanSelect()}'
        .indeterminate='${row.getIsSomeSelected()}'
      /></cds-checkbox>
    `,
  },
  {
    accessorKey: 'name',
    cell: (info) => info.getValue(),
    header: () => html`<span>Name</span>`,
  },
  {
    accessorFn: (row) => row.rule,
    id: 'rule',
    cell: (info) => info.getValue(),
    header: () => html`<span>Rule</span>`,
    meta: {
      filterVariant: 'checkbox',
    },
  },
  {
    accessorKey: 'status',
    header: () => 'Status',
    meta: {
      filterVariant: 'select',
    },
  },
  {
    accessorKey: 'other',
    header: () => html`<span>Other</span>`,
  },
  {
    accessorKey: 'example',
    header: 'Example',
    meta: {
      filterVariant: 'number',
    },
  },
];

const data: Resource[] = makeData(7);

@customElement('filter-panel-tanstack-table')
export class MyBatchTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @state()
  private _rowSelection: Record<string, boolean> = {};

  @state()
  private _globalFilter = '';

  @state()
  private columnFilters: ColumnFilter[] = [];

  @state()
  private localFilters: ColumnFilter[] = [];

  @state()
  private popoverOpen = false;
  private setColumnFilters = (filters: ColumnFilter[]) => {
    this.columnFilters = filters;
    this.localFilters = filters;
  };

  firstUpdated(): void {
    const tableContainer = this.shadowRoot?.querySelector(
      '.table-container'
    ) as HTMLElement;
    setTimeout(() => {
      if (tableContainer) {
        tableContainer.style.setProperty(
          '--table-height',
          `${tableContainer.clientHeight}px`
        );
      }
    }, 0);
  }

  private returnFocusToFlyoutTrigger = () => {
    const flyoutTrigger = this.shadowRoot?.querySelector(
      '.filter--panel__toggle'
    ) as HTMLElement;
    if (flyoutTrigger) {
      flyoutTrigger.focus();
    }
  };
  private animatePanel = () => {
    const tableContainer = this.shadowRoot?.querySelector(
      '.table-container'
    ) as HTMLElement;
    const panelContainer = this.shadowRoot?.querySelector('.panel--container');
    const tableContent = this.shadowRoot?.querySelector(
      '.cds--data-table-content'
    );
    const tableContentPagination = this.shadowRoot?.querySelector(
      '.cds--data-table-content__pagination'
    );

    if (!panelContainer || !tableContent || !tableContentPagination) {
      return;
    }
    if (this.popoverOpen) {
      animate(
        panelContainer,
        {
          opacity: [1, 0],
          transform: [`translateX(0px)`, `translateX(-320px)`],
        },
        {
          duration: 0.25,
        }
      );
      // .cds--data-table-content
      animate(
        tableContent,
        {
          width: '100%',
          transform: 'translateX(0px)',
        },
        {
          duration: 0.25,
        }
      );
      animate(
        tableContentPagination,
        {
          width: '100%',
          transform: 'translateX(0px)',
        },
        {
          duration: 0.25,
        }
      );
    } else {
      animate(
        panelContainer,
        {
          opacity: [0, 1],
          transform: [`translateX(-320px)`, `translateX(0px)`],
        },
        {
          duration: 0.25,
        }
      );
      animate(
        tableContent,
        {
          width: 'calc(100% - 320px)',
          transform: 'translateX(320px)',
        },
        {
          duration: 0.25,
        }
      );
      animate(
        tableContentPagination,
        {
          width: 'calc(100% - 320px)',
          transform: 'translateX(320px)',
        },
        {
          duration: 0.25,
        }
      );
    }
  };

  render() {
    const table = this.tableController.table({
      columns,
      data,
      filterFns: {},
      state: {
        rowSelection: this._rowSelection,
        globalFilter: this._globalFilter,
        columnFilters: this.columnFilters,
      },
      enableRowSelection: true,
      enableGlobalFilter: true,
      onRowSelectionChange: (updaterOrValue) => {
        if (typeof updaterOrValue === 'function') {
          this._rowSelection = updaterOrValue(this._rowSelection);
        } else {
          this._rowSelection = updaterOrValue;
        }
      },
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      getPaginationRowModel: getPaginationRowModel(),
      debugTable: true,
    });

    interface ExtendedColFilter extends ColumnFilter {
      label: string;
      onClose: () => void;
      filter: boolean;
    }

    const buildTagFilters = () => {
      const tagFilters = (this.columnFilters as ExtendedColFilter[]).map(
        (c) => {
          const buildTag = (
            col: any,
            checkboxParentColumnData?: ColumnFilter
          ) => {
            const tagData = {} as ExtendedColFilter;
            tagData.label =
              typeof col === 'string'
                ? `${checkboxParentColumnData?.id ?? 'unknown'}: ${col}`
                : `${col.id}: ${col.value}`;
            tagData.onClose = () => {
              if (typeof col === 'string') {
                const groupValues = checkboxParentColumnData?.value as string[];
                const newGroupValues = groupValues.filter((val) => val !== col);
                const foundLocalIndex = this.localFilters.findIndex(
                  (f) => f.id === checkboxParentColumnData?.id
                );
                const foundColumnIndex = this.columnFilters.findIndex(
                  (f) => f.id === checkboxParentColumnData?.id
                );
                const tempLocal = [...this.localFilters];
                const tempColumnFilters = [...this.columnFilters];
                if (foundLocalIndex > -1) {
                  tempLocal.splice(foundLocalIndex, 1);
                  if (!newGroupValues.length) {
                    this.localFilters = tempLocal;
                  } else {
                    this.localFilters = [
                      ...tempLocal,
                      {
                        id: checkboxParentColumnData?.id,
                        value: newGroupValues,
                      },
                    ];
                  }
                }
                if (foundColumnIndex > -1) {
                  tempColumnFilters.splice(foundColumnIndex, 1);
                  if (!newGroupValues.length) {
                    this.columnFilters = tempColumnFilters;
                  } else {
                    this.columnFilters = [
                      ...tempColumnFilters,
                      {
                        id: checkboxParentColumnData?.id,
                        value: newGroupValues,
                      },
                    ];
                  }
                }
                return;
              }
              const parentData =
                typeof col === 'string' ? checkboxParentColumnData : col;
              const foundLocalIndex = this.localFilters.findIndex(
                (f) => f.id === parentData.id && f.value === parentData.value
              );
              const foundColumnIndex = this.columnFilters.findIndex(
                (f) => f.id === parentData.id && f.value === parentData.value
              );
              const tempFilters = [...this.localFilters];
              const tempColumnFilters = [...this.columnFilters];
              if (foundColumnIndex > -1) {
                tempColumnFilters.splice(foundColumnIndex, 1);
                this.columnFilters = tempColumnFilters;
              }
              if (foundLocalIndex > -1) {
                tempFilters.splice(foundLocalIndex, 1);
                this.localFilters = tempFilters;
              }
              const tableFullColumn = table.getColumn(parentData.id);
              tableFullColumn?.setFilterValue(undefined);
            };
            tagData.filter = true;
            tagData.id = typeof col === 'string' ? col : col.id;
            return tagData;
          };
          if (Array.isArray(c.value)) {
            return c.value.map((val: any) => buildTag(val, c));
          }
          return buildTag(c);
        }
      );
      return tagFilters.flat();
    };

    const tagFilters = buildTagFilters();
    console.log(tagFilters);

    return html`
      <div
        class="table-container"
        style="width: ${table.getCenterTotalSize()}px;">
        <div class="panel--container">
          ${!this.popoverOpen
            ? html`
                <div class="filter--panel__content">
                  <div class="filter--panel__header">
                    <cds-icon-button
                      class="filter--panel__close"
                      kind="ghost"
                      size="lg"
                      align="left"
                      aria-label="Close"
                      @click=${() => {
                        this.popoverOpen = !this.popoverOpen;
                        this.animatePanel();
                        this.returnFocusToFlyoutTrigger();
                      }}>
                      ${Close({ slot: 'icon' })}
                      <span slot="tooltip-content">Close</span>
                    </cds-icon-button>
                    <p class="flyout--label">Filter</p>
                    <span class="scroll-divider"></span>
                  </div>
                  <div class="flyout--container">
                    <div class="flyout--container__filters">
                      ${table.getHeaderGroups().map(
                        (headerGroup) => html`
                          ${headerGroup.headers.map((header) =>
                            header.column.getCanFilter()
                              ? html`
                                  <div class="filter-flyout-item">
                                    <cds-layer>
                                      ${filterColumn({
                                        column: header.column,
                                        header,
                                        localFilters: this.localFilters,
                                        setLocalFilters: (filters) => {
                                          this.localFilters = filters;
                                        },
                                      })}
                                    </cds-layer>
                                  </div>
                                `
                              : null
                          )}
                        `
                      )}
                    </div>
                  </div>
                  <div class="filter-panel-button-set">
                    <cds-button
                      kind="secondary"
                      @click=${() => {
                        // table.resetColumnFilters();
                        this.columnFilters = [];
                        this.popoverOpen = !this.popoverOpen;
                        this.returnFocusToFlyoutTrigger();
                        this.localFilters = [];
                        this.animatePanel();
                      }}>
                      Clear
                    </cds-button>
                    <cds-button
                      kind="primary"
                      @click=${() => {
                        console.log('localFilters', this.localFilters);
                        this.setColumnFilters(this.localFilters);
                        this.popoverOpen = !this.popoverOpen;
                        this.returnFocusToFlyoutTrigger();
                        this.animatePanel();
                      }}>
                      Filter
                    </cds-button>
                  </div>
                </div>
              `
            : null}
        </div>
        <cds-table class="cds--data-table-content">
          <!-- <cds-table-header-title slot="title"
            >Batch actions</cds-table-header-title
          >
          <cds-table-header-description slot="description"
            >With toolbar</cds-table-header-description
          > -->
          <cds-table-toolbar slot="toolbar" style="flex-direction: column">
            <cds-table-batch-actions
              style="inset-block-end: ${tagFilters.length > 0
                ? '3rem'
                : undefined}"
              ?active=${table.getIsSomeRowsSelected()}
              selected-rows-count=${table.getSelectedRowModel().rows.length}
              @cds-table-batch-actions-cancel-clicked=${() =>
                table.toggleAllRowsSelected(false)}>
              <cds-button>Delete ${TrashCan({ slot: 'icon' })}</cds-button>
              <cds-button tooltip-position="bottom" tooltip-text="Add">
                ${Add({ slot: 'icon' })}
              </cds-button>
              <cds-button tooltip-position="bottom" tooltip-text="Save">
                ${Save({ slot: 'icon' })}
              </cds-button>
              <cds-button href="javascript:void(0)" download="table-data.json">
                Download ${Download({ slot: 'icon' })}
              </cds-button>
            </cds-table-batch-actions>
            <cds-table-toolbar-content style="justify-content: space-between">
              <cds-icon-button
                class="filter--panel__toggle"
                align="right"
                kind="ghost"
                @click=${() => {
                  this.popoverOpen = !this.popoverOpen;
                  this.animatePanel();
                  setTimeout(() => {
                    (
                      this.shadowRoot?.querySelector(
                        '.filter--panel__close'
                      ) as HTMLElement
                    )?.focus();
                  }, 0);
                }}>
                ${Filter({ slot: 'icon' })}
                <span slot="tooltip-content">Filter</span>
              </cds-icon-button>
              <cds-table-toolbar-search
                placeholder="Filter table"
                @cds-search-input=${(e: CustomEvent) =>
                  (this._globalFilter = e.detail.value)}>
              </cds-table-toolbar-search>
            </cds-table-toolbar-content>
            ${tagFilters.length > 0
              ? html`<tag-set
                  style="background: var(--cds-background, #ffffff);"
                  .tags=${tagFilters}
                  @clear-filters=${() => {
                    // table.resetColumnFilters();
                    this.columnFilters = [];
                    // this.popoverOpen = !this.popoverOpen;
                    // this.returnFocusToFlyoutTrigger();
                    this.localFilters = [];
                    // this.animatePanel();
                  }}></tag-set>`
              : null}
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
              table.getRowModel().rows,
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
        <cds-pagination
          class="cds--data-table-content__pagination"
          start="0"
          total-items="${table.getRowCount()}"
          @cds-pagination-changed-current=${(event: CustomEvent) => {
            const { pageSize, page } = event.detail;
            table.setPageSize(Number(pageSize));
            table.setPageIndex(page - 1);
          }}>
          <cds-select-item value="10">10</cds-select-item>
          <cds-select-item value="20">20</cds-select-item>
          <cds-select-item value="30">30</cds-select-item>
          <cds-select-item value="40">40</cds-select-item>
          <cds-select-item value="50">50</cds-select-item>
        </cds-pagination>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        max-width: 1280px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
      }
      cds-table-batch-actions[active] {
        z-index: 1;
        clip-path: polygon(0 0, 300% 0, 300% 300%, 0 300%);
        opacity: 1;
        pointer-events: all;
        transform: translate3d(0, 0, 0);
      }
    `,
    styles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'filter-panel-tanstack-table': MyBatchTable;
  }
}

const filterColumn = ({
  column,
  header,
  localFilters,
  setLocalFilters,
}: {
  column: Column<any, unknown>;
  header: Header<any, unknown>;
  localFilters: ColumnFiltersState;
  setLocalFilters: (filters: any) => void;
}) => {
  const { filterVariant } = column.columnDef.meta ?? {};

  const sortedUniqueValues = Array.from(column.getFacetedUniqueValues().keys())
    .sort()
    .slice(0, 5000);

  const getCheckboxState = (value) => {
    const foundFilter = localFilters.find((c) => c.id === column.id);

    const isChecked = foundFilter
      ? (
          localFilters.find((c) => c.id === column.id)?.value as string[]
        ).includes(value)
      : false;

    return !!isChecked;
  };

  switch (filterVariant) {
    case 'select':
      console.log('sortedUniqueValues', sortedUniqueValues);

      return html`<cds-layer>
        <cds-dropdown
          title-text=${header.id.charAt(0).toUpperCase() + header.id.slice(1)}
          label="Choose a status"
          value=${localFilters.find((c) => c.id === column.id)?.value || ''}
          @cds-dropdown-selected=${(e: CustomEvent) => {
            const target = e.target as HTMLInputElement | null;
            const selectedValue = target?.value;
            const temp = [...localFilters];
            const foundLocalFilter = temp.filter((f) => f.id === column.id);
            const foundFilterIndex = foundLocalFilter.length
              ? temp.findIndex((f) => f.id === foundLocalFilter[0].id)
              : -1;

            if (foundFilterIndex > -1) {
              temp.splice(foundFilterIndex, 1);
              temp.push({ id: column.id, value: selectedValue });
              setLocalFilters(temp);
              return;
            }

            setLocalFilters([...temp, { id: column.id, value: selectedValue }]);
          }}>
          ${sortedUniqueValues.map((value) => {
            console.log(value);

            return html`
              <cds-dropdown-item value="${value}">${value}</cds-dropdown-item>
            `;
          })}
        </cds-dropdown>
      </cds-layer>`;
    case 'checkbox':
      return html`
        <cds-checkbox-group
          legend-text=${column.id.charAt(0).toUpperCase() + header.id.slice(1)}
          invalid-text="Invalid message goes here"
          orientation="vertical"
          warn-text="Warn message goes here">
          ${sortedUniqueValues.map(
            (value) => html`
              <cds-checkbox
                ?checked=${getCheckboxState(value)}
                value="${value}"
                @cds-checkbox-changed=${(e: CustomEvent) => {
                  const checkbox = e.target as HTMLInputElement;
                  const checked = checkbox.checked;
                  const id = checkbox.value; // Assuming the checkbox value contains the ID
                  const temp = [...localFilters];
                  const foundLocalFilter = temp.filter(
                    (f) => f.id === column.id
                  );
                  const foundFilterIndex = foundLocalFilter.length
                    ? temp.findIndex((f) => f.id === foundLocalFilter[0].id)
                    : -1;

                  if (checked) {
                    if (foundFilterIndex > -1) {
                      const foundFilterValues = foundLocalFilter[0].value as [];
                      temp.splice(foundFilterIndex, 1);
                      temp.push({
                        id: column.id,
                        value: [...foundFilterValues, id],
                      });
                      setLocalFilters(temp);
                      return;
                    }
                    setLocalFilters([...temp, { id: column.id, value: [id] }]);
                    return;
                  }

                  if (!checked) {
                    if (foundFilterIndex > -1) {
                      const foundFilterValues = foundLocalFilter[0].value as [];
                      const newFoundFilterValues = foundFilterValues.filter(
                        (item) => item !== id
                      );
                      temp.splice(foundFilterIndex, 1);
                      if (newFoundFilterValues && newFoundFilterValues.length) {
                        temp.push({
                          id: column.id,
                          value: newFoundFilterValues,
                        });
                      }
                      setLocalFilters(temp);
                    }
                  }
                }}
                >${value}</cds-checkbox
              >
            `
          )}
        </cds-checkbox-group>
      `;
    case 'number':
      return html`
        <cds-layer>
          <cds-form-item>
            <cds-number-input
              .value=${localFilters.find((c) => c.id === column.id)?.value ||
              '0'}
              min="0"
              @input=${(e: Event) => {
                const inputElement = e.target as HTMLInputElement;
                const newValue = inputElement.value;
                const updatedFilters = [...localFilters];
                const existingFilterIndex = updatedFilters.findIndex(
                  (c) => c.id === column.id
                );

                if (existingFilterIndex > -1) {
                  updatedFilters[existingFilterIndex] = {
                    id: column.id,
                    value: newValue,
                  };
                } else {
                  updatedFilters.push({ id: column.id, value: newValue });
                }

                setLocalFilters(updatedFilters);
              }}
              label="${header.id.charAt(0).toUpperCase() + header.id.slice(1)}">
            </cds-number-input>
          </cds-form-item>
        </cds-layer>
      `;
    default:
      return html`
        <cds-layer>
          <cds-text-input
            ?allow-empty=${true}
            .value=${localFilters.find((c) => c.id === column.id)?.value || ''}
            @input=${(e: Event) => {
              const inputElement = e.target as HTMLInputElement;
              const newValue = inputElement.value;
              const updatedFilters = [...localFilters];
              const existingFilterIndex = updatedFilters.findIndex(
                (c) => c.id === column.id
              );
              console.log(inputElement);

              if (existingFilterIndex > -1) {
                updatedFilters[existingFilterIndex] = {
                  id: column.id,
                  value: newValue,
                };
              } else {
                updatedFilters.push({ id: column.id, value: newValue });
              }

              setLocalFilters(updatedFilters);
            }}
            @cds-number-input=${(e: Event) => {
              const inputElement = e.target as HTMLInputElement;
              console.log(inputElement);
            }}
            type="text"
            placeholder="Filter by ${header.id}"
            label=${header.id.charAt(0).toUpperCase() + header.id.slice(1)}>
          </cds-text-input>
        </cds-layer>
      `;
  }
};
