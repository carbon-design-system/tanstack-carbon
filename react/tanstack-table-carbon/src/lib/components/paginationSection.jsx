import { Pagination } from '@carbon/react';
import { useLabels } from '../contexts/labelsContext.jsx';

const PaginationSection = ({ feature, table }) => {
  const labels = useLabels();
  if (!feature?.shouldRender) {
    return null;
  }

  return (
    <Pagination
      backwardText={labels.paginationPreviousTooltip}
      forwardText={labels.paginationNextTooltip}
      itemsPerPageText={labels.paginationItemsPerPageLabel}
      itemRangeText={(min, max, total) =>
        labels.paginationItemRangeText
          .replace('{min}', min)
          .replace('{max}', max)
          .replace('{total}', total)
      }
      itemText={(min, max) => labels.paginationItemText.replace('{min}', min).replace('{max}', max)}
      pageRangeText={(current, total) =>
        labels.paginationPageRangeText.replace('{current}', current).replace('{total}', total)
      }
      pageText={(page, pagesUnknown) =>
        pagesUnknown
          ? labels.paginationPageUnknownText
          : labels.paginationPageText.replace('{page}', page)
      }
      page={feature.paginationState.pageIndex + 1}
      pageSize={feature.paginationState.pageSize}
      pageSizes={feature.pageSizeOptions}
      totalItems={feature.totalItems}
      onChange={({ page, pageSize }) => {
        table.setPageSize(Number(pageSize));
        table.setPageIndex(page - 1);
      }}
    />
  );
};

export default PaginationSection;
