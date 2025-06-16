/* eslint-disable @typescript-eslint/no-unused-vars */
import '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface TableOptions<TData extends RowData>
    extends PartialKeys<
      TableOptionsResolved<TData>,
      'state' | 'onStateChange' | 'renderFallbackValue'
    > {
    filterFns?: FilterFns;
  }

  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }

  //allows us to define custom properties for our columns
  interface ColumnMeta<TData, TValue> {
    filterVariant?: 'text' | 'select' | 'checkbox' | 'number';
  }
}
