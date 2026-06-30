import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionItem } from '@carbon/react';

const FilterSection = ({ section, children, defaultOpen = false }) => {
  return (
    <Accordion size="md">
      <AccordionItem title={section.label} open={defaultOpen}>
        <div className="filter-section-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </AccordionItem>
    </Accordion>
  );
};

FilterSection.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
};

export default FilterSection;
