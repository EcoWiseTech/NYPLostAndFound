import React from 'react';
import { Card, CardContent, CardActions, Grid, Typography, Switch, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CardTitle from '../common/CardTitle';

const NotificationInformationCard = ({
  allNotificationChecked,
  handleAllNotificationInputChange,
  handleCategoryNotificationInputChange,
  isModified,
  isLoading,
  handleEditNotification,
  categoryNotificationsChecked
}) => {
  return (
    <Card>
      <CardContent>
        <CardTitle icon={<NotificationsIcon />} title="Notification Settings" />
        <Grid container spacing={2} marginTop="1rem">
          {/* All Notifications Toggle */}
          <Grid item xs={12}>
            <Grid container direction="row" justifyContent="space-between" sx={{ px: 5 }}>
              <Grid item>
                <Typography fontSize={18}>
                  Turn on All Notifications (You will receive all notifications)
                </Typography>
              </Grid>
              <Grid item>
                <Switch
                  checked={allNotificationChecked}
                  onChange={handleAllNotificationInputChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Category Notification Filter (Changed to Select) */}
          <Grid item xs={12}>
            <Grid container direction="row" justifyContent="space-between" sx={{ px: 5, mb: 1 }}>
              <Grid item>
                <Typography fontSize={18}>
                  Category Notifications Filter (Receive notifications based on category)
                </Typography>
              </Grid>
              <Grid item>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryNotificationsChecked}
                    onChange={handleCategoryNotificationInputChange}
                  >
                    <MenuItem value="wallet">Wallet</MenuItem>
                    <MenuItem value="electronics">Electronics</MenuItem>
                    <MenuItem value="accessories">Accessories</MenuItem>
                    <MenuItem value="others">Others</MenuItem>
                    <MenuItem value="all">All</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions>
        <Grid container justifyContent="flex-end" sx={{ px: 5, py: 3 }}>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditNotification}
            disabled={!isModified}
          >
            Save
          </LoadingButton>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default NotificationInformationCard;
