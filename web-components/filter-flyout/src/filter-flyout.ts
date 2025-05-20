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
  TableController,
  getFacetedUniqueValues,
  FilterFn,
} from '@tanstack/lit-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import '@carbon/web-components/es/components/overflow-menu/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';
import '@carbon/web-components/es/components/dropdown/index.js';
import '@carbon/web-components/es/components/text-input/index.js';
import '@carbon/web-components/es/components/number-input/index.js';
import '@carbon/web-components/es/components/layer/index.js';
import '@carbon/web-components/es/components/checkbox/index.js';
import Filter from '@carbon/web-components/es/icons/filter/16.js';
import { makeData, Resource } from './makeData.ts';
import indexStyles from './index.scss?inline';
import './filter-tagset.ts';
import '@carbon-labs/wc-empty-state/es/index.js';

const styles = css`
  ${unsafeCSS(indexStyles)}
`;

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const columns: ColumnDef<Resource, any>[] = [
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
    filterFn: 'arrIncludesSome',
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
    filterFn: 'weakEquals',
    meta: {
      filterVariant: 'number',
    },
  },
];

const data: Resource[] = makeData(7);

@customElement('filter-flyout-tanstack-table')
export class MyFilterTable extends LitElement {
  private tableController = new TableController<Resource>(this);

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

  private returnFocusToFlyoutTrigger = () => {
    const flyoutTrigger = this.shadowRoot?.querySelector(
      '.filter--flyout__toggle'
    ) as HTMLElement;
    if (flyoutTrigger) {
      flyoutTrigger.focus();
    }
  };

  render() {
    const table = this.tableController.table({
      columns,
      data,
      filterFns: {
        fuzzy: fuzzyFilter,
      },
      state: {
        globalFilter: this._globalFilter,
        columnFilters: this.columnFilters,
      },
      enableRowSelection: true,
      enableGlobalFilter: true,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      // debugTable: true,
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
                      ...(tempLocal as any),
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
                      ...(tempColumnFilters as any),
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
            return c.value.map((val) => buildTag(val, c));
          }
          return buildTag(c);
        }
      );
      return tagFilters.flat();
    };

    const tagFilters = buildTagFilters();

    return html`
<div
  class="table-container"
  style="width: ${table.getCenterTotalSize()}px;">
  <cds-table class="cds--data-table-content">
    <cds-table-header-title slot="title"
      >Filter flyout</cds-table-header-title
      >
    <cds-table-toolbar slot="toolbar" style="flex-direction: column">
      <cds-table-toolbar-content>
        <cds-table-toolbar-search
        persistent
        placeholder="Search all columns..."
        @cds-search-input=${(e: CustomEvent) =>
          (this._globalFilter = e.detail.value)}>
        </cds-table-toolbar-search>
        <cds-layer level="1">
        <cds-popover tabtip="" ?open=${
          this.popoverOpen
        } id="popover-two" align="bottom-right">
          <cds-icon-button
            class="filter--flyout__toggle"
            align="top"
            kind="ghost"
            size="lg"
            @click=${() => {
              this.popoverOpen = !this.popoverOpen;
            }}>
            ${Filter({ slot: 'icon' })}
            <span slot="tooltip-content">Filter</span>
          </cds-icon-button>
          <cds-popover-content>
            <div class="flyout--container">
              <p class="flyout--label">Filter</p>
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
            <div class="filter-flyout-button-set">
              <cds-button
                kind="secondary"
                @click=${() => {
                  table.resetColumnFilters();
                  this.columnFilters = [];
                  this.popoverOpen = !this.popoverOpen;
                  this.returnFocusToFlyoutTrigger();
                  this.localFilters = [];
                }}>
                Clear
              </cds-button>
              <cds-button
                kind="primary"
                @click=${() => {
                  this.setColumnFilters(this.localFilters);
                  this.popoverOpen = !this.popoverOpen;
                  this.returnFocusToFlyoutTrigger();
                }}>
                Filter
              </cds-button>
            </div>
          </cds-popover-content>
        </cds-popover>
        <cds-layer>
      </cds-table-toolbar-content>
      ${
        tagFilters.length > 0
          ? html`
              <tag-set .tagsData=${tagFilters}>
                <cds-button
                  slot="clear-filters"
                  kind="ghost"
                  size="lg"
                  @click=${() => {
                    table.resetColumnFilters();
                    this.columnFilters = [];
                    this.localFilters = [];
                  }}>
                  Clear filters
                </cds-button>
              </tag-set>
            `
          : null
      }
    </cds-table-toolbar>
    <cds-table-head>
      ${repeat(
        table.getHeaderGroups(),
        (headerGroup) => headerGroup.id,
        (headerGroup) =>
          html`
            <cds-table-header-row>
              ${repeat(
                headerGroup.headers,
                (header) => header.id,
                (header) =>
                  html`
                    <cds-table-header-cell>
                      ${header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </cds-table-header-cell>
                  `
              )}
            </cds-table-header-row>
          `
      )}
    </cds-table-head>
    <cds-table-body
    class=${
      table.getFilteredRowModel().rows.length === 0 ? 'empty-table-body' : ''
    }>
    ${repeat(
      table.getRowModel().rows,
      (row) => row.id,
      (row) => html`
        <cds-table-row>
          ${repeat(
            row.getVisibleCells(),
            (cell) => cell.id,
            (cell) =>
              html`
                <cds-table-cell>
                  ${flexRender(cell.column.columnDef.cell, cell.getContext())}
                </cds-table-cell>
              `
          )}
        </cds-table-row>
      `
    )}
    ${
      table.getFilteredRowModel().rows.length === 0
        ? html`
            <clabs-empty-state
              class="no-results-empty-state"
              title="No results found"
              subtitle="Try adjusting your search or filter options to find what you're looking for."
              size="lg"
              kind="noData"
              illustrationTheme="light">
            </clabs-empty-state>
          `
        : null
    }
    </cds-table-body>
  </cds-table>
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
    `,
    styles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'filter-flyout-tanstack-table': MyFilterTable;
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
  //@ts-ignore
  const filterVariant = (column.columnDef.meta?.filterVariant as string) ?? '';

  const sortedUniqueValues = Array.from(column.getFacetedUniqueValues().keys())
    .sort()
    .slice(0, 5000);

  const getCheckboxState = (value: string): boolean => {
    const foundFilter: ColumnFilter | undefined = localFilters.find(
      (c: ColumnFilter) => c.id === column.id
    );

    const isChecked: boolean = foundFilter
      ? (
          localFilters.find((c: ColumnFilter) => c.id === column.id)
            ?.value as string[]
        ).includes(value)
      : false;

    return !!isChecked;
  };

  switch (filterVariant) {
    case 'select':
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
            return html`
              <cds-dropdown-item value="${value}">${value}</cds-dropdown-item>
            `;
          })}
        </cds-dropdown>
      </cds-layer>`;
    case 'checkbox':
      return html`
        <cds-checkbox-group
          legend-text=${column.id.charAt(0).toUpperCase() + header.id.slice(1)}>
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
              .value=${localFilters.find((c) => c.id === column.id)?.value || 0}
              hide-steppers
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
            type="text"
            placeholder="Filter by ${header.id}"
            label=${header.id.charAt(0).toUpperCase() + header.id.slice(1)}>
          </cds-text-input>
        </cds-layer>
      `;
  }
};
