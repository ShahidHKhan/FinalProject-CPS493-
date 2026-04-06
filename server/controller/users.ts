import { Router } from 'express';
import { create, get, getAll, remove, update } from '../models/users';
import { DataEnvelope, DataListEnvelope, simpleUser } from '../types';

const app = Router();

app
	.get('/', (req, res) => {
		const { users, count } = getAll(req.query);
		const sanitizedUsers = users.map(({ id, name, role }) => ({ id, name, role }));
		const dataEnvelope: DataListEnvelope<simpleUser> = {
			data: sanitizedUsers,
			isSuccess: true,
			total: count,
		};

		res.send(dataEnvelope);
	})
	.get('/count', (req, res) => {
		const { count } = getAll(req.query);

		res.send({ count });
	})
	.get('/:id', (req, res) => {
		const userId = Number.parseInt(req.params.id, 10);
		try {
			const foundUser = get(userId);
			res.send(foundUser);
		} catch {
			res.status(404).send({ isSuccess: false, message: 'User not found' });
		}
	})
	.post('/', (req, res) => {
		const newUser = create(req.body);

		res.status(201).send(newUser);
	})
	.patch('/:id', (req, res) => {
		const userId = Number.parseInt(req.params.id, 10);
		try {
			const updatedUser = update(userId, req.body);
			res.send(updatedUser);
		} catch {
			res.status(404).send({ isSuccess: false, message: 'User not found' });
		}
	})
	.delete('/:id', (req, res) => {
		const userId = Number.parseInt(req.params.id, 10);
		try {
			const removedUser = remove(userId);
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
