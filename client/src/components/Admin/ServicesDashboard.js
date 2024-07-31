import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Grid, InputAdornment, 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/system';
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

const ServicesDashboard = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [newService, setNewService] = useState({
        service_id: '',
        service_name: '',
        description: '',
    });
    const [addServiceError, setAddServiceError] = useState('');
    const [editServiceError, setEditServiceError] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        setFilteredServices(services);
    }, [services]);

    const fetchServices = () => {
        axios.get('http://localhost:3000/api/services')
            .then((response) => {
                setServices(response.data);
            })
            .catch((error) => {
                console.error('Error fetching services:', error);
            });
    };

    const handleDeleteClick = (service) => {
        setSelectedService(service);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:3000/api/services/${selectedService.id}`)
            .then(() => {
                fetchServices();
                setOpenDeleteDialog(false);
                setSelectedService(null);
            })
            .catch((error) => {
                console.error('Error deleting service:', error);
            });
    };

    const handleEditClick = (service) => {
        setSelectedService(service);
        setOpenEditDialog(true);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
        setSelectedService(null);
        setEditServiceError('');
    };

    const handleEditSubmit = () => {
        if (!selectedService.service_name || !selectedService.description) {
            setEditServiceError('All fields are required');
            return;
        }
    
        axios.put(`http://localhost:3000/api/services/${selectedService.id}`, selectedService)
            .then(response => {
                fetchServices();  // Refresh services data after update
                setOpenEditDialog(false);  // Close edit dialog
                setSelectedService(null);  // Clear selected service
            })
            .catch(error => {
                console.error('Error updating service:', error);  // Log detailed error message
                alert('Failed to update service. Please try again.'); // Display user-friendly error message
            });
    };
    
    
    const StyledIconButton = styled(IconButton)(({ color }) => ({
        color: color,
        '&:hover': {
            color: '#fff',
            backgroundColor: color,
        },
    }));

    const handleAddService = () => {
        // Generate next service_id dynamically
        const nextServiceId = generateNextServiceId(services);
        setNewService({
            ...newService,
            service_id: nextServiceId,
        });
        setOpenAddDialog(true);
    };

    const generateNextServiceId = (services) => {
        // Check if services is undefined or empty
        if (!services || services.length === 0) {
            return 'ENPL-SR-01'; // Default value if no services exist
        }
    
        // Extract the numeric part of service_id and find the maximum
        const maxId = services.reduce((max, service) => {
            if (service.service_id && service.service_id.startsWith('ENPL-SR-')) {
                const serviceIdNumber = parseInt(service.service_id.slice(8)); // Adjust slice to capture the numeric part after 'ENPL-SR-'
                return serviceIdNumber > max ? serviceIdNumber : max;
            }
            return max;
        }, 0);
    
        // Generate next service_id with padding (e.g., 01, 02, ...)
        const nextId = (maxId + 1).toString().padStart(2, '0');
        return `ENPL-SR-${nextId}`;
    };
    

    const handleAddDialogClose = () => {
        setOpenAddDialog(false);
        setNewService({
            service_id: '',
            service_name: '',
            description: '',
        });
        setAddServiceError('');
    };

    const handleAddSubmit = () => {
        if (!newService.service_id || !newService.service_name || !newService.description) {
            setAddServiceError('All fields are required');
            return;
        }

        axios.post('http://localhost:3000/api/services', newService)
            .then(() => {
                fetchServices();
                setOpenAddDialog(false);
                setNewService({
                    service_id: '',
                    service_name: '',
                    description: '',
                });
                setAddServiceError('');
                alert('Service added successfully!'); // Unique message after adding service
            })
            .catch((error) => {
                console.error('Error adding service:', error);
            });
    };

    const handleSearch = (event) => {
        const keyword = event.target.value.toLowerCase();
        const filteredData = services.filter(service =>
            service.service_id.toLowerCase().includes(keyword) ||
            service.service_name.toLowerCase().includes(keyword) ||
            service.description.toLowerCase().includes(keyword)
        );
        setFilteredServices(filteredData);
    };

    return (
        <>
            <MiniDrawer />
            <Grid container justifyContent="left" style={{ marginLeft: '280px', marginTop: '0px' }}>
                <Button variant="contained" color="primary" onClick={handleAddService} style={{ marginTop: 100 }}>
                    Add Service
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
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Service ID</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Service Name</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Description</StyledTableCell>
                                <StyledTableCell style={{ backgroundColor: 'lightblue' }}>Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredServices.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell>{service.id}</TableCell>
                                    <TableCell>{service.service_id}</TableCell>
                                    <TableCell>{service.service_name}</TableCell>
                                    <TableCell>{service.description}</TableCell>
                                    <TableCell>
                                        <StyledIconButton color="blue" onClick={() => handleEditClick(service)}>
                                            <EditIcon />
                                        </StyledIconButton>
                                        <StyledIconButton color="red" onClick={() => handleDeleteClick(service)}>
                                            <DeleteIcon />
                                        </StyledIconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </Grid>

            {/* Add Service Dialog */}
            <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
                <DialogTitle>Add Service</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Service ID"
                        type="text"
                        fullWidth
                        value={newService.service_id}
                        disabled
                    />
                    <TextField
                        margin="dense"
                        label="Service Name"
                        type="text"
                        fullWidth
                        value={newService.service_name}
                        onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    />
                    {addServiceError && <p style={{ color: 'red' }}>{addServiceError}</p>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddSubmit} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Service Dialog */}
            <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
                <DialogTitle>Edit Service</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Service Name"
                        type="text"
                        fullWidth
                        value={selectedService ? selectedService.service_name : ''}
                        onChange={(e) => setSelectedService({ ...selectedService, service_name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        value={selectedService ? selectedService.description : ''}
                        onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                    />
                    {editServiceError && <p style={{ color: 'red' }}>{editServiceError}</p>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditSubmit} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Service Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Service</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this service?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
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

export default ServicesDashboard;

