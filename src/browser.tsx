import { InitialConfigType } from '@lexical/react/LexicalComposer';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { AutoLinkExtension, LinkExtension } from '@lexical/link';
import { HeadingNode, QuoteNode, RichTextExtension } from '@lexical/rich-text';
import { CodeExtension } from '@lexical/code';
import { CodeShikiExtension } from '@lexical/code-shiki';
import { TableExtension } from '@lexical/table';
import { ListExtension, CheckListExtension } from '@lexical/list';
import { ToolbarPlugin } from './plugins/ToolbarPlugin.jsx';
import { EnableDisablePlugin } from './plugins/EnableDisablePlugin.jsx';
import { MATCHERS } from './plugins/AutoLinkMatcherPlugin.jsx';
import { ImageDropPlugin } from './plugins/ImageDropPlugin.jsx';
import styles from './browser.module.scss';
import {
  AnyLexicalExtensionArgument,
  CommandPayloadType,
  configExtension,
  defineExtension,
  TextNode,
  type EditorThemeClasses,
} from 'lexical';
import { useRef, type FC, type KeyboardEvent, type MouseEventHandler, type RefObject } from 'react';
import {
  getKnownTypesAndNodes,
  HorizontalRuleExtension,
  KnownTypesAndNodes,
  TabIndentationExtension,
} from '@lexical/extension';
import { ColorTextExtension } from './plugins/ColorTextExtension.jsx';
import { ImageExtension, INSERT_IMAGE_COMMAND } from './plugins/ImageExtension.jsx';
import { HistoryExtension } from '@lexical/history';
import { ReactExtension } from '@lexical/react/ReactExtension';
import { uploadedImageFC } from './browser/Image.jsx';
import { GetStatePlugin } from './plugins/GetStatePlugin.jsx';

export type Bundle = '@rte/simple' | '@rte/full';
/**
 * Bundle of features (nodes and plugins) to use in Lexical Editor.
 *
 * Contains:
 * - `nodes`: List of custom nodes to register in Lexical Editor {@link InitialConfigType}
 * - `plugins`: List of Lexical plugins to use in the Editor. Each plugin can be a React
 *              Functional Component (the type you'll get when importing plugins) or an object containing
 *              the plugin as `plugin` property and an `options` property containing props to pass to the
 *              plugin. When adding a plugin, make sure its required nodes are also added in the `nodes` list.
 *
 * **Important Note:** When using {@link ColorTextNode}, make sure to add a node replacement rule to turn
 * any{@link TextNode} into a {@link ColorTextNode} such as described {@link https://lexical.dev/docs/concepts/node-replacement in the docs}.
 */
export type RTEFeatureBundle = {
  nodes: InitialConfigType['nodes'];
  plugins: (FC | { plugin: FC; options: Record<string, unknown> })[];
  extensions: AnyLexicalExtensionArgument[];
};

/** Preconfigurations for Editor, see {@link $registerBundle} to create other bundles and {@link RTEFeatureBundle} for types. */
const EDITOR_BUNDLES = {
  '@rte/simple': {
    nodes: [],
    plugins: [],
    extensions: [],
  },
  '@rte/full': {
    nodes: [HeadingNode, QuoteNode],
    plugins: [ImageDropPlugin, MarkdownShortcutPlugin],
    extensions: [
      configExtension(AutoLinkExtension, { matchers: MATCHERS }),
      HorizontalRuleExtension,
      CodeExtension,
      CodeShikiExtension,
      ColorTextExtension,
      ImageExtension,
      LinkExtension,
      ListExtension,
      CheckListExtension,
      TableExtension,
      TabIndentationExtension,
    ],
  },
} as Record<Bundle, RTEFeatureBundle>;

/** Theme used to display contents of Editor */
const defaultTheme = {
  root: styles['editor-root'],
  image: styles['editor-image'],
  link: styles['editor-link'],
  text: {
    bold: styles['bold'],
    italic: styles['italic'],
    underline: styles['underline'],
    strikethrough: styles['strikethrough'],
    code: styles['editor-code'],
  },
  quote: styles['editor-quote'],
  hr: styles['editor-horizontal-rule'],
  list: {
    checklist: styles['editor-checklist'],
    listitem: styles['editor-list-item'],
    listitemChecked: styles['editor-list-item-checked'],
    listitemUnchecked: styles['editor-list-item-unchecked'],
    ol: styles['editor-ordered-list'],
    ul: styles['editor-unordered-list'],
    nested: {
      listitem: styles['editor-list-item-nested'],
    },
  },
  table: styles['editor-table'],
  tableCell: styles['editor-table-cell'],
  tableCellHeader: styles['editor-table-cell-header'],
  tableRow: styles['editor-table-row'],
} satisfies EditorThemeClasses;

export type UploadedImageComponent = FC<{
  className: string;
  src: string;
  width: 'inherit' | number;
  height: 'inherit' | number;
  altText: string;
  onClick: MouseEventHandler<HTMLImageElement>;
}>;
export type InputComponent = FC<{
  className: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onEnter: (event?: KeyboardEvent<HTMLInputElement>) => void;
}>;

