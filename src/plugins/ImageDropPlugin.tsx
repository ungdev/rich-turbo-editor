import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $addUpdateTag,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  CommandPayloadType,
  createCommand,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  LexicalEditor,
  PASTE_COMMAND,
  SKIP_SELECTION_FOCUS_TAG,
} from 'lexical';
import { useEffect, useState } from 'react';
import { INSERT_IMAGE_COMMAND } from './ImageExtension.jsx';
import { Image } from '../browser/Image.js';
import styles from '../browser.scss';

export const DRAGLEAVE_COMMAND = createCommand<DragEvent>('DRAGLEAVE_COMMAND');

export async function uploadFile<T>(
  uploadfileMethod: (file: File) => Promise<T>,
  extractMetaData: (apiResponse: T) => CommandPayloadType<typeof INSERT_IMAGE_COMMAND>,
  file: File,
  editor: LexicalEditor,
) {
  const uploadResponse = await uploadfileMethod(file);
  editor.update(() => {
    $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, extractMetaData(uploadResponse));
  });
}

export function ImageDropPlugin<T>(props: {
  uploadfileMethod: (file: File) => Promise<T>;
  extractMetaData: (apiResponse: T) => CommandPayloadType<typeof INSERT_IMAGE_COMMAND>;
  dropPlaceholder: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [isHovered, setIsHovered] = useState(false);

  function onDragOver(event: DragEvent) {
    if (event.dataTransfer!.types.includes('Files')) {
      setIsHovered(true);
      event.preventDefault();
      return true;
    }
    return false;
  }

  function onDragLeave() {
    setIsHovered(false);
    return true;
  }

  function onDrop(event: DragEvent, editor: LexicalEditor) {
    const file = getImagesFromFileList(event.dataTransfer!.files);
    if (file.length) {
      setIsHovered(false);
      event.preventDefault();
    }
    file.forEach((f) => uploadFile(props.uploadfileMethod, props.extractMetaData, f, editor));
    return !!file.length;
  }

  useEffect(() => {
    if (!editor.hasNodes([Image])) throw new Error('ImagePlugin: ImageNode not registered on editor');

    const listener = (event: DragEvent) => editor.dispatchCommand(DRAGLEAVE_COMMAND, event);
    editor.getRootElement()?.addEventListener('dragleave', listener);
    return mergeRegister(
      editor.registerCommand(DRAGOVER_COMMAND, (event) => onDragOver(event), COMMAND_PRIORITY_LOW),
      editor.registerCommand(DRAGLEAVE_COMMAND, () => onDragLeave(), COMMAND_PRIORITY_HIGH),
      editor.registerCommand(DROP_COMMAND, (event) => onDrop(event, editor), COMMAND_PRIORITY_HIGH),
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          if (event instanceof ClipboardEvent) {
            const files = getImagesFromFileList(event.clipboardData!.files);
            if (files.length) event.preventDefault();
            files.forEach((file) => uploadFile(props.uploadfileMethod, props.extractMetaData, file, editor));
            return !!files.length;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      () => editor.getRootElement()?.removeEventListener('dragleave', listener),
    );
  }, [editor]);

  return <div className={isHovered ? styles.dropZone : undefined}>{isHovered && props.dropPlaceholder}</div>;
}

function getImagesFromFileList(fileList: FileList) {
  const list = [] as File[];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (file.type.startsWith('image/')) list.push(file);
  }
  return list;
}
