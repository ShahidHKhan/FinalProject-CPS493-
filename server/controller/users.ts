import { Router } from 'express';
import type { PagingRequest } from '../types';
import { create, get, getAll, remove, update, updatePreferredMuscleGroups } from '../models/users';
import { DataEnvelope, DataListEnvelope, simpleUser } from '../types';
import { requireAuth } from "../middleware/auth"

const app = Router();
const ALLOWED_MUSCLE_GROUPS = new Set([
	'Shoulders',
	'Chest',
	'Back',
	'Arms',
	'Core',
	'Glutes',
	'Hip Flexors',
	'Quadriceps',
	'Hamstrings',
	'Calves',
]);

app
	.get('/account-options', async (_req, res) => {
		try {
			const { list, count } = await getAll({ page: 1, pageSize: 1000 });
			const dataEnvelope: DataListEnvelope<simpleUser> = {
				data: list,
				isSuccess: true,
				total: count,
			};

			res.send(dataEnvelope);
		} catch {
			res.status(500).send({ isSuccess: false, message: 'Failed to load account options' });
		}
	})
	.get("/", requireAuth("admin"), async (req, res) => {
		try {
			const { list, count } = await getAll(req.query as unknown as PagingRequest);
			const dataEnvelope: DataListEnvelope<simpleUser> = {
				data: list,
				isSuccess: true,
				total: count,
			};

			res.send(dataEnvelope);
		} catch {
			res.status(500).send({ isSuccess: false, message: 'Failed to load users' });
		}
	})
	.get('/count', requireAuth("admin"), async (req, res) => {
		try {
			const { count } = await getAll(req.query as unknown as PagingRequest);

			res.send({ count });
		} catch {
			res.status(500).send({ isSuccess: false, message: 'Failed to load users' });
		}
	})
	.get('/:id', requireAuth("admin"), async (req, res) => {
		const userId = Number.parseInt(req.params.id, 10);
		try {
			const foundUser = await get(userId);
			res.send(foundUser);
		} catch {
			res.status(404).send({ isSuccess: false, message: 'User not found' });
		}
	})
	.post('/', requireAuth("admin"), async (req, res) => {
		try {
			const newUser = await create(req.body);

			res.status(201).send(newUser);
		} catch {
			res.status(500).send({ isSuccess: false, message: 'Failed to create user' });
		}
	})
	.patch('/:id', requireAuth("admin"), async (req, res) => {
		const userId = Number.parseInt(req.params.id, 10);
		try {
			const updatedUser = await update(userId, req.body);
			res.send(updatedUser);
		} catch {
			res.status(404).send({ isSuccess: false, message: 'User not found' });
		}
	})
	.patch('/:id/focus-muscles', async (req, res) => {
		const userId = Number.parseInt(req.params.id, 10);
		const preferredMuscleGroups = req.body?.preferredMuscleGroups;

		if (!Array.isArray(preferredMuscleGroups) || preferredMuscleGroups.some((muscle) => typeof muscle !== 'string')) {
			res.status(400).send({ isSuccess: false, message: 'preferredMuscleGroups must be an array of strings' });
			return;
		}

		const normalized = Array.from(new Set(preferredMuscleGroups.map((muscle) => muscle.trim()).filter(Boolean)));
		const invalidMuscles = normalized.filter((muscle) => !ALLOWED_MUSCLE_GROUPS.has(muscle));
		if (invalidMuscles.length > 0) {
			res.status(400).send({ isSuccess: false, message: `Invalid muscle groups: ${invalidMuscles.join(', ')}` });
			return;
		}

		try {
			const updatedUser = await updatePreferredMuscleGroups(userId, normalized);
			res.send(updatedUser);
		} catch {
			res.status(404).send({ isSuccess: false, message: 'User not found' });
		}
	})
	.delete('/:id', requireAuth("admin"), async (req, res) => {
		const userId = Number.parseInt(req.params.id, 10);
		try {
			const removedUser = await remove(userId);
			const response: DataEnvelope<simpleUser> = {
				data: removedUser,
				isSuccess: true,
				message: `${removedUser.name} deleted`,
			};

			res.send(response);
		} catch {
			res.status(404).send({ isSuccess: false, message: 'User not found' });
		}
	});

export default app;
