import { Node, mergeAttributes } from "@tiptap/core";
import { inputRules } from "prosemirror-inputrules";
import {
  makeInlineMathInputRule,
  REGEX_INLINE_MATH_DOLLARS,
  mathPlugin,
  insertMathNode,
} from "./plugin";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      insertMathInline: () => ReturnType;
    };
  }
}

export const MathInline = Node.create({
  name: "mathInline",
  group: "inline math",
  content: "text*", // important!
  inline: true, // important!
  atom: true, // important!
  code: true,

  parseHTML() {
    return [
      {
        tag: "span[class*='math-inline']", // important!,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ class: "math-inline math-node" }, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      insertMathInline:
        () =>
        ({ state, dispatch, view }) => {
          return insertMathNode(this.type)(state, dispatch, view);
        },
    };
  },

  addProseMirrorPlugins() {
    const inputRulePlugin = inputRules({
      rules: [makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, this.type)],
    });

    return [mathPlugin, inputRulePlugin];
  },
});
