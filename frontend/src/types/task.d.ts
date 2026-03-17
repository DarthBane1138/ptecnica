export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
    id: number;
    title: string;
    description: string;
    category: string;
    status: TaskStatus;
    created_at: string;
    updated_at: string;
}

export interface TaskInput {
    title: string;
    description: string;
    category: string;
}

export interface SubtaskSuggestionResponse {
    title: string;
    subtasks: string[];
}

export interface Category {
    id: number;
    name: string;
}
