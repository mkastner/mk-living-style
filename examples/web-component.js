class WebCompontent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>
      /** styleDoc title: Red Heading
      * example: <h1>Hello World</h1>
      * description: This is a red heading.
      * */
      h1 {
        color: red;
      }
    </style>
    <h1>Hello World</h1>`;
  }
}
