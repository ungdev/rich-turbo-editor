import { altTextState, heightState, ImageNode, imageNodeClass, srcState, widthState } from '@/nodes/ImageNode.js';
import { $getState } from 'lexical';

export class Image extends ImageNode<HTMLElement> {
  decorateSelf(element: HTMLElement): HTMLElement {
    const img = document.createElement('img');
    img.src = $getState(this, srcState);
    img.alt = $getState(this, altTextState);
    const width = $getState(this, widthState);
    const height = $getState(this, heightState);
    if (width !== 'inherit') img.width = width;
    if (height !== 'inherit') img.height = height;
    element.appendChild(img);
    return element;
  }
  decorate(): HTMLElement {
    return null;
  }
}
imageNodeClass.ctr = Image;
