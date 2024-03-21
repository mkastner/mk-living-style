import { styleFor, varsFor } from 'component-style';
import AppTeaserComponentDefs from './app-teaser-component-defs.js';

function buttonRow(buttons, rowType) {
  return buttons
    .map((button, index) => {
      return `<button type="button" data-row-type="${rowType}"
        data-index="${index}"
        value="${button.value}">${button.label}</button>`;
    })
    .join('');
}

export class AppTeaserComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const publisherStyleVars = varsFor();
    const publisherStyle = styleFor();
    this.shadowRoot.adoptedStyleSheets = [publisherStyleVars, publisherStyle];
    // constructor logic
  }
  connectedCallback() {
    const productKey = this.getAttribute('data-product');
    this.productDef = AppTeaserComponentDefs[productKey];
    console.log('productDef', this.productDef);
    this.render();
  }

  initButtonState(rowType, row) {
    const buttons = this.shadowRoot.querySelectorAll(
      `[data-row-type="${rowType}"]`
    );
    for (let i = 0; i < row.length; i++) {
      const button = buttons[i];
      if (row[i].active) {
        button.classList.add('active');
      }
    }
  }

  handleButtonClick(e) {
    e.preventDefault();
    const rowType = e.target.dataset.rowType;
    const index = e.target.dataset.index;
    const row = this.productDef[rowType];
    const buttons = this.shadowRoot.querySelectorAll(
      `[data-row-type="${rowType}"]`
    );
    for (let i = 0; i < row.length; i++) {
      const rowItem = row[i];
      const button = buttons[i];
      if (i === parseInt(index)) {
        rowItem.active = true;
        button.classList.add('active');
      } else {
        rowItem.active = false;
        button.classList.remove('active');
      }
    }
    //this.productDef
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log(this);
    const upperButtons = this.productDef['upperButtons'];
    const upperItem = upperButtons.find((rowItem) => rowItem.active);
    const upperValue = upperItem.value;
    const lowerButtons = this.productDef['lowerButtons'];
    const lowerItem = lowerButtons.find((rowItem) => rowItem.active);
    const lowerValue = lowerItem.value;
    const url = this.productDef.url({ upperValue, lowerValue });
    open(url);
  }

  // custom methods
  attachButtonListeners() {
    const buttons = this.shadowRoot.querySelectorAll('button');
    buttons.forEach((button) => {
      button.addEventListener('click', this.handleButtonClick.bind(this));
    });
    const submitButton = this.shadowRoot.querySelector(`input[type="submit"]`);
    submitButton.addEventListener('click', this.handleSubmit.bind(this));
  }

  render() {
    const productDef = this.productDef;
    this.shadowRoot.innerHTML = `
    <style>
      :host { 
        h2 {
          flex: 1 1 100%; 
          margin-top: 0;
          margin-bottom: 0.5em;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--color-primary-light);
        }
        form {
          padding-top: 0.5em;
          width: 100%;
        }
        fieldset, .command-bar {
          width: 100%; 
          padding:0;
          margin:0.5rem 0;
          display: flex;
          flex-flow: row nowrap;
          gap: 0.5em;
        }
        fieldset {
          border: none;
        } 
        fieldset:first-child {
          margin-top: 0;
        }
        fieldset:last-child {
          margin-bottom: 0;
        }
        fieldset .label {
          font-weight: 600;
          padding: var(--padding-text); 
          padding-left: 0;
          font-family: var(--font-family);
          color: var(--color-text);
          flex: 1 1 33.333%;
        }
        fieldset button {
          color: var(--color-secondary-shiny);
          flex: 1 1 33.3333%;
        } 
        fieldset button.active {
          color: white;
        }
        .command-bar {
          margin-bottom: 0; 
        }
        .command-bar input[type=submit] {
           width: calc(66.6666% - 0.125rem);
           display: block;
           margin: 0 0 0 auto;
        }
      }
    </style>
    <h2>${productDef.title}</h2>
    <form>
      <fieldset>
        <div class="label">${productDef.upperLabel}</div>
        ${buttonRow(productDef.upperButtons, 'upperButtons')}
      </fieldset>
      <fieldset>
        <div class="label">${productDef.lowerLabel}</div>
        ${buttonRow(productDef.lowerButtons, 'lowerButtons')}
      </fieldset>
      <div class="command-bar">
        <input type="submit" value="${productDef.submit.text}">
      </div
    </form>
    `;
    this.initButtonState('upperButtons', productDef.upperButtons);
    this.initButtonState('lowerButtons', productDef.lowerButtons);
    this.attachButtonListeners();
  }
}

customElements.define('app-teaser-component', AppTeaserComponent);

