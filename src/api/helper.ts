import { ipcMain } from 'electron'

const ipcMethods = new Map<string, (...args: unknown[]) => Promise<unknown>>()

export function IPCMethod(channelName?: string) {
    return function (_: unknown, key: string, descriptor: PropertyDescriptor) {
        const eventName = channelName || key

        ipcMethods.set(eventName, descriptor.value)

        return descriptor
    }
}

export function registerIpcHandlers() {
    ipcMethods.forEach((method, channel) => {
        ipcMain.handle(channel, async (_event, ...args) => {
            return method(...args)
        })
    })
}
