import { colorState, ColorTextNode, colorTextNodeClass } from '../nodes/ColorTextNode.js';
import { $getState, EditorConfig } from 'lexical';
import styles from '../browser.scss';

export class TextColor extends ColorTextNode {
  createDOM(config: EditorConfig) {
    const dom = super.createDOM(config);
    if ($getState(this, colorState)) dom.classList.toggle(styles[`color-text-${$getState(this, colorState)}`], true);
    return dom;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig) {
    const updated = super.updateDOM(prevNode, dom, config);
    if ($getState(prevNode, colorState) !== $getState(this, colorState))
      dom.classList.toggle(styles[`color-text-${$getState(prevNode, colorState)}`], false);
    if ($getState(this, colorState)) dom.classList.toggle(styles[`color-text-${$getState(this, colorState)}`], true);
    return updated;
  }
}
colorTextNodeClass.ctr = (...args) => new TextColor(...args);
