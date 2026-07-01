import React from 'react';
import { DataTable, SkeletonText } from '@carbon/react';
import styles from './scss/customTableSkeleton.module.scss';

const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} = DataTable;

const CustomTableSkeleton = ({
  columns,
  rowCount,
  tableSize,
  useZebraStyles,
  showPagination,
  showToolbar,
  height,
}) => {
  const skeletonRows = Array.from({ length: rowCount }, (_, i) => i);

  // NOTE: Calculate container height accounting for toolbar
  const toolbarHeight = 48; // Standard toolbar height
  const containerHeight =
    height && showToolbar
      ? (typeof height === 'number' ? height : parseInt(height)) - toolbarHeight
      : height;

  return (
    <div className={styles.skeletonWrapper}>
      {showToolbar && (
        <div className={styles.toolbarSkeleton}>
          <div className={styles.toolbarLeft}>
            <SkeletonText width="150px" />
          </div>
          <div className={styles.toolbarRight}>
            <SkeletonText width="200px" />
            <SkeletonText width="40px" />
            <SkeletonText width="40px" />
          </div>
        </div>
      )}
      <TableContainer
        style={
          containerHeight
            ? {
                maxHeight:
                  typeof containerHeight === 'number'
                    ? `${containerHeight}px`
                    : containerHeight,
                overflow: 'auto',
              }
            : undefined
        }>
        <Table size={tableSize} useZebraStyles={useZebraStyles}>
          <TableHead>
            <TableRow>
              {columns.map((column) => {
                const width = column.size || 150;
                const headerText =
                  typeof column.header === 'function'
                    ? ''
                    : column.header || '';
                return (
                  <TableHeader
                    key={column.id || column.accessorKey}
                    style={{
                      width: `${width}px`,
                      minWidth: `${width}px`,
                    }}>
                    {headerText || <SkeletonText width="60%" />}
                  </TableHeader>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {skeletonRows.map((rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => {
                  const width = column.size || 150;
                  return (
                    <TableCell
                      key={`${rowIndex}-${column.id || column.accessorKey}`}
                      style={{
                        width: `${width}px`,
                        minWidth: `${width}px`,
                      }}>
                      <SkeletonText width="80%" />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showPagination && (
          <div className={styles.paginationSkeleton}>
            <div className={styles.paginationLeft}>
              <SkeletonText width="120px" />
            </div>
            <div className={styles.paginationRight}>
              <SkeletonText width="80px" />
              <SkeletonText width="100px" />
              <SkeletonText width="60px" />
            </div>
          </div>
        )}
      </TableContainer>
    </div>
  );
};

export default CustomTableSkeleton;
