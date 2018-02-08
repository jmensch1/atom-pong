'use babel';

import PongGame from './game'

export default class PongView {

  constructor() {

    // Create root element
    this.element = document.createElement('div');
    this.element.setAttribute('id', 'pong');

    // Create keydown/keyup listener
    let listenForKeys = (handler) => {
      let { workspace } = atom;
      let view = atom.views.getView(workspace);

      // handle the key if the PongView is active
      let conditionalHandler = (event) => {
        if (workspace.getActivePaneItem() instanceof PongView)
          handler(event);
      };

      // register listeners for keydown/keyup
      view.addEventListener('keydown', conditionalHandler);
      view.addEventListener('keyup', conditionalHandler);
    };

    // Start game
    setTimeout(() => {
      PongGame(this.element, listenForKeys);
    }, 500);

  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return 'Pong';
  }

}
