import { defineStore } from "pinia";
import { TodoItem } from "../types";
import { ref } from "vue";

export const useTodoListStore = defineStore("todolist", () => {
  
    const todoList = ref<TodoItem[]>([]);
    todoList.value.push({
        name: "test124214",
        type: "test4214",
        status: 0,
        score: 0,
        author: "test4242",
        completedTime: new Date(),
        link: "tes12t"
    })

    todoList.value.push({
        name: "test",
        type: "test",
        status: 0,
        score: 0,
        author: "test",
        completedTime: new Date(),
        link: "test"
    })

    async function fetch(todoItemName: string) {
        let todoItem: TodoItem | undefined;

        try {
            todoItem = await windowAPI.api.fetchTodoItem({ name: todoItemName });
        } catch (e) {
            console.error(e);
        }

        return todoItem;
    }

    async function create(todoItem: TodoItem) {
        let newTodoItem: TodoItem | undefined;
        try {
            newTodoItem = await windowAPI.api.createTodoItem(todoItem);
        } catch (e) {
            console.error(e);
        }

        if (!newTodoItem) {
            console.log("Cant create todoItem");
            return;
        }

        return newTodoItem;
    }

    async function update(todoItem: TodoItem) {
        let newTodoItem: TodoItem | undefined;

        try {
            newTodoItem = await windowAPI.api.updateTodoItem(todoItem);
        } catch (e) {
            console.error(e);
        }

        if (!newTodoItem) {
            console.log("Cant update todoItem");
            return;
        }

        return newTodoItem;
    }

    return {
        todoList,

        fetch,
        create,
        update
    }
});

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot));
// }
