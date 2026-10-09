import { TextColor } from '../browser/TextColor.js';
import { $createColorTextNodeFromTextNode, $isColorTextNode, SerializedColor } from '../nodes/ColorTextNode.js';
import {
  $addUpdateTag,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  defineExtension,
  SKIP_SELECTION_FOCUS_TAG,
  TextNode,
} from 'lexical';

export const FORMAT_COLOR_COMMAND = createCommand<SerializedColor>('FORMAT_COLOR_COMMAND');
export const ColorTextExtension = defineExtension({
  name: '@ungdev/rte/text/color',
  nodes: [
    TextColor,
    {
      replace: TextNode,
      with: (node: TextNode) => {
        return $createColorTextNodeFromTextNode(node);
      },
      withKlass: TextColor,
    },
  ],
  register: (editor) =>
    editor.registerCommand(
      FORMAT_COLOR_COMMAND,
      (color) => {
        editor.update(() => {
          $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const colorNodes = selection
              .getNodes()
              .map((node) => ($isTextNode(node) ? $createColorTextNodeFromTextNode(node, color) : node));
            const lastIndex = colorNodes.length - 1;
            const lastColorNode = colorNodes[lastIndex];
            // Order is important here, we must start by the last one in case it is also the first one.
            if ($isColorTextNode(lastColorNode))
              colorNodes[lastIndex] = lastColorNode.spliceText(
                selection.isBackward() ? selection.anchor.offset : selection.focus.offset,
                lastColorNode.getTextContent().length,
                '',
              );
            if ($isColorTextNode(colorNodes[0]))
              colorNodes[0] = colorNodes[0].spliceText(
                0,
                selection.isBackward() ? selection.focus.offset : selection.anchor.offset,
                '',
              );
            selection.insertNodes(colorNodes);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
});
