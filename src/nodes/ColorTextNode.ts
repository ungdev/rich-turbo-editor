import { $getState, $setState, NodeKey, SerializedTextNode, Spread, TextNode, createState } from 'lexical';

export enum Color {
  blue = '#2d8fce',
  darkblue = '#1b557a',
  grey = '#444c5f',
  darkgrey = '#2e3442',
}
export type SerializedColor = keyof typeof Color;
type SerializedColorTextNode = Spread<{ color?: SerializedColor }, SerializedTextNode>;

export const colorState = createState('color', {
  parse: (v) => (typeof v === 'string' && v in Color ? (v as SerializedColor) : undefined),
});

export const colorTextNodeClass: { ctr: new (text: string, nodekey?: NodeKey) => ColorTextNode } = { ctr: null };
export abstract class ColorTextNode extends TextNode {
  $config() {
    return this.config('color-text', {
      extends: TextNode,
      stateConfigs: [{ flat: true, stateConfig: colorState }],
    });
  }

  setColor(color?: SerializedColor) {
    $setState(this, colorState, color);
    return this;
  }

  static importJSON(serializedNode: SerializedColorTextNode): ColorTextNode {
    return $createColorTextNode(serializedNode.text).updateFromJSON(serializedNode).setColor(serializedNode.color);
  }

  exportJSON(): SerializedColorTextNode {
    return {
      ...super.exportJSON(),
      color: $getState(this, colorState),
      $: undefined,
    };
  }

  isSimpleText(): boolean {
    return this.__type === 'color-text' && this.__mode === 0;
  }
}

export function $createColorTextNode(text?: string, nodeKey?: NodeKey): ColorTextNode {
  return new colorTextNodeClass.ctr(text, nodeKey);
}

export function $createColorTextNodeFromTextNode(textNode: TextNode, color?: SerializedColor): ColorTextNode {
  return $createColorTextNode(textNode.getTextContent()).updateFromJSON(textNode.exportJSON()).setColor(color);
}

export function $isColorTextNode(node: unknown): node is ColorTextNode {
  return node instanceof ColorTextNode;
}
