import React, { useEffect, useState } from "react";
import { Container, TextField, Button, Typography, Grid, Card, CardMedia, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { StoreItemApi } from "../../api/item/StoreItemApi";
import { useAlert } from "../../contexts/AlertContext";
import { LoadingButton } from "@mui/lab";
import { useNavigate, useParams } from "react-router-dom";
import { GetItemByIdApi } from "../../api/item/GetItemByIdApi";
import { UpdateItemApi } from "../../api/item/UpdateItemApi";

const validationSchema = Yup.object({
    name: Yup.string().required("Item name is required"),
    description: Yup.string().required("Description is required"),
    status: Yup.string().required("Status is required"),
});

function EditItemPage() {
    const Navigate = useNavigate();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [item, setItem] = useState(null);
    const { uuid } = useParams();

    useEffect(() => {
        GetItemByIdApi(uuid)
            .then((res) => {
                setItem(res);
            })
            .catch((err) => {
                showAlert('error', 'Failed to fetch item data');
            });

    }, [uuid]);

    const formik = useFormik({
        enableReinitialize: true,  // Ensure form is reinitialized when item data is fetched
        initialValues: {
            id: item?.id || "",
            name: item?.name || "",
            description: item?.description || "",
            image: null,
            imageUrl: item?.imageUrl || null,
            status: item?.status || "",  // Initialize status with the item's current status
        },
        validationSchema,
        onSubmit: (values) => {
            setLoading(true);
            console.log(values)
            UpdateItemApi(values)
                .then((res) => {
                    showAlert("success", "Item updated successfully");
                    Navigate("/dashboard");
                })
                .catch(err => {
                    console.error(err);
                    showAlert("error", "Failed to update item, please try again");
                })
                .finally(() => {
                    setLoading(false);
                });
        },
    });

    const handleImageUpload = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Read file as Data URL (Base64)
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1]; // Extract base64 data part
                formik.setFieldValue("image", {
                    filename: file.name,
                    mimetype: file.type,
                    data: base64String,
                });
                setPreview(URL.createObjectURL(file)); // Show preview of uploaded image
            };
        }
    };

    if (!item) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Card sx={{ padding: 2, boxShadow: 3 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Loading Item...
                    </Typography>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Card sx={{ padding: 2, boxShadow: 3 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Edit Lost & Found Item
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        label="Item Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            label="Status"
                            name="status"
                            value={formik.values.status}
                            onChange={formik.handleChange}
                            error={formik.touched.status && Boolean(formik.errors.status)}
                        >
                            <MenuItem value="claimed">clamied</MenuItem>
                            <MenuItem value="unclaimed">unclaimed</MenuItem>
                        </Select>
                    </FormControl>

                    <Button variant="contained" component="label" fullWidth sx={{ mb: 2 }}>
                        Upload Image
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </Button>

                    {formik.errors.image && (
                        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                            {formik.errors.image}
                        </Typography>
                    )}

                    {preview && (
                        <Card sx={{ mt: 2, mb: 2 }}>
                            <CardMedia component="img" height="auto" sx={{ maxHeight: "300px" }} image={preview} alt="Item Preview" />
                        </Card>
                    )}

                    {!preview && item.imageUrl && (
                        <Card sx={{ mt: 2, mb: 2 }}>
                            <CardMedia component="img" height="auto" sx={{ maxHeight: "300px" }} image={item.imageUrl} alt="Item Preview" />
                        </Card>
                    )}

                    <LoadingButton loading={loading} type="submit" variant="contained" color="primary" fullWidth>
                        Edit
                    </LoadingButton>
                </form>
            </Card>
        </Container>
    );
}

export default EditItemPage;
