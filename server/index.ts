import express from 'express';

const PORT = process.env.PORT || 3000
const SERVER = 'localhost'

const app = express();

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get("/suny", (req, res) => {
    res.send("Welcome to SUNY!");
});

// API endpoint that returns JSON data
app.get('/api/message', (req, res) => {
    res.json({
        message: 'Hello from the backend!',
        timestamp: new Date().toISOString(),
        data: {
            course: 'CPS493',
            project: 'Final Project'
        }
    });
});

// API endpoint with sample data array
app.get('/api/items', (req, res) => {
    res.json([
        { id: 1, name: 'Item One', description: 'First item' },
        { id: 2, name: 'Item Two', description: 'Second item' },
        { id: 3, name: 'Item Three', description: 'Third item' }
    ]);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://${SERVER}:${PORT}`);
});
