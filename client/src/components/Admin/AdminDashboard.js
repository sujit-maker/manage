import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table, MenuItem, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';
import MiniDrawer from './AdNavbar';
import SearchIcon from '@mui/icons-material/Search';
import './Ad.css'

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

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        usertype: 'Admin', 
    });

    const [addUserError, setAddUserError] = useState('');

    

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    const fetchUsers = () => {
        axios.get('http://localhost:3000/api/users')
            .then((response) => {
                // Filter out admin users from the response
                const filteredUsers = response.data.filter(user => user.usertype !== 'Admin');
                setUsers(filteredUsers);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                // Handle error state or display an error message to the user
            });
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:3000/api/users/${selectedUser.id}`)
            .then(() => {
                fetchUsers();
                setOpenDeleteDialog(false);
                setSelectedUser(null);
            })
            .catch((error) => {
                console.error('Error deleting user:', error);
            });
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setOpenEditDialog(true);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
        setSelectedUser(null);
    };

    const handleEditSubmit = () => {
        const updatedUser = {
            username: selectedUser.username,
            usertype: selectedUser.usertype,
        };

        if (selectedUser.password) {
            updatedUser.password = selectedUser.password;
        }

        axios.put(`http://localhost:3000/api/users/${selectedUser.id}`, updatedUser)
            .then(() => {
                fetchUsers();
                setOpenEditDialog(false);
                setSelectedUser(null);
            })
            .catch((error) => {
                console.error('Error updating user:', error);
            });
    };

    const StyledIconButton = styled(IconButton)(({ color }) => ({
        color: color,
        '&:hover': {
            color: '#fff',
            backgroundColor: color,
        },
    }));

    const handleAddUser = () => {
        setOpenAddDialog(true);
    };

    const handleAddDialogClose = () => {
        setOpenAddDialog(false);
        setNewUser({
            username: '',
            password: '',
            usertype: 'Admin', // Reset to default after close
        });
        setAddUserError('');
    };

    const handleAddSubmit = () => {
        if (!newUser.username || !newUser.password || !newUser.usertype) {
            setAddUserError('All fields are required');
            return;
        }

        axios.post('http://localhost:3000/api/users', newUser)
            .then(() => {
                fetchUsers();
                setOpenAddDialog(false);
                setNewUser({
                    username: '',
                    password: '',
                    usertype: 'Admin', // Reset to default after submit
                });
                setAddUserError('');
                alert('User added successfully!'); // Unique message after adding user
            })
            .catch((error) => {
                console.error('Error adding user:', error);
            });
    };

    const handleSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        const filteredData = users.filter(user =>
            user.username.toLowerCase().includes(keyword) ||
            user.usertype.toLowerCase().includes(keyword)
        );
        setFilteredUsers(filteredData);
    };

    return (
        <>
            <MiniDrawer />

            <Grid container justifyContent="left" style={{marginLeft:'280px', marginTop:'0px'}}>
                        <Button variant="contained" color="primary" onClick={handleAddUser} style={{ marginTop: 100 }}>
                            Add User
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
                        style={{ margin: 10, marginRight: '270px', float: 'right', marginTop:'-35px' }}
                    />
                

            <Grid container justifyContent="center">
                    <StyledTableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>ID</StyledTableCell>
                                    <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Username</StyledTableCell>
                                    <StyledTableCell style={{ backgroundColor: 'lightblue' }}>User Type</StyledTableCell>
                                    <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.usertype}</TableCell>
                                        <TableCell>
                                            <StyledIconButton
                                                aria-label="edit"
                                                color="purple"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                <EditIcon />
                                            </StyledIconButton>
                                            <StyledIconButton
                                                aria-label="delete"
                                                color="red"
                                                onClick={() => handleDeleteClick(user)}
                                            >
                                                <DeleteIcon />
                                            </StyledIconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>

                    {/* Add User Dialog */}
                    <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Username"
                                fullWidth
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            />
                            <TextField
                                margin="dense"
                                label="Password"
                                type="password"
                                fullWidth
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                            <TextField
                                margin="dense"
                                label="User Type"
                                select
                                fullWidth
                                value={newUser.usertype}
                                onChange={(e) => setNewUser({ ...newUser, usertype: e.target.value })}
                                error={addUserError !== ''}
                                helperText={addUserError}
                            >
                                {['Admin', 'Sales', 'Manager', 'Engineer'].map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
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

                    {/* Edit User Dialog */}
                    {selectedUser && (
                        <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogContent>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Username"
                                    fullWidth
                                    value={selectedUser.username}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, username: e.target.value })
                                    }
                                />
                                <TextField
                                    margin="dense"
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={selectedUser.password || ''}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, password: e.target.value })
                                    }
                                />
                                <TextField
                                    margin="dense"
                                    label="User Type"
                                    select
                                    fullWidth
                                    value={selectedUser.usertype}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, usertype: e.target.value })
                                    }
                                >
                                    {['Admin', 'Sales', 'Manager', 'Engineer'].map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleEditDialogClose} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={handleEditSubmit} color="primary">
                                    Save
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}

                    {/* Delete User Dialog */}
                    <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogContent>
                            <p>Are you sure you want to delete {selectedUser && selectedUser.username}?</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteConfirm} color="primary">
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </Grid>
        </>
    );
};

export default AdminDashboard;
