import React, { useState } from 'react';
import { Container, Typography, Button, CircularProgress, Alert, Box, Card, CardMedia, CardContent, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const FindItemPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Function to convert image file to base64 string
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]); // Get base64 string
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle the image upload and send it to Lambda for comparison
  const handleImageUpload = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setMatchResults(null);

    try {
      // Convert the image to base64 string
      const base64Image = await convertToBase64(imageFile);

      // Call Lambda function via API Gateway with base64 image
      const rekognitionResponse = await invokeRekognitionLambda(base64Image);
      
      setMatchResults(rekognitionResponse);
    } catch (err) {
      setError('An error occurred while processing the image.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to invoke the Rekognition Lambda via API Gateway
  const invokeRekognitionLambda = async (base64Image) => {
    const apiEndpoint = 'https://akykd6z1w5.execute-api.us-east-1.amazonaws.com/Prod/CompareImages';
    const payload = { base64Image };
    console.log(payload);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to invoke Rekognition Lambda');
    }

    const data = await response.json();
    return data.results; // Assuming the response contains results as the comparison outcome
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);

    // Preview the selected image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Sort and limit to top 3 matches based on the number of matching labels
  const getTopMatches = (results) => {
    // Sort by number of matching labels (descending order), then limit to top 3
    const sortedResults = results
      .map(result => ({
        ...result,
        matchingLabelCount: result.matchingLabels ? result.matchingLabels.length : 0
      }))
      .sort((a, b) => b.matchingLabelCount - a.matchingLabelCount) // Sort by label count
      .slice(0, 3); // Limit to top 3 matches

    return sortedResults;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Find Your Lost Item
      </Typography>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="contained" component="span" fullWidth sx={{ mb: 2 }}>
          Upload Image to Compare
        </Button>
      </label>

      {imageFile && (
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          Image selected: {imageFile.name}
        </Typography>
      )}

      {/* Display image preview */}
      {imagePreview && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Card sx={{ maxWidth: '50%' }}>
            <CardMedia
              component="img"
              height="auto"
              sx={{ maxHeight: '400px', margin: '0 auto' }}
              image={imagePreview}
              alt="Preview of uploaded image"
            />
          </Card>
        </Box>
      )}

      <LoadingButton
        loading={loading}
        onClick={handleImageUpload}
        variant="contained"
        fullWidth
        color="primary"
        disabled={!imageFile}
      >
        Compare with Lost & Found Items
      </LoadingButton>

      {loading && (
        <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {matchResults && matchResults.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {/* Display only top 3 items with the most matching labels */}
          {getTopMatches(matchResults).map((result, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={{mb: 4}}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://nyp-lost-and-found-us-east-1-783764587062.s3.us-east-1.amazonaws.com/${result.image}`} 
                  alt="Matched Image"
                />
                <CardContent>
                  <Typography variant="h7" gutterBottom>
                    Item: {result.image}
                  </Typography>
                  <Typography variant="body2" color={result.match ? 'green' : 'red'}>
                    <strong>Match: </strong>{result.match ? 'Yes' : 'No'}
                  </Typography>
                  {result.match && result.matchingLabels && result.matchingLabels.length > 0 && (
                    <Typography variant="body2" color="textSecondary">
                      <strong>Matching Labels: </strong>{result.matchingLabels.join(', ')}
                    </Typography>
                  )}
                  {result.match === false && !result.matchingLabels?.length && (
                    <Typography variant="body2" color="textSecondary">
                      No labels detected for this item.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {matchResults && matchResults.length === 0 && !loading && (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 2 }}>
          No matching items found.
        </Typography>
      )}
    </Container>
  );
};

export default FindItemPage;
