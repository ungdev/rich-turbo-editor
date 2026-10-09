import { Color, colorState, ColorTextNode, colorTextNodeClass } from '../nodes/ColorTextNode.js';
import { $create, $getState, $getStateChange, EditorConfig } from 'lexical';

export class TextColor extends ColorTextNode {
  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.style.color = Color[$getState(this, colorState)];
    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    if (super.updateDOM(prevNode, dom, config)) {
      return true;
    }
    const colorChange = $getStateChange(this, prevNode, colorState);
    if (colorChange !== null) {
      dom.style.color = Color[colorChange[0]];
    }
    return false;
  }
}
colorTextNodeClass.ctr = (...arg) => $create(TextColor).setTextContent(arg[0]);
