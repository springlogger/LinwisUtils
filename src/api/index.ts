import { BrowserWindow, ipcRenderer, net } from "electron";
import { api_constants } from "../constants";
import { IPCMethod } from "./helper";

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
}

// There are the methods our Vue app uses
export const ipcCalls = {
  fetchUser: (body: { email: string; password: string }) => 
    ipcRenderer.invoke("fetchUser", body),

  register: (body: { name: string, email: string; password: string }) => 
    ipcRenderer.invoke("register", body),
}