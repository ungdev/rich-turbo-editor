import {
  $getState,
  $getStateChange,
  $setState,
  BaseStaticNodeConfig,
  DecoratorNode,
  EditorConfig,
  LexicalEditor,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  createState,
} from 'lexical';

type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: number | 'inherit';
    height: number | 'inherit';
  },
  SerializedLexicalNode
>;

export const srcState = createState('src', {
  parse: (value) => (typeof value === 'string' ? value : undefined),
});

export const altTextState = createState('altText', {
  parse: (value) => (typeof value === 'string' ? value : undefined),
});

export const widthState = createState('width', {
  parse: (value) => (value === 'inherit' || typeof value === 'number' ? value : 'inherit'),
});

export const heightState = createState('height', {
  parse: (value) => (value === 'inherit' || typeof value === 'number' ? value : 'inherit'),
});

export const imageNodeClass: { ctr: new (key?: NodeKey) => ImageNode<unknown> } = { ctr: null };
export abstract class ImageNode<T> extends DecoratorNode<T> {
  $config(): BaseStaticNodeConfig {
    return this.config('image', {
      extends: DecoratorNode,
      stateConfigs: [
        { flat: true, stateConfig: srcState },
        { flat: true, stateConfig: altTextState },
        { flat: true, stateConfig: widthState },
        { flat: true, stateConfig: heightState },
      ],
    });
  }

  setSrc(src?: string) {
    $setState(this, srcState, src);
    return this;
  }

  setAltText(altText: string) {
    $setState(this, altTextState, altText);
    return this;
  }

  setWidth(width: number | 'inherit') {
    $setState(this, widthState, width);
    return this;
  }

  setHeight(height: number | 'inherit') {
    $setState(this, heightState, height);
    return this;
  }

  abstract decorateSelf(element: HTMLElement, config: EditorConfig): HTMLElement;
  abstract decorate(editor: LexicalEditor, config: EditorConfig): T;

  createDOM(config?: EditorConfig): HTMLElement {
    const element = document.createElement('span');
    return this.decorateSelf(element, config);
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const image = dom.children[0] as HTMLImageElement;
    if (super.updateDOM(prevNode, dom, config)) {
      return true;
    }
    const srcChange = $getStateChange(this, prevNode, srcState);
    if (srcChange !== null) {
      image.src = srcChange[0];
    }
    const altTextChange = $getStateChange(this, prevNode, altTextState);
    if (altTextChange !== null) {
      image.alt = altTextChange[0];
    }
    const widthChange = $getStateChange(this, prevNode, widthState);
    if (widthChange !== null) {
      image.width = widthChange[0] === 'inherit' ? undefined : widthChange[0];
    }
    const heightChange = $getStateChange(this, prevNode, heightState);
    if (heightChange !== null) {
      image.height = heightChange[0] === 'inherit' ? undefined : heightChange[0];
    }
    return false;
  }

  static importJSON<T>(serializedNode: SerializedImageNode): ImageNode<T> {
    return $createImageNode<T>(
      serializedNode.src,
      serializedNode.altText,
      serializedNode.width,
      serializedNode.height,
    ).updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: $getState(this, srcState),
      altText: $getState(this, altTextState),
      width: $getState(this, widthState),
      height: $getState(this, heightState),
    };
  }
}

export function $createImageNode<T>(
  src: string,
  altText: string = '',
  width: number | 'inherit' = 'inherit',
  height: number | 'inherit' = 'inherit',
  nodeKey?: NodeKey,
): ImageNode<T> {
  return new imageNodeClass.ctr(nodeKey)
    .setSrc(src)
    .setAltText(altText)
    .setWidth(width)
    .setHeight(height) as ImageNode<T>;
}

export function $isImageNode<T>(node: unknown): node is ImageNode<T> {
  return node instanceof ImageNode;
}
