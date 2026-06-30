import { useState } from 'react';
import { Button } from '@carbon/react';
import './Example.scss';

// Import all examples
import BasicTable from '@/examples/basicTable';
import ColumnCustomization from '@/examples/columnCustomization';
import CustomFilters from '@/examples/customFilters';
import CustomFiltersNoAccordion from '@/examples/customFiltersNoAccordion';
import EditableCells from '@/examples/editableCells';
import EmptyState from '@/examples/emptyState';
import RowExpansion from '@/examples/rowExpansion';
import ExpansionRadioSticky from '@/examples/expansionRadioSticky';
import FilterPanel from '@/examples/filterPanel';
import LoadingState from '@/examples/loadingState';
import LocalizedTable from '@/examples/localizedTable';
import MixedFilters from '@/examples/mixedFilters';
import MixTable from '@/examples/mixTable';
import ServerSide from '@/examples/serverSide';
import ServerSideColumnCustomization from '@/examples/serverSideColumnCustomization';
import TableSizes from '@/examples/tableSizes';
import Virtualization from '@/examples/virtualization';
import ThemedTable from '@/examples/themedTable';
import MultipleTablesPage from '@/examples/multipleTablesPage';
import NestedTableExpansion from '@/examples/nestedTableExpansion';

type ExampleType =
  | 'basic'
  | 'columnCustomization'
  | 'customFilters'
  | 'customFiltersNoAccordion'
  | 'editableCells'
  | 'emptyState'
  | 'expansionRadioSticky'
  | 'filterPanel'
  | 'loadingState'
  | 'localized'
  | 'mixedFilters'
  | 'mixTable'
  | 'rowExpansion'
  | 'serverSide'
  | 'serverSideColumnCustomization'
  | 'tableSizes'
  | 'themedTable'
  | 'virtualization'
  | 'multipleTablesPage';

const examples = [
  { id: 'basic', label: 'Basic Table', component: BasicTable },
  {
    id: 'columnCustomization',
    label: 'Column Customization',
    component: ColumnCustomization,
  },
  { id: 'customFilters', label: 'Custom Filters', component: CustomFilters },
  {
    id: 'customFiltersNoAccordion',
    label: 'Custom Filters (No Accordion)',
    component: CustomFiltersNoAccordion,
  },
  { id: 'editableCells', label: 'Editable Cells', component: EditableCells },
  { id: 'emptyState', label: 'Empty State', component: EmptyState },
  { id: 'rowExpansion', label: 'Row Expansion', component: RowExpansion },
  {
    id: 'expansionRadioSticky',
    label: 'Row Expansion & checkbox Sticky',
    component: ExpansionRadioSticky,
  },
  { id: 'filterPanel', label: 'Filter Panel', component: FilterPanel },
  { id: 'loadingState', label: 'Loading State', component: LoadingState },
  { id: 'localized', label: 'Localized Table', component: LocalizedTable },
  { id: 'mixedFilters', label: 'Mixed Filters', component: MixedFilters },
  { id: 'mixTable', label: 'Mix Table (everything)', component: MixTable },
  { id: 'serverSide', label: 'Server Side', component: ServerSide },
  {
    id: 'serverSideColumnCustomization',
    label: 'Server Side Column Customization',
    component: ServerSideColumnCustomization,
  },
  { id: 'tableSizes', label: 'Table Sizes', component: TableSizes },
  { id: 'themedTable', label: 'Themed Table', component: ThemedTable },
  { id: 'virtualization', label: 'Virtualization', component: Virtualization },
  {
    id: 'multipleTablesPage',
    label: 'Multiple Tables Page',
    component: MultipleTablesPage,
  },
  {
    id: 'nestedTables',
    label: 'Nested Tables',
    component: NestedTableExpansion,
  },
] as const;

export const Example = () => {
  const [activeExample, setActiveExample] = useState<ExampleType>('basic');

  const renderExample = () => {
    const example = examples.find((ex) => ex.id === activeExample);

    if (!example) return null;

    const ExampleComponent = example.component;

    return (
      <div className="example-container">
        <ExampleComponent />
      </div>
    );
  };

  return (
    <div className="examples-wrapper">
      <nav className="examples-sidebar" aria-label="Examples navigation">
        <h3>Examples</h3>
        <div className="examples-nav">
          {examples.map((example) => (
            <Button
              key={example.id}
              kind={activeExample === example.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveExample(example.id as ExampleType)}
              className="example-nav-button">
              {example.label}
            </Button>
          ))}
        </div>
      </nav>
      <main className="examples-content">{renderExample()}</main>
    </div>
  );
};
