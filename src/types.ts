export type TodoItem = {
    name: string;
    link: string
    author: string;
    type?: string;
    status?: number;
    score?: number;
    completedTime?: Date;
    id?: number
}