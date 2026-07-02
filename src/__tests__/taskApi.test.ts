import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	it('getTasks returns array', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			})
		);

		const tasks = await getTasks();
		expect(tasks).toEqual([mockTask]);
		expect(fetch).toHaveBeenCalledWith('/api/tasks');
	});

	it('getTasks throws on HTTP error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Internal Server Error'),
			})
		);

		await expect(getTasks()).rejects.toThrow('HTTP 500');
	});

	it('createTask sends POST request and returns created task', async () => {
		const newTask = { ...mockTask, id: 2, title: 'Nouvelle tâche' };
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(newTask),
			})
		);

		const result = await createTask({ title: 'Nouvelle tâche' });
		expect(result).toEqual(newTask);
		expect(fetch).toHaveBeenCalledWith(
			'/api/tasks',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Nouvelle tâche' }),
			})
		);
	});

	it('createTask throws on HTTP error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				text: () => Promise.resolve('Bad Request'),
			})
		);

		await expect(createTask({ title: '' })).rejects.toThrow('HTTP 400');
	});

	it('updateTask sends PUT request and returns updated task', async () => {
		const updated = { ...mockTask, title: 'Modifié', completed: true };
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(updated),
			})
		);

		const result = await updateTask(1, { title: 'Modifié', completed: true });
		expect(result).toEqual(updated);
		expect(fetch).toHaveBeenCalledWith(
			'/api/tasks/1',
			expect.objectContaining({
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Modifié', completed: true }),
			})
		);
	});

	it('updateTask throws on HTTP error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not Found'),
			})
		);

		await expect(updateTask(999, { title: 'x' })).rejects.toThrow('HTTP 404');
	});

	it('deleteTask sends DELETE request', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
			})
		);

		await deleteTask(1);
		expect(fetch).toHaveBeenCalledWith(
			'/api/tasks/1',
			expect.objectContaining({ method: 'DELETE' })
		);
	});

	it('deleteTask throws on HTTP error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not Found'),
			})
		);

		await expect(deleteTask(999)).rejects.toThrow('HTTP 404');
	});
});
