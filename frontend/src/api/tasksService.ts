import type { TaskInput } from "../types/task";
import apiClient from "./client";

export async function getTasks() {
    const response = await apiClient.get("/tasks/");
    return response.data;
}

export async function getTask(id: number) {
    const response = await apiClient.get(`/tasks/${id}/`);
    return response.data;
}

export async function createTask(taskInput: TaskInput) {
    const response = await apiClient.post("/tasks/", taskInput);
    return response.data;
}

export async function completeTask(id: number) {
    const response = await apiClient.post(`/tasks/${id}/complete/`);
    return response.data;
}

export async function deleteTask(id: number) {
    const response = await apiClient.delete(`/tasks/${id}/`);
    return response.data;
}

export async function suggestSubtask(title: string) {
    const response = await apiClient.post("/suggest-subtasks/", { title });
    return response.data;
}