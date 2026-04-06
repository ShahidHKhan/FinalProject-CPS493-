import express from 'express';
import stretchesController from './controller/stretches';
import usersController from './controller/users';

const PORT = 3000;
const SERVER = 'localhost';

const app = express();

// Parse JSON bodies
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/api/v1/users', usersController);
app.use('/api/v1/stretches', stretchesController);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get("/suny", (req, res) => {
    res.send("Welcome to SUNY!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://${SERVER}:${PORT}`);
});
