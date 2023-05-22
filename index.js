
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIO = require('socket.io');

const app = express();
const port = 3001;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


mongoose.connect('mongodb+srv://employees:employees@cluster0.rburcth.mongodb.net/dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const employeeSchema = new mongoose.Schema({
  name: String,
  salary: Number,
});

const Employee = mongoose.model('Employee', employeeSchema);


const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = socketIO(server);


app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

app.post('/employees', async (req, res) => {
  try {
    const { name, salary } = req.body;

    const newEmployee = new Employee({ name, salary });
    await newEmployee.save();

    res.status(201).json({ message: 'Space Added' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Error' });
  }
});

app.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, salary } = req.body;

    await Employee.findByIdAndUpdate(id, { name, salary });

    // Emit socket event to notify clients about the update
    io.emit('updateEmployees');

    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await Employee.findByIdAndDelete(id);

    
    io.emit('updateEmployees');

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
