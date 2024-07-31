import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Grid, InputAdornment, styled, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RemoveIcon from '@mui/icons-material/Remove'; // Import RemoveIcon

import MiniDrawer from './AdNavbar'; // Assuming you have a navbar component

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    // Define your styling for IconButton here if needed
}));

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

const SitesPage = () => {
    const [sites, setSites] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [newSite, setNewSite] = useState({
        customer_name: '',
        branch_name: '',
        branch_address: '',
        contacts: [{ name: '', number: '', email: '' }],
    });
    const [error, setError] = useState('');
    const [customers, setCustomers] = useState([]); // State variable for customer names

    useEffect(() => {
        fetchSites();
    }, []);

    useEffect(() => {
        setFilteredSites(sites);
    }, [sites]);

    const fetchSites = () => {
        axios.get('http://localhost:3000/api/sites')
            .then((response) => {
                setSites(response.data);
            })
            .catch((error) => {
                console.error('Error fetching sites:', error);
            });
    };

    const fetchCustomers = () => {
        axios.get('http://localhost:3000/api/customers') // Adjust the endpoint as necessary
            .then((response) => {
                setCustomers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
            });
    };

    const handleDeleteClick = (site) => {
        setSelectedSite(site);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:3000/api/sites/${selectedSite.id}`)
            .then(() => {
                fetchSites();
                setOpenDeleteDialog(false);
                setSelectedSite(null);
            })
            .catch((error) => {
                console.error('Error deleting site:', error);
            });
    };

    const handleEditClick = (site) => {
        setSelectedSite(site);
        setOpenEditDialog(true);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
        setSelectedSite(null);
    };

    const handleEditSubmit = () => {
        if (!selectedSite || !selectedSite.branch_name || !selectedSite.branch_address || !selectedSite.contacts.every(contact => contact.name && contact.number && contact.email)) {
            setError('All fields are required');
            return;
        }

        axios.put(`http://localhost:3000/api/sites/${selectedSite.id}`, selectedSite)
            .then(() => {
                fetchSites();
                setOpenEditDialog(false);
                setSelectedSite(null);
                setError('');
                alert('Site updated successfully!');
            })
            .catch((error) => {
                console.error('Error updating site:', error);
                alert('Failed to update site');
            });
    };

    const handleAddSite = () => {
        setOpenAddDialog(true);
        fetchCustomers(); // Fetch customer names when opening the add dialog
    };

    const handleAddDialogClose = () => {
        setOpenAddDialog(false);
        setNewSite({
            customer_name: '',
            branch_name: '',
            branch_address: '',
            contacts: [{ name: '', number: '', email: '' }],
        });
        setError('');
    };

    const handleAddSubmit = () => {
        if (!newSite.customer_name || !newSite.branch_name || !newSite.branch_address || !newSite.contacts.every(contact => contact.name && contact.number && contact.email)) {
            setError('All fields are required');
            return;
        }

        axios.post('http://localhost:3000/api/sites', newSite)
            .then(() => {
                fetchSites();
                setOpenAddDialog(false);
                setNewSite({
                    customer_name: '',
                    branch_name: '',
                    branch_address: '',
                    contacts: [{ name: '', number: '', email: '' }],
                });
                alert('Site added successfully!');
            })
            .catch((error) => {
                console.error('Error adding site:', error);
                alert('Failed to add site');
            });
    };

    const handleSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        const filteredData = sites.filter(site =>
            site.branch_name.toLowerCase().includes(keyword) ||
            site.branch_address.toLowerCase().includes(keyword) ||
            site.customer_name.toLowerCase().includes(keyword)||
            site.contacts.some(contact =>
                contact.name.toLowerCase().includes(keyword) ||
                contact.number.toLowerCase().includes(keyword) ||
                contact.email.toLowerCase().includes(keyword) 
            )
        );
        setFilteredSites(filteredData);
    };

    const handleAddContact = () => {
        if (openAddDialog) {
            setNewSite((prevState) => ({
                ...prevState,
                contacts: [...prevState.contacts, { name: '', number: '', email: '' }],
            }));
        } else if (openEditDialog && selectedSite) {
            setSelectedSite((prevState) => ({
                ...prevState,
                contacts: [...prevState.contacts, { name: '', number: '', email: '' }],
            }));
        }
    };

    const handleRemoveContact = (index) => {
        if (openAddDialog) {
            setNewSite((prevState) => {
                const updatedContacts = [...prevState.contacts];
                updatedContacts.splice(index, 1);
                return { ...prevState, contacts: updatedContacts };
            });
        } else if (openEditDialog && selectedSite) {
            setSelectedSite((prevState) => {
                const updatedContacts = [...prevState.contacts];
                updatedContacts.splice(index, 1);
                return { ...prevState, contacts: updatedContacts };
            });
        }
    };

    return (
        <>
            <MiniDrawer />
            <Grid container justifyContent="left" style={{ marginLeft: '280px', marginTop: '0px' }}>
                <Button variant="contained" color="primary" onClick={handleAddSite} style={{ marginTop: 100 }}>
                    Add Site
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
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Branch / Site Name</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Branch / Site Address</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Contacts</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSites.map((site) => (
                                <TableRow key={site.id}>
                                    <TableCell>{site.id}</TableCell>
                                    <TableCell>{site.customer_name}</TableCell>
                                    <TableCell>{site.branch_name}</TableCell>
                                    <TableCell>{site.branch_address}</TableCell>
                                    <TableCell>
                                        {site.contacts.map((contact, index) => (
                                            <div key={index}>
                                                {contact.name} - {contact.number} - {contact.email}
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>
    <IconButton onClick={() => handleEditClick(site)} sx={{ color: 'blue' }}>
        <EditIcon />
    </IconButton>
    <IconButton onClick={() => handleDeleteClick(site)} sx={{ color: 'red' }}>
        <DeleteIcon />
    </IconButton>
</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </Grid>
            <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
                <DialogTitle>Add Site</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        label="Customer Name"
                        value={newSite.customer_name}
                        onChange={(e) => setNewSite({ ...newSite, customer_name: e.target.value })}
                        fullWidth
                        margin="dense"
                    >
                        {customers.map((customer) => (
                            <MenuItem key={customer.id} value={customer.customer_name}>
                                {customer.customer_name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Branch Name"
                        value={newSite.branch_name}
                        onChange={(e) => setNewSite({ ...newSite, branch_name: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Branch Address"
                        value={newSite.branch_address}
                        onChange={(e) => setNewSite({ ...newSite, branch_address: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    {newSite.contacts.map((contact, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label="Contact Name"
                                value={contact.name}
                                onChange={(e) => {
                                    const newContacts = [...newSite.contacts];
                                    newContacts[index].name = e.target.value;
                                    setNewSite({ ...newSite, contacts: newContacts });
                                }}
                                fullWidth
                                margin="dense"
                            />
                            <TextField
                                label="Contact Number"
                                value={contact.number}
                                onChange={(e) => {
                                    const newContacts = [...newSite.contacts];
                                    newContacts[index].number = e.target.value;
                                    setNewSite({ ...newSite, contacts: newContacts });
                                }}
                                fullWidth
                                margin="dense"
                            />
                            <TextField
                                label="Contact Email"
                                value={contact.email}
                                onChange={(e) => {
                                    const newContacts = [...newSite.contacts];
                                    newContacts[index].email = e.target.value;
                                    setNewSite({ ...newSite, contacts: newContacts });
                                }}
                                fullWidth
                                margin="dense"
                            />
                            <StyledIconButton onClick={() => handleRemoveContact(index)}>
                                <RemoveIcon />
                            </StyledIconButton>
                        </div>
                    ))}
                    <Button variant="outlined" color="primary" onClick={handleAddContact}>
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
            <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
                <DialogTitle>Edit Site</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Customer Name"
                        value={selectedSite ? selectedSite.customer_name : ''}
                        onChange={(e) => setSelectedSite({ ...selectedSite, customer_name: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Branch Name"
                        value={selectedSite ? selectedSite.branch_name : ''}
                        onChange={(e) => setSelectedSite({ ...selectedSite, branch_name: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        label="Branch Address"
                        value={selectedSite ? selectedSite.branch_address : ''}
                        onChange={(e) => setSelectedSite({ ...selectedSite, branch_address: e.target.value })}
                        fullWidth
                        margin="dense"
                    />
                    {selectedSite && selectedSite.contacts.map((contact, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label="Contact Name"
                                value={contact.name}
                                onChange={(e) => {
                                    const newContacts = [...selectedSite.contacts];
                                    newContacts[index].name = e.target.value;
                                    setSelectedSite({ ...selectedSite, contacts: newContacts });
                                }}
                                fullWidth
                                margin="dense"
                            />
                            <TextField
                                label="Contact Number"
                                value={contact.number}
                                onChange={(e) => {
                                    const newContacts = [...selectedSite.contacts];
                                    newContacts[index].number = e.target.value;
                                    setSelectedSite({ ...selectedSite, contacts: newContacts });
                                }}
                                fullWidth
                                margin="dense"
                            />
                            <TextField
                                label="Contact Email"
                                value={contact.email}
                                onChange={(e) => {
                                    const newContacts = [...selectedSite.contacts];
                                    newContacts[index].email = e.target.value;
                                    setSelectedSite({ ...selectedSite, contacts: newContacts });
                                }}
                                fullWidth
                                margin="dense"
                            />
                            <StyledIconButton onClick={() => handleRemoveContact(index)}>
                                <RemoveIcon />
                            </StyledIconButton>
                        </div>
                    ))}
                    <Button variant="outlined" color="primary" onClick={handleAddContact}>
                        Add Contact
                    </Button>
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
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Site</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this site?</p>
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
        </>
    );
};

export default SitesPage;
