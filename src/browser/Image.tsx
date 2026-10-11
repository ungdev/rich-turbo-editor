import { altTextState, heightState, ImageNode, imageNodeClass, srcState, widthState } from '../nodes/ImageNode.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { $getState, EditorConfig } from 'lexical';
import React, { JSX } from 'react';
import styles from '../browser.scss';
import { UploadedImageComponent } from '../browser.jsx';

export const uploadedImageFC: {
  ref: UploadedImageComponent;
} = { ref: null };
export class Image extends ImageNode<JSX.Element> {
  decorateSelf(element: HTMLElement, config: EditorConfig): HTMLElement {
    if (config?.theme?.image) element.className = config.theme.image;
    return element;
  }
  decorate(): JSX.Element {
    const image = this;
    function ImageComponent() {
      const [editor] = useLexicalComposerContext();
      const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(image.getKey());
      return (
        <uploadedImageFC.ref
          className={isSelected && editor._editable ? styles.selected : ''}
          src={$getState(image, srcState)}
          width={$getState(image, widthState)}
          height={$getState(image, heightState)}
          altText={$getState(image, altTextState)}
          onClick={(event) => {
            if (!editor._editable) {
              setSelected(false);
              clearSelection();
            } else if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            event.preventDefault();
            event.stopPropagation();
            return true;
          }}
        />
      );
    }
    return <ImageComponent />;
  }
}
imageNodeClass.ctr = Image;
