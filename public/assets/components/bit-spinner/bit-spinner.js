"use strict";

export class BitSpinner extends HTMLElement {
  connectedCallback() {
    // setup
    this.innerHTML = /* html */ `
      <span class="bit-spinner-container">
        <span class="bit-spinner-content">
        </span>
      </span>
    `;
  }

  disconnectedCallback() {
    // cleanup
  }
}

customElements.define('bit-spinner', BitSpinner);
