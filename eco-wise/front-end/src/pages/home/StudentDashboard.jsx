import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Container, CircularProgress } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { useUserContext } from '../../contexts/UserContext';
import LargeCardTitle from '../../components/common/LargeCardTitle';
import { GetAllItemApi } from '../../api/item/GetAllItemApi';
import { DataGrid } from '@mui/x-data-grid'; // Import DataGrid component
import { DeleteItemApi } from '../../api/item/DeleteItemApi';
import { useAlert } from '../../contexts/AlertContext';
import { LoadingButton } from '@mui/lab';
import { GetAllItemByUserIdApi } from '../../api/item/GetAllItemByUserIdApi';

function StudentDashboardPage() {
    const {showAlert} = useAlert();
    const { user } = useUserContext();
    const [items, setItems] = useState([]); // Set initial value to an empty array
    const [loading, setLoading] = useState(true); // State for loading
    const [deleteLoading, setDeleteLoading] = useState(false); // State for delete loading
    const [selectedItems, setSelectedItems] = useState([]); // Store selected item IDs

    useEffect(() => {
        GetAllItemByUserIdApi(user.Username)
            .then((res) => {
                setItems(res);
            })
            .catch((err) => {
                if (err.response.status === 404) {
                    return
                }
                enqueueSnackbar('Failed to fetch item data', { variant: 'error' });
            })
            .finally(() => {
                setLoading(false); // Set loading to false when data fetching is done
            });
    }, []);

    const handleDelete = () => { 
        setDeleteLoading(true); // Set delete loading to true
        const reqObj = {
            itemIds: selectedItems,
        }
        console.log(reqObj);
        DeleteItemApi(reqObj)
            .then((res) => {   
                showAlert('success', 'Items deleted successfully');
                setItems(items.filter((item) => !selectedItems.includes(item.id)));
                setSelectedItems([]); // Clear selected items
             })
             .catch((err) => {
                showAlert('error', 'Failed to delete items, please try again');
             })
             .finally(() => {
                setDeleteLoading(false); // Set delete loading to false
             });
     }

    const columns = [
        {
            field: 'name',
            headerName: 'Item Name',
            width: 150,
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 400,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
        },
        {
            field: 'imageUrl',
            headerName: 'Image',
            width: 200,
            renderCell: (params) => (
                <img src={params.value} alt={params.row.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 200,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 75,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/item/editStudent/${params.row.id}`}
                >
                    Edit
                </Button>
            ),
        },
    ];

    // Prepare rows for DataGrid
    const rows = items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        status: item.status,
        imageUrl: item.imageUrl,
        createdAt: new Date(item.createdAt).toLocaleString(), // Format the date
    }));

    const handleSelectionChange = (newSelection) => {
        setSelectedItems(newSelection);
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CategoryIcon sx={{ mr: 2 }} />
                                <Typography variant="h4">My Items Dashbaord</Typography>
                            </Box>
                            <Box>
                                <LoadingButton loading={deleteLoading} disabled={selectedItems.length === 0? true: false} variant="contained" color="error" sx={{ marginRight: "10px" }} href="/" startIcon={<AddIcon />} onClick={handleDelete} LinkComponent={Link}>Delete</LoadingButton>
                                <Button variant="contained" color="primary" href="/" startIcon={<AddIcon />} LinkComponent={Link} to="/addItemStudent">Add Item</Button>
                            </Box>

                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                {loading ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <div style={{ height: 500, width: '100%' }}>
                                        <DataGrid
                                            rows={rows}
                                            columns={columns}
                                            pageSize={5}
                                            checkboxSelection // Enable checkboxes for selection
                                            onRowSelectionModelChange={handleSelectionChange} // Handle selection change
                                            selectionModel={selectedItems} // Controlled selection
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default StudentDashboardPage;
