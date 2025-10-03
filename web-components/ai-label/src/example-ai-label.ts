import { html } from 'lit';
import View from '@carbon/icons/es/view/16.js';
import FolderOpen from '@carbon/icons/es/folder/16.js';
import Folders from '@carbon/icons/es/folders/16.js';
import { iconLoader } from '@carbon/web-components/es/globals/internal/icon-loader.js';
import '@carbon/web-components/es/components/ai-label/index.js';
import '@carbon/web-components/es/components/icon-button/index.js';

interface ExampleAiLabelProps {
  alignment?: string;
}

export const exampleAiLabelTemplate = ({
  alignment = 'bottom-right',
}: ExampleAiLabelProps = {}) => html`
  <cds-ai-label size="mini" alignment="${alignment}">
    <div slot="body-text">
      <p class="secondary">AI Explained</p>
      <h2 class="ai-label-heading">84%</h2>
      <p class="secondary bold">Confidence score</p>
      <p class="secondary">
        Lorem ipsum dolor sit amet, di os consectetur adipiscing elit, sed do
        eiusmod tempor incididunt ut fsil labore et dolore magna aliqua.
      </p>
      <hr />
      <p class="secondary">Model type</p>
      <p class="bold">Foundation model</p>
    </div>

    <cds-icon-button kind="ghost" slot="actions" size="lg">
      ${iconLoader(View, { slot: 'icon' })}
      <span slot="tooltip-content"> View </span>
    </cds-icon-button>

    <cds-icon-button kind="ghost" slot="actions" size="lg">
      ${iconLoader(FolderOpen, { slot: 'icon' })}
      <span slot="tooltip-content"> Open folder </span>
    </cds-icon-button>

    <cds-icon-button kind="ghost" slot="actions" size="lg">
      ${iconLoader(Folders, { slot: 'icon' })}
      <span slot="tooltip-content"> Folders </span>
    </cds-icon-button>

    <cds-ai-label-action-button> View details </cds-ai-label-action-button>
  </cds-ai-label>
`;
