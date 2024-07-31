    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import {
        Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
        IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
        TextField, Grid, InputAdornment, styled,
    } from '@mui/material';
    import EditIcon from '@mui/icons-material/Edit';
    import DeleteIcon from '@mui/icons-material/Delete';
    import SearchIcon from '@mui/icons-material/Search';
    import AddIcon from '@mui/icons-material/Add';
    import RemoveIcon from '@mui/icons-material/Remove';
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

    const CustomerPage = () => {
        const [customers, setCustomers] = useState([]);
        const [filteredCustomers, setFilteredCustomers] = useState([]);
        const [openAddDialog, setOpenAddDialog] = useState(false);
        const [openEditDialog, setOpenEditDialog] = useState(false);
        const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
        const [selectedCustomer, setSelectedCustomer] = useState(null);
        const [newCustomer, setNewCustomer] = useState({
            customer_name: '',
            customer_address: '',
            gst_no: '',
            contacts: [{ name: '', number: '', email: '' }],
        });
        const [error, setError] = useState('');

        useEffect(() => {
            fetchCustomers();
        }, []);

        useEffect(() => {
            setFilteredCustomers(customers);
        }, [customers]);

        const fetchCustomers = () => {
            axios.get('http://localhost:3000/api/customers')
                .then((response) => {
                    setCustomers(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching customers:', error);
                });
        };

        const handleDeleteClick = (customer) => {
            setSelectedCustomer(customer);
            setOpenDeleteDialog(true);
        };

        const handleDeleteConfirm = () => {
            if (!selectedCustomer) return;
        
            axios.delete(`http://localhost:3000/api/customers/${selectedCustomer.id}`)
                .then(() => {
                    fetchCustomers();
                    setOpenDeleteDialog(false);
                    setSelectedCustomer(null);
                    alert('Customer deleted successfully!');
                })
                .catch((error) => {
                    console.error('Error deleting customer:', error);
                    alert('Failed to delete customer');
                });
        };

        
    const handleEditClick = (customer) => {
        setSelectedCustomer(customer);
        setOpenEditDialog(true);
    };

        const handleEditDialogClose = () => {
            setOpenEditDialog(false);
            setSelectedCustomer(null);
        };

        const handleEditSubmit = () => {
            if (!selectedCustomer || !selectedCustomer.customer_name || !selectedCustomer.customer_address || !selectedCustomer.gst_no) {
                setError('All fields are required');
                return;
            }
        
            axios.put(`http://localhost:3000/api/customers/${selectedCustomer.id}`, selectedCustomer)
                .then(() => {
                    fetchCustomers();
                    setOpenEditDialog(false);
                    setSelectedCustomer(null);
                    setError('');
                    alert('Customer updated successfully!');
                })
                .catch((error) => {
                    console.error('Error updating customer:', error);
                    alert('Failed to update customer');
                });
        };

        const handleAddCustomer = () => {
            setOpenAddDialog(true);
        };

        const handleAddDialogClose = () => {
            setOpenAddDialog(false);
            setNewCustomer({
                customer_name: '',
                customer_address: '',
                gst_no: '',
                contacts: [{ name: '', number: '', email: '' }],
            });
            setError('');
        };

        const handleAddSubmit = () => {
            if (!newCustomer.customer_name || !newCustomer.customer_address || !newCustomer.gst_no) {
                setError('All fields are required');
                return;
            }

            axios.post('http://localhost:3000/api/customers', newCustomer)
                .then(() => {
                    fetchCustomers();
                    setOpenAddDialog(false);
                    setNewCustomer({
                        customer_name: '',
                        customer_address: '',
                        gst_no: '',
                        contacts: [{ name: '', number: '', email: '' }],
                    });
                    alert('Customer added successfully!');
                })
                .catch((error) => {
                    console.error('Error adding customer:', error);
                    alert('Failed to add customer');
                });
        };

        const handleSearch = (event) => {
            const keyword = event.target.value.toLowerCase();
            const filteredData = customers.filter(customer =>
                customer.customer_name.toLowerCase().includes(keyword) ||
                customer.customer_address.toLowerCase().includes(keyword) ||
                customer.gst_no.toLowerCase().includes(keyword) ||
                customer.contacts.some(contact =>
                    contact.name.toLowerCase().includes(keyword) ||
                    contact.number.toLowerCase().includes(keyword) ||
                    contact.email.toLowerCase().includes(keyword) 
                )
    
            );
            setFilteredCustomers(filteredData);
        };

        const handleAddContact = () => {
            const updatedContacts = [...newCustomer.contacts, { name: '', number: '', email: '' }];
            setNewCustomer({ ...newCustomer, contacts: updatedContacts });
        };

        const handleRemoveContact = (index) => {
            const updatedContacts = newCustomer.contacts.filter((_, idx) => idx !== index);
            setNewCustomer({ ...newCustomer, contacts: updatedContacts });
        };

        return (
            <>
                <MiniDrawer />
                <Grid container justifyContent="left" style={{ marginLeft: '280px', marginTop: '0px' }}>
                    <Button variant="contained" color="primary" onClick={handleAddCustomer} style={{ marginTop: 100 }}>
                        Add Customer
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
                                    <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Customer Address</StyledTableCell>
                                    <StyledTableCell style={{ backgroundColor: 'lightblue' }}>GST No.</StyledTableCell>
                                    <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Contacts</StyledTableCell>
                                    <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.id}</TableCell>
                                        <TableCell>{customer.customer_name}</TableCell>
                                        <TableCell>{customer.customer_address}</TableCell>
                                        <TableCell>{customer.gst_no}</TableCell>
                                        <TableCell>
                                            {customer.contacts.map((contact, index) => (
                                                <div key={index}>
                                                    {`${contact.name} - ${contact.number} - ${contact.email}`}
                                                </div>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                <IconButton onClick={() => handleEditClick(customer)} sx={{ color: 'blue' }}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteClick(customer)} sx={{ color: 'red' }}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>    
                                </TableRow>
                                        ))}
                                    </TableBody>
                                                </Table>
                                            </StyledTableContainer>
                                        </Grid>
                            
                                        {/* Add Customer Dialog */}
                                        <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Customer Name"
                            type="text"
                            fullWidth
                            value={newCustomer.customer_name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, customer_name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Customer Address"
                            type="text"
                            fullWidth
                            value={newCustomer.customer_address}
                            onChange={(e) => setNewCustomer({ ...newCustomer, customer_address: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="GST No."
                            type="text"
                            fullWidth
                            value={newCustomer.gst_no}
                            onChange={(e) => setNewCustomer({ ...newCustomer, gst_no: e.target.value })}
                        />
                        {newCustomer.contacts.map((contact, index) => (
                            <div key={index}>
                                <TextField
                                    margin="dense"
                                    label="Contact Name"
                                    type="text"
                                    fullWidth
                                    value={contact.name}
                                    onChange={(e) => {
                                        const updatedContacts = [...newCustomer.contacts];
                                        updatedContacts[index].name = e.target.value;
                                        setNewCustomer({ ...newCustomer, contacts: updatedContacts });
                                    }}
                                />
                                <TextField
                                    margin="dense"
                                    label="Conatct No."
                                    type="text"
                                    fullWidth
                                    value={contact.number}
                                    onChange={(e) => {
                                        const updatedContacts = [...newCustomer.contacts];
                                        updatedContacts[index].number = e.target.value;
                                        setNewCustomer({ ...newCustomer, contacts: updatedContacts });
                                    }}
                                />
                                <TextField
                                    margin="dense"
                                    label="Email ID"
                                    type="email"
                                    fullWidth
                                    value={contact.email}
                                    onChange={(e) => {
                                        const updatedContacts = [...newCustomer.contacts];
                                        updatedContacts[index].email = e.target.value;
                                        setNewCustomer({ ...newCustomer, contacts: updatedContacts });
                                    }}
                                />
                                <Button onClick={() => handleRemoveContact(index)} color="secondary" startIcon={<RemoveIcon />}>
                                    Remove Contact
                                </Button>
                            </div>
                        ))}
                        <Button onClick={handleAddContact} color="primary" startIcon={<AddIcon />}>
                            Add Contact
                        </Button>
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

                {/* Edit Customer Dialog */}
                <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Customer Name"
                            type="text"
                            fullWidth
                            value={selectedCustomer?.customer_name || ''}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customer_name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Customer Address"
                            type="text"
                            fullWidth
                            value={selectedCustomer?.customer_address || ''}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customer_address: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="GST No."
                            type="text"
                            fullWidth
                            value={selectedCustomer?.gst_no || ''}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, gst_no: e.target.value })}
                        />
                        {selectedCustomer?.contacts.map((contact, index) => (
                            <div key={index}>
                                <TextField
                                    margin="dense"
                                    label="Contact Name"
                                    type="text"
                                    fullWidth
                                    value={contact.name}
                                    onChange={(e) => {
                                        const updatedContacts = [...selectedCustomer.contacts];
                                        updatedContacts[index].name = e.target.value;
                                        setSelectedCustomer({ ...selectedCustomer, contacts: updatedContacts });
                                    }}
                                />
                                <TextField
                                    margin="dense"
                                    label="Contact Number"
                                    type="text"
                                    fullWidth
                                    value={contact.number}
                                    onChange={(e) => {
                                        const updatedContacts = [...selectedCustomer.contacts];
                                        updatedContacts[index].number = e.target.value;
                                        setSelectedCustomer({ ...selectedCustomer, contacts: updatedContacts });
                                    }}
                                />
                                <TextField
                                    margin="dense"
                                    label="Contact Email"
                                    type="email"
                                    fullWidth
                                    value={contact.email}
                                    onChange={(e) => {
                                        const updatedContacts = [...selectedCustomer.contacts];
                                        updatedContacts[index].email = e.target.value;
                                        setSelectedCustomer({ ...selectedCustomer, contacts: updatedContacts });
                                    }}
                                />
                            </div>
                        ))}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
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

                {/* Delete Customer Dialog */}
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this customer?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="secondary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

    export default CustomerPage;
