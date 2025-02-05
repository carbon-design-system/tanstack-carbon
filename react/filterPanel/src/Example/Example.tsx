import { Grid, Column } from '@carbon/react';
import { FilterPanel } from './FilterPanel';
import { WithFilterableMultiSelect } from './WithFilterableMultiSelect';
import { ThemeProvider } from './ThemeSelector/ThemeContext';
import { ThemeDropdown } from './ThemeSelector/ThemeDropdown';
import './example.scss';

export const Example = () => (
  <>
    <ThemeProvider>
      <Grid className="page-grid">
        <Column sm={4} md={8} lg={16}>
          <FilterPanel />
        </Column>
        <Column sm={4} md={8} lg={16}>
          <WithFilterableMultiSelect />
        </Column>
      </Grid>
      <ThemeDropdown />
    </ThemeProvider>
  </>
);
