import { Router } from 'express';
import type { PagingRequest } from '../types';
import { create, get, getAll, remove, update } from '../models/users';
import { DataEnvelope, DataListEnvelope, simpleUser } from '../types';
import { requireAuth } from "../middleware/auth"

const app = Router();

app
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
