import React, { useEffect, useState } from "react";
import { Container, Typography, Card, CardContent, CardMedia, Grid, Box, Pagination, TextField } from "@mui/material";
import { GetAllItemApi } from "../api/item/GetAllItemApi";

function Homepage() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Items per page
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query

  useEffect(() => {
    document.title = "NYP Lost & Found";
    GetAllItemApi()
      .then((res) => {
        console.log(res);
        setItems(res); // Assuming the API directly returns all items
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Function to filter items based on search query
  const filterItems = () => {
    return items.filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm)
      );
    });
  };

  // Paginate the filtered items based on the current page
  const paginateItems = () => {
    const filteredItems = filterItems();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); // Update search query state
    setCurrentPage(1); // Reset to the first page when search query changes
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        NYP Lost & Found
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <TextField
          label="Search Items"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
        />
      </Box>

      <Grid container spacing={3}>
        {paginateItems().map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 5, overflow: "hidden", height: "100%" }}>
              <CardMedia
                component="img"
                height="200"
                image={item.imageUrl}
                alt={item.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ padding: 2 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Status: {item.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={Math.ceil(filterItems().length / itemsPerPage)} // Calculate total pages based on filtered items
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
}

export default Homepage;
