export type TodoItem = {
    name: string
    link: string
    author: string
    type?: string
    status?: number
    score?: number
    completedTime?: Date
    id?: number
}

export type openDialogFileType = 'Object' | 'Material'

export type openDialogTextureType = 'albedo' | 'normal' | 'metalness' | 'roughness' | 'sheen'
