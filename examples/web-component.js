class WebCompontent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>
      /** styleDoc - Component Typography H1
      A public css – not namespaced
      <h1>Hello public World</h1>
      */
      h1 {
        color: red;
      }

      /** styleDoc - Component Typography H2 
      A public css – not namespaced
      <h2>Hello public World</h2>
      */
      h2 {
        color: green;
      }

    </style>
    <h1>Hello World</h1>`;
  }
}
