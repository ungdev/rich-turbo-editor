import { createHeadlessEditor } from '@lexical/headless';
import { $createParagraphNode, $createTextNode, $getRoot, LexicalEditor } from 'lexical';
import { $createImageNode } from '../src/nodes/ImageNode.js';
import { $createColorTextNode, Color } from '../src/nodes/ColorTextNode.js';
import { describe, expect, it } from 'vitest';
import { BUNDLES, generateHTML, useBundle } from '../src/server.js';

const GenerationUnitSpec = () =>
  describe('Generation', () => {
    const checkExportForBundles = (
      name: string,
      bundles: (keyof typeof BUNDLES)[],
      test: (editor: LexicalEditor) => void,
      result: string,
    ) => {
      bundles.forEach((bundle) => {
        describe(name, () => {
          it(bundle, async () => {
            const editor = createHeadlessEditor({
              nodes: BUNDLES[bundle],
            });
            useBundle(bundle);
            editor.update(() => {
              test(editor);
            });
            await editor.read(async () =>
              expect(await generateHTML(JSON.stringify(editor.getEditorState()), bundle)).toBe(result),
            );
          });
        });
      });
    };

    checkExportForBundles(
      'Paragraph',
      ['@rte/full', '@rte/simple'],
      () => $getRoot().append($createParagraphNode().append($createTextNode('Hello World'))),
      '<p style="margin:0px;"><span style="white-space:pre-wrap;">Hello World</span></p>',
    );

    checkExportForBundles(
      'Bold text',
      ['@rte/full', '@rte/simple'],
      () =>
        $getRoot().append(
          $createParagraphNode().append($createTextNode('Hello '), $createTextNode('World').setFormat('bold')),
        ),
      '<p style="margin:0px;"><span style="white-space:pre-wrap;">Hello </span><b><strong style="white-space:pre-wrap;font-weight:bold;">World</strong></b></p>',
    );

    checkExportForBundles(
      'Image',
      ['@rte/full'],
      () =>
        $getRoot().append(
          $createParagraphNode().append($createImageNode('https://etu.utt.fr/test.webp', 'An image', 69, 42)),
        ),
      '<p style="margin:0px;"><span><img src="https://etu.utt.fr/test.webp" alt="An image" width="69" height="42"></span></p>',
    );

    checkExportForBundles(
      'Color text',
      ['@rte/full'],
      () => $getRoot().append($createParagraphNode().append($createColorTextNode('Hello World', 'blue'))),
      `<p style="margin:0px;"><span style="color:${Color.blue};white-space:pre-wrap;">Hello World</span></p>`,
    );
  });

export default GenerationUnitSpec;
