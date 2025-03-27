import { BrowserWindow, ipcRenderer, net } from "electron";
import { api_constants } from "../constants";
import { IPCMethod } from "./helper";
import { TodoItem } from "../types";

export class MyAPI {
  static browserWindow: BrowserWindow;

  static init(mainWindow: BrowserWindow) {
    MyAPI.browserWindow = mainWindow;
  }

  @IPCMethod()
  public static async fetchUser(body: { email: string; password: string }): Promise<string> {
    try {
      const response = await net.fetch(api_constants.backend_url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  @IPCMethod()
  public static async register(body: { name: string, email: string; password: string }): Promise<string> {

    try {
      const response = await net.fetch(api_constants.backend_url + "user/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  @IPCMethod()
  public static async fetchTodoItem(body: { name: string }): Promise<string> {

    try {
      const response = await net.fetch(api_constants.backend_url + `todolist/${body.name}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  @IPCMethod()
  public static async createTodoItem(body: TodoItem): Promise<string> {

    try {
      const response = await net.fetch(api_constants.backend_url + "todolist/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  @IPCMethod()
  public static async updateTodoItem(body: TodoItem): Promise<string> {
    try {
      const response = await net.fetch(api_constants.backend_url + `todolist/update/${body.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }
}

// There are the methods our Vue app uses
export const ipcCalls = {
  fetchUser: (body: { email: string; password: string }) => 
    ipcRenderer.invoke("fetchUser", body),

  register: (body: { name: string, email: string; password: string }) => 
    ipcRenderer.invoke("register", body),

  createTodoItem: (body: TodoItem) => 
    ipcRenderer.invoke("createTodoItem", body),

  fetchTodoItem: (body: { name: string }) => 
    ipcRenderer.invoke("fetchTodoItem", body),

  updateTodoItem: (body: TodoItem) => 
    ipcRenderer.invoke("updateTodoItem", body),
}