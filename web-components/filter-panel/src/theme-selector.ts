import '@carbon/web-components/es/components/dropdown/index.js';

// create a theme selector
class ThemeSelector extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.addEventListener('cds-dropdown-selected', () => {
      const selectedValue = this.shadowRoot?.querySelector('cds-dropdown')?.value;
      document.documentElement.setAttribute('data-carbon-theme', selectedValue);
    }
    );
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
      :host {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
      }
      </style>
      <cds-dropdown direction="top" title-text="Dropdown label" value="white">
      <cds-dropdown-item value="white">White</cds-dropdown-item>
      <cds-dropdown-item value="g10">G10</cds-dropdown-item>
      <cds-dropdown-item value="g90">G90</cds-dropdown-item>
      <cds-dropdown-item value="g100">G100</cds-dropdown-item>
      </cds-dropdown>
    `;
  }
}

// Define the custom element
customElements.define('theme-selector', ThemeSelector);
