const express = require('express');
const path = require('path');
const app = express();
const socket = require('socket.io');
const server = app.listen(process.env.PORT || 8000, () => {
    console.log('Server is running...');
});
const io = socket(server);

const tasks = [];

io.on('connection', (socket) => {
    // Send the current tasks list to the newly connected user
    socket.emit('updateData', tasks);

    // Listen for the 'addTask' event from the client
    socket.on('addTask', (task) => {
        tasks.push(task); // Add the new task to the tasks array
        io.emit('addTask', task); // Emit the 'addTask' event to all clients
    });

    // Listen for the 'removeTask' event from the client
    socket.on('removeTask', (taskId) => {
        // Remove the task with the matching id from the tasks array
        const removedTaskIndex = tasks.findIndex(task => task.id === taskId);
        if (removedTaskIndex !== -1) {
            const removedTask = tasks.splice(removedTaskIndex, 1)[0];
            io.emit('removeTask', taskId); // Emit the 'removeTask' event to all clients
        }
    });
    socket.on('editTask', (editedTask) => {
        const existingTaskIndex = tasks.findIndex(task => task.id === editedTask.id);
        if (existingTaskIndex !== -1) {
            tasks[existingTaskIndex] = editedTask;
            io.emit('tasks-updated', tasks);
        }
    });
});

app.use((req, res) => {
    res.status(404).send({ message: 'Not found...' });
});