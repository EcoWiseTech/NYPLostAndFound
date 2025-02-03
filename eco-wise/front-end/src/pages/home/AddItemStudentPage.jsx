import React, { useState } from "react";
import { Container, TextField, Button, Typography, Grid, Card, CardMedia, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { StoreItemApi } from "../../api/item/StoreItemApi";
import { useAlert } from "../../contexts/AlertContext";
import { LoadingButton } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";
import { Category } from "@mui/icons-material";


const validationSchema = Yup.object({
    category: Yup.string().required("Category is required"),
    name: Yup.string().required("Item name is required"),
    description: Yup.string().required("Description is required"),
    image: Yup.mixed().required("Image is required"),
});

function AddItemStudentPage() {

    const { user } = useUserContext();
    const Navigate = useNavigate();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const formik = useFormik({
        initialValues: {
            Category : "",
            userId: user.Username,
            name: "",
            description: "",
            image: null,
        },
        validationSchema,
        onSubmit: (values) => {
            setLoading(true)
            console.log("Form Submitted", values);
            StoreItemApi(values)
                .then((res) => {
                    showAlert("success", "Item added successfully");
                    Navigate("/studentDashboard");
                })
                .catch(err => {
                    console.error(err);
                    showAlert("error", "Failed to add item, please try again");
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


    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Card sx={{ padding: 2, boxShadow: 3 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Add Lost & Found Item
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

                    <FormControl sx={{ mb: 2 }} fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formik.values.category}
                            onChange={formik.handleChange}
                            name="category"
                        >
                            <MenuItem value="wallet">Wallet</MenuItem>
                            <MenuItem value="electronics">Electronics</MenuItem>
                            <MenuItem value="accessories">Accessories</MenuItem>
                            <MenuItem value="others">Others</MenuItem>
                        </Select>
                        {formik.touched.category && formik.errors.category && (
                            <Typography color="error" variant="body2">
                                {formik.errors.category}
                            </Typography>
                        )}
                    </FormControl>

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

                    <LoadingButton loading={loading} type="submit" variant="contained" color="primary" fullWidth>
                        Submit
                    </LoadingButton>
                </form>
            </Card>
        </Container>

    );
}

export default AddItemStudentPage;
