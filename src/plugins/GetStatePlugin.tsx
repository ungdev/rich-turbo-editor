import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RefObject, useEffect } from 'react';

/**
 * @param ref May contain a function that can be used to retrieve the state of the editor
 */
export function GetStatePlugin({ ref }: { ref?: RefObject<() => string> }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (ref) ref.current = () => JSON.stringify(editor.getEditorState().toJSON(true));
  }, [editor]);

  return <></>;
}
