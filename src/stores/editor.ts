import { defineStore } from "pinia";
import { EditorState, TextSelection, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, Node } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { keymap } from "prosemirror-keymap";
import { newlineInCode, chainCommands, baseKeymap, toggleMark, deleteSelection, joinBackward } from "prosemirror-commands";
import { splitListItem } from "prosemirror-schema-list";
import { history } from "prosemirror-history";
import { ref, watch } from "vue";
import { tryOnBeforeUnmount } from "@vueuse/core";

export const useEditorStore = defineStore("editor", () => {
  
    const editorContainer = ref<HTMLDivElement>();
    let view: EditorView | null = null;

    const schema = new Schema({
        nodes: basicSchema.spec.nodes,
        marks: basicSchema.spec.marks,
    });

    const initialContent = {
        type: "doc",
        content: [
            { type: "paragraph", content: [{ type: "text", text: "Начальный текст" }] }
        ]
    };

    watch(editorContainer, (editorContainerNew) => {
        if (!editorContainerNew) return;

        const state = EditorState.create({
            schema,
            doc: Node.fromJSON(schema, initialContent),
            plugins: [
                keymap({
                    "Enter": chainCommands(
                        newlineInCode, // Новая строка в коде
                        splitListItem(schema.nodes.list_item), // Новая строка в списке
                        baseKeymap["Enter"] // Обычный переход на новую строку
                    ),
                    "Backspace": chainCommands(
                        deleteSelection, // Удаляем выделенный текст
                        deleteEmptyParagraph, // Удаляем пустой параграф
                        joinBackward, // Стандартное поведение Backspace
                        baseKeymap["Backspace"]
                    ),
                }),
                history(), // Поддержка истории (Ctrl+Z)
                keymap({ "Mod-b": toggleMark(schema.marks.strong) }),
                keymap({ "Mod-i": toggleMark(schema.marks.em) }),
                keymap({ "Mod-`": toggleMark(schema.marks.code) }),
            ]
        });

        view = new EditorView(editorContainerNew, { state });
        view.dom.classList.add("prosemirror-editor");
        // view.dom.classList.add("prosemirror-editor", "jetbrains-mono-code-bold");

    }, {immediate: true});

    function deleteEmptyParagraph(state: EditorState, dispatch?: (tr: Transaction) => void) {
        const { $cursor } = state.selection as TextSelection;

        if (!$cursor || $cursor.parent.textContent.length > 0) {
          return false; // Если не пустой параграф — не обрабатываем
        }
      
        if (dispatch) {
          const tr = state.tr.delete($cursor.before(), $cursor.after());
      
          // Перемещаем курсор на строку выше
          const previousPos = tr.mapping.map($cursor.before() - 1);
          tr.setSelection(TextSelection.create(tr.doc, previousPos));
      
          dispatch(tr);
        }

        return true;
    }

    tryOnBeforeUnmount(() => {
        view?.destroy();
    });

    return {
        editorContainer
    }
});