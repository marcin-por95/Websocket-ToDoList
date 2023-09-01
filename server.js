const express = require('express');

const app = express();
const server = app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running...');
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use((req, res) => {
    res.status(404).send({ message: 'Not found...' });
});

