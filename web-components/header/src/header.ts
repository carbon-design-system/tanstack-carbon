import { createColumnHelper } from '@tanstack/lit-table';
import { customElement } from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';
import { makeData, Resource } from './makeData';
import './example-table';
import '@carbon/web-components/es/components/tabs/index.js';

const columnHelper = createColumnHelper<Resource>();

const columns = [
  columnHelper.accessor((row) => row.name, {
    id: 'lastName',
    cell: (info) => html`<i>${info.getValue()}</i>`,
    header: () => html`<span>Name</span>`,
  }),
  columnHelper.accessor('rule', {
    header: () => 'Rule',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('status', {
    header: () => html`<span>Status</span>`,
  }),
  columnHelper.accessor('other', {
    header: 'Other',
  }),
  columnHelper.accessor('example', {
    header: 'Example',
  }),
];

@customElement('header-tanstack-table')
export class HeaderExample extends LitElement {
  private table1Data = makeData(7);
  private table2Data = makeData(7);
  private table3Data = makeData(7);

  render() {
    return html`
      <cds-tabs value="catalog" type="contained">
        <cds-tab id="tab-catalog" target="panel-catalog" value="catalog"
          >Catalog assets</cds-tab
        >
        <cds-tab id="tab-policies" target="panel-policies" value="policies">
          Policies
        </cds-tab>
        <cds-tab id="tab-rules" target="panel-rules" value="rules">
          Rules
        </cds-tab>
      </cds-tabs>
      <div
        id="panel-catalog"
        role="tabpanel"
        aria-labelledby="tab-catalog"
        hidden="">
        <example-tanstack-table
          .data=${this.table1Data}
          .columns=${columns}></example-tanstack-table>
      </div>
      <div
        id="panel-policies"
        role="tabpanel"
        aria-labelledby="tab-policies"
        hidden="">
        <example-tanstack-table
          .data=${this.table2Data}
          .columns=${columns}></example-tanstack-table>
      </div>
      <div
        id="panel-rules"
        role="tabpanel"
        aria-labelledby="tab-rules"
        hidden="">
        <example-tanstack-table
          .data=${this.table3Data}
          .columns=${columns}></example-tanstack-table>
      </div>
    `;
  }
  static styles = css`
    :host {
      display: block;
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'header-tanstack-table': HeaderExample;
  }
}
