export interface Task {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface TaskInput {
    title: string;
    description: string;
    category: string;
}