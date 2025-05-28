import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@carbon/web-components/es/components/dropdown/index.js';

@customElement('theme-selector')
export class ThemeSelector extends LitElement {
  @state()
  private currentTheme: string = 'g100';

  private handleThemeChange(e: CustomEvent) {
    const selectedValue = (e.target as HTMLSelectElement).value;
    this.setTheme(selectedValue);
  }

  private setTheme(theme: string) {
    document.documentElement.setAttribute('data-carbon-theme', theme);
    localStorage.setItem('carbon-theme', theme);
    this.currentTheme = theme;
  }

  connectedCallback() {
    super.connectedCallback();
    const savedTheme = localStorage.getItem('carbon-theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  render() {
    return html`
      <cds-dropdown
        class="theme-selector"
        direction="top"
        title-text="Select theme"
        value=${this.currentTheme}
        @cds-dropdown-selected=${this.handleThemeChange}>
        <cds-dropdown-item value="white">White</cds-dropdown-item>
        <cds-dropdown-item value="g10">G10</cds-dropdown-item>
        <cds-dropdown-item value="g90">G90</cds-dropdown-item>
        <cds-dropdown-item value="g100">G100</cds-dropdown-item>
      </cds-dropdown>
    `;
  }

  static styles = css`
    :host {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 1000;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-selector': ThemeSelector;
  }
}
