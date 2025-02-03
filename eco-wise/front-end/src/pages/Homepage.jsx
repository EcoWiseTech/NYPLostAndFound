import React, { useState } from "react";
import { Container, Typography, Card, CardContent, CardMedia, Grid } from "@mui/material";

const items = [
  {
    id: 1,
    name: "Black Wallet",
    description: "A black leather wallet found near Block A.",
    image: "/images/wallet.jpg",
  },
  {
    id: 2,
    name: "iPhone 13",
    description: "White iPhone 13 found at the library.",
    image: "/images/iphone.jpg",
  },
  {
    id: 3,
    name: "NYP Student Card",
    description: "Student card belonging to John Doe, found in canteen.",
    image: "/images/student-card.jpg",
  },
];

function Homepage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        NYP Lost & Found
      </Typography>

      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardMedia component="img" height="140" image={item.image} alt={item.name} />
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Homepage;
