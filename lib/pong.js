'use babel';

import PongView from './pong-view';
import { CompositeDisposable, Disposable } from 'atom';

export default {

  subscriptions: null,

  activate(state) {

    this.subscriptions = new CompositeDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://pong')
          return new PongView();
      }),

      atom.commands.add('atom-workspace', {
        'pong:start': () => this.start()
      }),

      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof PongView) {
            item.destroy();
          }
        })
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  start() {
    let pongViews = atom.workspace
      .getPaneItems()
      .filter(item => item instanceof PongView)

    atom.workspace.open(pongViews[0] || 'atom://pong');
  }

};
