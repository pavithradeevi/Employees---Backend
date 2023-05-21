const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIO = require('socket.io');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://employees:employees@cluster0.rburcth.mongodb.net/dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const employeeSchema = new mongoose.Schema({
  name: String,
  salary: Number,
});

const Employee = mongoose.model('Employee', employeeSchema);

// Socket.io setup
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = socketIO(server);

// Routes
app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { salary } = req.body;

    await Employee.findByIdAndUpdate(id, { salary });

    // Emit socket event to notify clients about the update
    io.emit('updateEmployees');

    res.status(200).json({ message: 'Salary updated successfully' });
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
