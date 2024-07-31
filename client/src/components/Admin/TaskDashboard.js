import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Grid, styled, MenuItem, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {  Select, FormControl, InputLabel } from '@mui/material';

import MiniDrawer from './AdNavbar'; // Assuming you have a navbar component



const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: 10,
    width: '100%',
    maxWidth: '1000px',
    marginLeft: 'auto',
    marginRight: 'auto',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
}));

const TaskDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sites, setSites] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newTask, setNewTask] = useState({
        customer_name: '',
        branch_name: '',
        service_name: '',
        service_type: '',
        service_description: '',
        date: '',
        remark: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
        fetchCustomers();
        fetchSites();
        fetchServices();
    }, []);

    const fetchTasks = () => {
        axios.get('http://localhost:3000/api/tasks')
            .then((response) => {
                setTasks(response.data);
                setFilteredSites(response.data); // Initialize filteredSites with all tasks
            })
            .catch((error) => {
                console.error('Error fetching tasks:', error);
            });
    };

    const fetchCustomers = () => {
        axios.get('http://localhost:3000/api/customers')
            .then((response) => {
                setCustomers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
            });
    };

    const fetchSites = () => {
        axios.get('http://localhost:3000/api/sites')
            .then((response) => {
                setSites(response.data);
            })
            .catch((error) => {
                console.error('Error fetching sites:', error);
            });
    };

    const fetchServices = () => {
        axios.get('http://localhost:3000/api/services')
            .then((response) => {
                setServices(response.data);
            })
            .catch((error) => {
                console.error('Error fetching services:', error);
            });
    };

    const handleSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        const filteredData = tasks.filter(task =>
            task.branch_name.toLowerCase().includes(keyword) ||
            task.service_name.toLowerCase().includes(keyword) ||
            task.customer_name.toLowerCase().includes(keyword) ||
            task.service_type.toLowerCase().includes(keyword) ||
            task.remark.toLowerCase().includes(keyword) ||
            task.date.toLowerCase().includes(keyword) ||
            task.service_description.toLowerCase().includes(keyword) 

        );
        setFilteredSites(filteredData);
    };

    const handleAddTask = () => {
        setOpenAddDialog(true);
    };

    const handleEditClick = (task) => {
        setSelectedTask(task);
        setOpenEditDialog(true);
    };

    const handleDeleteClick = (task) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete task ID ${task.id}?`);
        if (confirmDelete) {
            axios.delete(`http://localhost:3000/api/tasks/${task.id}`)
                .then(() => {
                    fetchTasks();
                    alert('Task deleted successfully!');
                })
                .catch((error) => {
                    console.error('Error deleting task:', error);
                    alert('Failed to delete task');
                });
        }
    };

    const handleAddDialogClose = () => {
        setOpenAddDialog(false);
        setNewTask({
            customer_name: '',
            branch_name: '',
            service_name: '',
            service_type: '',
            service_description: '',
            date: '',
            remark: '',
        });
        setError('');
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
        setSelectedTask(null);
        setError('');
    };

    const handleAddSubmit = () => {
        if (!newTask.customer_name || !newTask.branch_name || !newTask.service_name || !newTask.service_type || !newTask.service_description || !newTask.date || !newTask.remark) {
            setError('All fields are required');
            return;
        }

        axios.post('http://localhost:3000/api/tasks', newTask)
            .then(() => {
                fetchTasks();
                setOpenAddDialog(false);
                setNewTask({
                    customer_name: '',
                    branch_name: '',
                    service_name: '',
                    service_type: '',
                    service_description: '',
                    date: '',
                    remark: '',
                });
                alert('Task added successfully!');
            })
            .catch((error) => {
                console.error('Error adding task:', error);
                alert('Failed to add task');
            });
    };

    const handleEditSubmit = () => {
        if (!selectedTask.customer_name || !selectedTask.branch_name || !selectedTask.service_name || !selectedTask.service_type || !selectedTask.service_description || !selectedTask.date || !selectedTask.remark) {
            setError('All fields are required');
            return;
        }

        axios.put(`http://localhost:3000/api/tasks/${selectedTask.id}`, selectedTask)
            .then(() => {
                fetchTasks();
                setOpenEditDialog(false);
                setSelectedTask(null);
                alert('Task updated successfully!');
            })
            .catch((error) => {
                console.error('Error updating task:', error);
                alert('All Fields are require including Date*');
            });
    };

    return (
        <>
            <MiniDrawer />
            <Grid container justifyContent="left" style={{ marginLeft: '280px', marginTop: '0px' }}>
                <Button variant="contained" color="primary" onClick={handleAddTask} style={{ marginTop: 100 }}>
                    Add Task
                </Button>
            </Grid>
            <Grid item xs={12} md={10} lg={8}>
                <TextField
                    label="Search....."
                    variant="outlined"
                    size="small"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    onChange={handleSearch}
                    style={{ margin: 10, marginRight: '270px', float: 'right', marginTop: '-35px' }}
                />
            </Grid>


            <Grid container justifyContent="center">
                <StyledTableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>ID</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Customer Name</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Branch Name</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Service Name</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Service Type</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Service Description</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Date</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Remark</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSites.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.id}</TableCell>
                                    <TableCell>{task.customer_name}</TableCell>
                                    <TableCell>{task.branch_name}</TableCell>
                                    <TableCell>{task.service_name}</TableCell>
                                    <TableCell>{task.service_type}</TableCell>
                                    <TableCell>{task.service_description}</TableCell>
                                    <TableCell>{task.date}</TableCell>
                                    <TableCell>{task.remark}</TableCell>
                                    <TableCell>
    <IconButton onClick={() => handleEditClick(task)} sx={{ color: 'blue' }}>
        <EditIcon />
    </IconButton>
    <IconButton onClick={() => handleDeleteClick(task)} sx={{ color: 'red' }}>
        <DeleteIcon />
    </IconButton>
