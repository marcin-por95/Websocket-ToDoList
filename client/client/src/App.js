import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
    const [socket, setSocket] = useState(null); // State for the socket connection
    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState('');

    const removeTask = useCallback(
        (taskId, isLocal = true) => {
            // Remove the task from the local tasks array
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

            // Emit the 'removeTask' event to the server along with the task id
            if (socket && isLocal) {
                socket.emit('removeTask', taskId);
            }
        },
        [socket]
    );

    /* SOCKET CONNECTIO */
    useEffect(() => {
        // Initialize the socket connection once when the component mounts
        const newSocket = io('http://localhost:8000'); // Change this to your server address
        setSocket(newSocket);

        // Clean up the socket connection when the component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, []);

    /* LISTEN FOR TASKS-UPADTED EVENT*/
    useEffect(() => {
        if (socket) {
            // Listen for 'tasks-updated' event from the server and update the tasks state
            socket.on('tasks-updated', (updatedTasks) => {
                console.log('tasks-updated:', updatedTasks);
                setTasks(updatedTasks);
            });

            // Listen for 'addTask' event from the server and add the new task to tasks state
            socket.on('addTask', (newTask) => {
                console.log('addTask:', newTask);
                setTasks(prevTasks => {
                    if (!prevTasks.some(task => task.id === newTask.id)) {
                        return [...prevTasks, newTask];
                    }
                    return prevTasks;
                });
            });

            // Listen for 'removeTask' event from the server and remove the task from tasks state
            socket.on('removeTask', (taskId) => {
                console.log('removeTask:', taskId);
                removeTask(taskId, false);
            });

            // Listen for 'updateData' event from the server (optional, e.g., for a welcome message)
            socket.on('updateData', (updatedTasks) => {
                setTasks(updatedTasks);
            });
        }
    }, [socket, removeTask]);

    const submitForm = (event) => {
        event.preventDefault();

        // Generate ID via UUID
        const taskId = uuidv4();

        // Create a new task object and add it to the tasks array
        const newTask = { id: taskId, name: taskName };
        setTasks(tasks => [...tasks, newTask]);

        // Emit the 'addTask' event to the server along with the new task data
        if (socket) {
            socket.emit('addTask', newTask);
        }

        // Reset the taskName state to clear the input field
        setTaskName('');
    };

    return (
        <div className="App">
            <header>
                <h1>ToDoList.app</h1>
            </header>

            <section className="tasks-section" id="tasks-section">
                <h2>Tasks</h2>

                <ul className="tasks-section__list" id="tasks-list">
                    {tasks.map(task => (
                        <li className="task" key={task.id}>
                            {task.name} <button className="btn btn--red" onClick={() => removeTask(task.id)}>Remove</button>
                        </li>
                    ))}
                </ul>

                <form id="add-task-form" onSubmit={submitForm}>
                    <input
                        className="text-input"
                        autoComplete="off"
                        type="text"
                        placeholder="Type your description"
                        id="task-name"
                        value={taskName}
                        onChange={(event) => setTaskName(event.target.value)}
                    />
                    <button className="btn" type="submit">Add</button>
                </form>
            </section>
        </div>
    );
}

export default App;