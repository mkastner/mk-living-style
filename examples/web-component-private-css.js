class WebCompontentPrivateCss extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>
      :host { 
        /** styleDoc - Component Typography H3
        <h3>Hello Private CSS World</h3>
        */
        h2 {
          color: brown; 
        }
        
        /** styleDoc - Component Typography H4
        <h4>Hello Private CSS World</h4>
        */
        h2 {
          color: maroon; 
        }

      }
      </style>
    <!-- TODO: let the program put a div around if a namespace is present 
      where namespace replaces :host in the for the styleguide
      <div class="web-compontent-private-css" data-namespace>
      <h1>Hello Private CSS World</h1>
      </div>
    -->
    <h1>Hello Private CSS World</h1>`;
  }
}
