'use babel';

import PongView from './pong-view';
import { CompositeDisposable } from 'atom';

export default {

  pongView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.pongView = new PongView(state.pongViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.pongView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'pong:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.pongView.destroy();
  },

  serialize() {
    return {
      pongViewState: this.pongView.serialize()
    };
  },

  toggle() {
    console.log('Pong was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
