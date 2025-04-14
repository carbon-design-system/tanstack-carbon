import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import '@carbon/web-components/es/components/tag/index.js';
import { createOverflowHandler } from './utilities/overflowHandler';

export interface TagData {
  label: string;
}

@customElement('tag-set')
export class TagSet extends LitElement {
  @property({ type: Array })
  tags: TagData[] = [];

  @state()
  private hiddenTags: TagData[] = [];

  @state()
  private isPopoverOpen = false;

  @query('#tag-container')
  private container!: HTMLElement;

  @query('[data-offset]')
  private offset!: HTMLElement;

  private overflowHandler: { disconnect: () => void } | undefined;
  private resizeObserver: ResizeObserver | undefined;

  firstUpdated() {
    this.updateComplete.then(() => {
      this.initializeOverflowHandler();

      this.resizeObserver = new ResizeObserver(() => {
        this.reinitializeOverflowHandler();
      });
      this.resizeObserver.observe(this.offset);

      document.addEventListener('click', this.handleDocumentClick);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.overflowHandler?.disconnect();
    this.resizeObserver?.disconnect();
    document.removeEventListener('click', this.handleDocumentClick);
  }

  private initializeOverflowHandler() {
    if (!this.container || !this.tags.length) return;

    this.overflowHandler = createOverflowHandler({
      container: this.container,
      onChange: (_, hiddenItems: HTMLElement[]) => {
        const filteredChildren = Array.from(this.container.children).filter(
          (child) =>
            !child.hasAttribute('data-offset') &&
            !child.hasAttribute('data-fixed')
        );

        this.hiddenTags = hiddenItems.map((hiddenItem) => {
          const index = filteredChildren.indexOf(hiddenItem);
          return this.tags[index];
        });
      },
    });
  }

  private reinitializeOverflowHandler() {
    this.overflowHandler?.disconnect();
    this.initializeOverflowHandler();
  }

  private handleTogglePopover(event: Event) {
    event.stopPropagation();
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  private handleDocumentClick = (event: Event) => {
    if (!this.offset.contains(event.target as Node)) {
      this.isPopoverOpen = false;
    }
  };

  private handleClearFiltersClick = () => {
    this.dispatchEvent(
      new CustomEvent('clear-filters', {
        bubbles: true,
        composed: true,
      })
    );
  };

  render() {
    return html`
      <div
        id="tag-container"
        style="display: flex; align-items: center; white-space: nowrap;">
        ${this.tags.map(
          (tag) => html`
            <cds-dismissible-tag
              text="${tag.label}"
              tag-title="lol"></cds-dismissible-tag>
          `
        )}

        <span data-offset data-hidden @click=${this.handleTogglePopover}>
          <cds-popover
            ?open=${this.isPopoverOpen}
            ?highContrast=${true}
            align="bottom-right">
            <div class="playground-trigger">
              <cds-tag
                tabindex="0"
                style="border: 1px solid var(--cds-tag-border-gray, #a8a8a8); cursor: pointer;"
                type="gray"
                title="tag-example">
                +${this.hiddenTags.length}
              </cds-tag>
            </div>
            <cds-popover-content>
              <div style="padding: 0.9rem;">
                ${this.hiddenTags.length > 0
                  ? this.hiddenTags.map(
                      (tag) => html`<p class="popover-tag">${tag.label}</p>`
                    )
                  : html`<p>No hidden tags</p>`}
              </div>
            </cds-popover-content>
          </cds-popover>
        </span>

        <cds-button
          style="margin-left: auto;"
          data-fixed
          kind="ghost"
          size="lg"
          @click=${this.handleClearFiltersClick}>
          Clear filters
        </cds-button>
      </div>
    `;
  }

  static styles = css`
    [data-hidden]:not([data-fixed]) {
      display: none;
    }
    [data-offset] cds-tag {
      border: 1px solid var(--cds-tag-border-gray, #a8a8a8);
    }
    [data-offset] cds-tag:focus {
      outline: 2px solid var(--cds-focus, #0f62fe);
      outline-offset: 1px;
    }
    :host {
      display: block;
    }
    #tag-container {
      box-sizing: border-box;
    }
    cds-tag,
    cds-dismissible-tag {
      min-inline-size: unset;
    }
    .popover-tag {
      font-size: 14px;
      margin: 0;
      padding: 4px 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'tag-set': TagSet;
  }
}
