import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import '@carbon/web-components/es/components/tag/index.js';
import '@carbon/web-components/es/components/button/index.js';
import { createOverflowHandler } from './utilities/overflowHandler';

interface TagData {
  label: string;
  type?: string;
  onClose?: () => void;
}

@customElement('tag-set')
export class TagSet extends LitElement {
  @property({ type: Array })
  hiddenTags: TagData[] = [];

  @property({ type: Array })
  tagsData: TagData[] = [];

  @query('#tag-container')
  private container!: HTMLElement;

  @query('[data-offset]')
  private offset!: HTMLElement;

  @state()
  private isPopoverOpen = false;

  @state()
  private lastVisibleTagType: string = 'gray';

  private overflowHandler: { disconnect: () => void } | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private isInitialized = false;

  connectedCallback() {
    super.connectedCallback();
    if (!this.isInitialized) {
      this.updateComplete.then(() => {
        this.setupOverflowHandler();
        this.isInitialized = true;
      });
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('tagsData') && this.isInitialized) {
      const previousIsPopoverOpen = this.isPopoverOpen;
      this.updateComplete.then(() => {
        this.hiddenTags = [];
        this.isPopoverOpen = previousIsPopoverOpen;
        this.initializeOverflowHandler();
      });
    }
  }

  private setupOverflowHandler() {
    if (!this.container || !this.offset) return;

    // operational tag override
    const opTag = this.shadowRoot?.querySelector('cds-operational-tag');
    const tagElement = opTag?.shadowRoot?.querySelector('cds-tag');
    if (tagElement) {
      const tagStyle = (tagElement as HTMLElement).style;
      tagStyle.maxInlineSize = 'unset';
      tagStyle.boxSizing = 'border-box';
    }

    this.initializeOverflowHandler();

    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => this.initializeOverflowHandler());
    });

    this.resizeObserver.observe(this.offset);
    // document.addEventListener('click', this.handleDocumentClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.overflowHandler) {
      this.overflowHandler.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // document.removeEventListener('click', this.handleDocumentClick);
  }

  private initializeOverflowHandler() {
    if (!this.container) return;

    if (this.overflowHandler) {
      this.overflowHandler.disconnect();
    }

    this.overflowHandler = createOverflowHandler({
      container: this.container,
      onChange: (visibleItems: HTMLElement[], hiddenItems: HTMLElement[]) => {
        const filteredChildren = Array.from(this.container.children).filter(
          (child) =>
            !child.hasAttribute('data-offset') &&
            !child.hasAttribute('data-fixed')
        );

        this.hiddenTags = hiddenItems
          .map((hiddenItem) => {
            const index = filteredChildren.indexOf(hiddenItem);
            return index >= 0 && index < this.tagsData.length
              ? this.tagsData[index]
              : null;
          })
          .filter((tag): tag is TagData => tag !== null);

        // get the last visible tag's type, to pass to offset tag
        if (visibleItems.length > 0) {
          const lastVisibleIndex = filteredChildren.indexOf(
            visibleItems[visibleItems.length - 1]
          );
          if (
            lastVisibleIndex >= 0 &&
            lastVisibleIndex < this.tagsData.length
          ) {
            this.lastVisibleTagType =
              this.tagsData[lastVisibleIndex].type || 'gray';
          }
        }
      },
    });
  }

  protected handleTogglePopover(event: Event) {
    event.stopPropagation();
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  // private handleDocumentClick = (event: Event) => {
  //   handle click outside to close if needed
  //   if (!this.offset.contains(event.target as Node)) {
  //     this.isPopoverOpen = false;
  //   }
  // };

  render() {
    return html`
      <div id="tag-container">
        ${this.tagsData.map(
          (tag) => html`
            <span>
              <cds-dismissible-tag
                type=${tag.type}
                text=${tag.label}
                tag-title=${tag.label}
                @cds-dismissible-tag-beingclosed=${(e: Event) => {
                  e.preventDefault();
                  e.stopPropagation();
                  tag.onClose?.();
                }}>
                ${tag.label}
              </cds-dismissible-tag>
            </span>
          `
        )}

        <span
          data-offset
          data-hidden
          style="display: ${this.hiddenTags.length === 0 ? 'none' : ''}">
          <cds-popover
            ?open=${this.isPopoverOpen}
            ?highContrast=${true}
            align="bottom-right">
            <div class="playground-trigger">
              <cds-operational-tag
                @click="${this.handleTogglePopover}"
                @keydown="${this.handleTogglePopover}"
                type=${this.lastVisibleTagType}
                text="+${this.hiddenTags.length}">
              </cds-operational-tag>
            </div>
            <cds-popover-content>
              <div style="padding: 0.9rem;">
                ${this.hiddenTags.length > 0
                  ? this.hiddenTags.map(
                      (tag) => html`
                        <div class="popover-tag">
                          <cds-dismissible-tag
                            type=${tag.type}
                            text=${tag.label}
                            tag-title=${tag.label}
                            @cds-dismissible-tag-beingclosed=${(e: Event) => {
                              e.preventDefault();
                              e.stopPropagation();
                              tag.onClose?.();
                            }}>
                            ${tag.label}
                          </cds-dismissible-tag>
                        </div>
                      `
                    )
                  : html`<p>No hidden tags</p>`}
              </div>
            </cds-popover-content>
          </cds-popover>
        </span>
        <div class="slot-container" data-fixed>
          <slot name="clear-filters"></slot>
        </div>
      </div>
    `;
  }

  static styles = css`
    [data-hidden]:not([data-fixed]) {
      display: none;
    }
    :host {
      display: block;
      block-size: 3rem;
      position: relative;
      background: var(--cds-background, #ffffff);
    }
    #tag-container {
      box-sizing: border-box;
      position: absolute;
      width: 100%;
      display: flex;
      align-items: center;
    }
    cds-tag {
      min-inline-size: unset;
    }
    .slot-container {
      margin-left: auto;
      display: flex;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'tag-set': TagSet;
  }
}