interface LexicalTextEditorProps<K, T extends Bundle = '@rte/simple'> {
  /**
   * The feature bundle to use: custom nodes from used in {@link InitialConfigType} and lexical plugins.
   * This property should not be edited after the component is mounted as Lexical does not support dynamic
   * node list changes. You can use custom bundles if registered with {@link $registerBundle}.
   *
   * Predefined bundles:
   * - `@rte/simple`: No extra nodes or plugins, only basic rich text features: bold, italic, underline,
   *                     strikethrough and alignment
   * - `@rte/full`:   All available nodes and plugins provided by RichTurboEditor: including images, tables, code blocks,
   *                     colored text, links, lists, horizontal rules, markdown support, quotes, headings, indentation.
   * @default '@rte/simple'
   */
  bundle?: T;
  /** Whether the Editor should handle inputs and events. This property can be updated at anytime. */
  disabled?: boolean;
  /** The text (or ReactNode) to display when Editor is empty and disabled (property disabled set to true) */
  emptyText?: string;
  /** The text (or ReactNode) to display when Editor is empty and enabled (no property disabled=true) */
  placeholder: string;
  /** The initial state of the Editor, in Lexical's JSON format */
  initialState?: string;
  /**
   * Callback called when the content of the Editor changes, providing the new state in Lexical's JSON format
   * @deprecated Use {@link LexicalTextEditorProps.getState} instead as you should not update the local state
   * to prevent the editor from refreshing
   */
  onChange?: (state: string) => void;
  /** Retrieves the current state of the editor */
  getState?: RefObject<() => string>;
  /**
   * A ref to a hook to update Editor state (contents). This hook must be only used when setting different content,
   * not for regular updated sent by `onChange` as state is already retained by Lexical (and it would be a bummer to
   * recompute the whole state for every change).
   */
  setStateRef?: RefObject<(s: string) => void>;
  theme?: EditorThemeClasses;
  uploadfileMethod?: T extends '@rte/full' ? (file: File) => Promise<K> : never;
  extractMetaData?: T extends '@rte/full' ? (apiResponse: K) => CommandPayloadType<typeof INSERT_IMAGE_COMMAND> : never;
  dropPlaceholder?: T extends '@rte/full' ? string : never;
  uploadPlaceholderText?: T extends '@rte/full' ? string : never;
  UploadedImageComponent?: T extends '@rte/full' ? UploadedImageComponent : never;
  InputComponent?: T extends '@rte/full' ? InputComponent : never;
}

/**
 * A Rich Text Editor component based on {@link https://lexical.dev Lexical}, with an onboarded toolbar
 * and support for plugins and custom nodes.
 *
 * Lexical does not support dynamic node list changes, so the `bundle` property should not be changed
 * after the component is mounted. Use {@link $registerBundle} to create and register custom bundles
 * of nodes and plugins to use in the Editor.
 *
 * As Lexical does not use React nodes, the content of the editor is not managed through React state
 * (it is managed through lexical state). The state you provide is an **initial state only**. To get
 * the content of the editor, you can use the `onChange` callback from the props.
 *
 * @example
 * <RichTurboEditor
 *   placeholder={t('assos:infos.edit.description.placeholder')}
 *   emptyText={t('assos:infos.description.empty')}
 *   initialState={asso!.description}
 *   onChange={console.log}
 *   disabled={!editInfosMode}
 * />
 */
export function RichTurboEditor<T extends Bundle, K>({
  bundle,
  placeholder,
  emptyText,
  disabled = false,
  initialState,
  onChange,
  getState,
  setStateRef,
  uploadPlaceholderText,
  dropPlaceholder,
  uploadfileMethod,
  extractMetaData,
  InputComponent,
  UploadedImageComponent,
  theme = {},
}: LexicalTextEditorProps<K, T>) {
  uploadedImageFC.ref = UploadedImageComponent;
  const { nodes, plugins, extensions } = EDITOR_BUNDLES[bundle ?? '@rte/simple'];
  const nodesRef = useRef<KnownTypesAndNodes['nodes']>(new Set());
  const richTurboEditorExtension = defineExtension({
    name: '@ungdev/rte',
    dependencies: [
      HistoryExtension,
      RichTextExtension,
      ...extensions,
      configExtension(ReactExtension, { contentEditable: null }),
    ],
    init(_editorConfig, config) {
      nodesRef.current = getKnownTypesAndNodes(config).nodes;
    },
    nodes: () => nodes,
    theme: { ...defaultTheme, ...theme },
    $initialEditorState: initialState,
  });

  return (
    <LexicalExtensionComposer extension={richTurboEditorExtension} contentEditable={null}>
      {!disabled && (
        <ToolbarPlugin
          enabledNodes={nodesRef}
          uploadPlaceholderText={uploadPlaceholderText}
          InputComponent={InputComponent}
          extractMetaData={extractMetaData}
          uploadfileMethod={uploadfileMethod}
        />
      )}
      <div className={styles.placeholderContainer}>
        <ContentEditable
          aria-placeholder={(disabled && emptyText) || placeholder}
          placeholder={<div className={styles.placeholder}>{(disabled && emptyText) || placeholder}</div>}
        />
        <OnChangePlugin onChange={(state) => !disabled && onChange?.(JSON.stringify(state.toJSON(true)))} />
        <EnableDisablePlugin disabled={disabled} ref={setStateRef} />
        <GetStatePlugin ref={getState} />
        {plugins.map((Plugin, index) =>
          typeof Plugin === 'function' ? (
            Plugin === ImageDropPlugin ? (
              <ImageDropPlugin
                dropPlaceholder={dropPlaceholder}
                extractMetaData={extractMetaData}
                uploadfileMethod={uploadfileMethod}
                key={index}
              />
            ) : (
              <Plugin key={index} />
            )
          ) : (
            <Plugin.plugin key={index} {...Plugin.options} />
          ),
        )}
      </div>
    </LexicalExtensionComposer>
  );
}

/**
 * Use this function to ensure `str` can be used in a {@link RichTurboEditor}
 * (either in the `initialState` prop or through the `setStateRef` hook)
 */
export function $makeJson(str: string) {
  try {
    JSON.parse(str);
    return str;
  } catch {
    return (
      `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"${str.replaceAll(/\\/g, '\\\\').replaceAll(/"/g, '\\"')}",` +
      `"type":"color-text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],` +
      `"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`
    );
  }
}
