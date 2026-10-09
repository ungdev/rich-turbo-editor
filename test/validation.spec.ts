import { createHeadlessEditor } from '@lexical/headless';
import { $createParagraphNode, $createTextNode, $getRoot, LexicalEditor } from 'lexical';
import { $createCodeHighlightNode, $createCodeNode } from '@lexical/code';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createImageNode } from '../src/nodes/ImageNode.js';
import { $createColorTextNode } from '../src/nodes/ColorTextNode.js';
import { $createAutoLinkNode, $createLinkNode } from '@lexical/link';
import { $createHorizontalRuleNode } from '@lexical/extension';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { $createTableCellNode, $createTableNode, $createTableRowNode } from '@lexical/table';
import { describe, expect, it } from 'vitest';
import { BUNDLES, isValidLexicalContent, useBundle } from '../src/server.js';

const ValidationUnitSpec = () =>
  describe('Lexical validation', () => {
    const checkValidityForBundles = (
      name: string,
      bundles: Record<keyof typeof BUNDLES, boolean>,
      test: (editor: LexicalEditor) => void,
    ) => {
      Object.entries(bundles).forEach(([bundle, shouldBeValid]: [keyof typeof BUNDLES, boolean]) => {
        describe(name, () => {
          it(bundle, () => {
            const editor = createHeadlessEditor({
              nodes: BUNDLES[bundle],
            });
            useBundle(bundle);
            editor.update(() => {
              test(editor);
            });
            editor.read(() =>
              expect(isValidLexicalContent(JSON.stringify(editor.getEditorState()), bundle)).toBe(shouldBeValid),
            );
          });
        });
      });
    };

    checkValidityForBundles(
      'Paragraph',
      {
        '@rte/full': true,
        '@rte/simple': true,
      },
      () => $getRoot().append($createParagraphNode().append($createTextNode('Hello World'))),
    );

    checkValidityForBundles(
      'Paragraph with color',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () => $getRoot().append($createParagraphNode().append($createColorTextNode('Hello World').setColor('blue'))),
    );

    checkValidityForBundles(
      'Paragraph with link',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () =>
        $getRoot().append(
          $createParagraphNode().append(
            $createTextNode('Hello '),
            $createLinkNode('World').setURL('https://etu.utt.fr'),
          ),
        ),
    );

    checkValidityForBundles(
      'Paragraph with autolink',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () =>
        $getRoot().append(
          $createParagraphNode().append(
            $createTextNode('Hello '),
            $createAutoLinkNode('World').setURL('https://etu.utt.fr'),
          ),
        ),
    );

    checkValidityForBundles(
      'Heading',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () => $getRoot().append($createHeadingNode().append($createTextNode('Hello heading'))),
    );

    checkValidityForBundles(
      'Quote',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () => $getRoot().append($createQuoteNode().append($createTextNode('Hello quote'))),
    );

    checkValidityForBundles(
      'Code',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () =>
        $getRoot().append($createCodeNode().append($createTextNode('Hello '), $createCodeHighlightNode('highlight'))),
    );

    checkValidityForBundles(
      'Image',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () => $getRoot().append($createParagraphNode().append($createImageNode('https://etu.utt.fr/test.webp'))),
    );

    checkValidityForBundles(
      'Horizontal rule',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () => $getRoot().append($createHorizontalRuleNode()),
    );

    checkValidityForBundles(
      'List',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () => $getRoot().append($createListNode().append($createListItemNode().append($createTextNode('Item')))),
    );

    checkValidityForBundles(
      'Table',
      {
        '@rte/full': true,
        '@rte/simple': false,
      },
      () =>
        $getRoot().append(
          $createTableNode().append(
            $createTableRowNode().append($createTableCellNode().append($createTextNode('Cell'))),
          ),
        ),
    );
  });

export default ValidationUnitSpec;