</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </StyledTableContainer>
            </Grid>

            {/* Add Task Dialog */}
            <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
                <DialogTitle>Add Task</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        label="Customer Name"
                        value={newTask.customer_name}
                        onChange={(e) => setNewTask({ ...newTask, customer_name: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    >
                        {customers.map((customer) => (
                            <MenuItem key={customer.id} value={customer.customer_name}>
                                {customer.customer_name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Branch Name"
                        value={newTask.branch_name}
                        onChange={(e) => setNewTask({ ...newTask, branch_name: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    >
                        {sites.map((site) => (
                            <MenuItem key={site.id} value={site.branch_name}>
                                {site.branch_name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Service Name"
                        value={newTask.service_name}
                        onChange={(e) => setNewTask({ ...newTask, service_name: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    >
                        {services.map((service) => (
                            <MenuItem key={service.id} value={service.service_name}>
                                {service.service_name}
                            </MenuItem>
                        ))}
                    </TextField>
    <FormControl fullWidth margin="normal" variant="outlined">
    <InputLabel id="service-type-label">Service Type</InputLabel>
    <Select
        labelId="service-type-label"
        value={newTask.service_type}
        onChange={(e) => setNewTask({ ...newTask, service_type: e.target.value })}
        label="Service Type"
    >
        <MenuItem value="AMC">AMC</MenuItem>
        <MenuItem value="On-Demand Support">On-Demand Support</MenuItem>
        <MenuItem value="New Installation">New Installation</MenuItem>
    </Select>
</FormControl>

                    <TextField
                        label="Service Description"
                        value={newTask.service_description}
                        onChange={(e) => setNewTask({ ...newTask, service_description: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Date"
                        type="date"
                        value={newTask.date}
                        onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Remark"
                        value={newTask.remark}
                        onChange={(e) => setNewTask({ ...newTask, remark: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddSubmit} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Task Dialog */}
            <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent>
    <TextField
    select
    label="Customer Name"
    value={selectedTask ? selectedTask.customer_name : ''}
    onChange={(e) => setSelectedTask({ ...selectedTask, customer_name: e.target.value })}
    fullWidth
    margin="normal"no
    variant="outlined"
>
    {customers.map((customer) => (
        <MenuItem key={customer.id} value={customer.customer_name}>
            {customer.customer_name}
        </MenuItem>
    ))}
</TextField>


    <TextField
    select
    label="Branch Name"
    value={selectedTask ? selectedTask.branch_name : ''}
    onChange={(e) => setSelectedTask({ ...selectedTask, branch_name: e.target.value })}
    fullWidth
    margin="normal"
    variant="outlined"
>
    {sites.map((site) => (
        <MenuItem key={site.id} value={site.branch_name}>
            {site.branch_name}
        </MenuItem>
    ))}
</TextField>


<TextField
    select
    label="Service Name"
    value={selectedTask ? selectedTask.service_name : ''}
    onChange={(e) => setSelectedTask({ ...selectedTask, service_name: e.target.value })}
    fullWidth
    margin="normal"
    variant="outlined"
>
    {services.map((service) => (
        <MenuItem key={service.id} value={service.service_name}>
            {service.service_name}
        </MenuItem>
    ))}
</TextField>

                    <TextField
                        label="Service Type"
                        value={selectedTask ? selectedTask.service_type : ''}
                        onChange={(e) => setSelectedTask({ ...selectedTask, service_type: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Service Description"
                        value={selectedTask ? selectedTask.service_description : ''}
                        onChange={(e) => setSelectedTask({ ...selectedTask, service_description: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Date"
                        type="date"
                        value={selectedTask ? selectedTask.date : ''}
                        onChange={(e) => setSelectedTask({ ...selectedTask, date: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Remark"
                        value={selectedTask ? selectedTask.remark : ''}
                        onChange={(e) => setSelectedTask({ ...selectedTask, remark: e.target.value })}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditSubmit} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </> 
    );
};

export default TaskDashboard;
