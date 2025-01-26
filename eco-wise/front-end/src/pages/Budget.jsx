import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, Paper, Divider, Typography, Grid, Card, CircularProgress, Button } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { jwtDecode } from 'jwt-decode';
import { GetPreferenceApi } from '../api/preference/GetPreferenceApi';
import { useUserContext } from '../contexts/UserContext';
import { enqueueSnackbar } from 'notistack';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import BudgetDialog from '../components/common/budget/BudgetDialog';
import * as yup from 'yup';
import { CreatePreferenceApi } from '../api/preference/CreatePreferenceApi';
import { UpdatePreferenceApi } from '../api/preference/UpdatePreferenceApi';
import { useAlert } from "../contexts/AlertContext";
import { GetGSIDeviceConsumptionApi } from '../api/home/GetGSIDeviceConsumptionApi';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);



const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: '',
    },
  },
};
const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const data = {
  labels: labels,
  datasets: [{
    label: 'Actual Consumption',
    data: [11, 20, 34, 38, 47],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  },
  {
    label: 'Budget Consumption',
    data: [10, 20, 30, 40, 50, 60, 70],
    fill: false,
    borderColor: 'rgb(255, 42, 0)',
    tension: 0.1
  },
  ]
};

// Define the validation schema with yup
const schema = yup.object({
  dailyBudgetLimit: yup.number().required("Budget is required"),
}).required();
function Budget() {
  const { user, RefreshUser } = useUserContext()
  const [preference, setPreference] = useState(null); // Set initial value to null to indicate loading
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [formData, setFormData] = useState({
    dailyBudgetLimit: 0
  });
  const { showAlert } = useAlert();
  const [errors, setErrors] = useState({});
  const [deviceConsumption, setDeviceConsumption] = useState(null);
  const [totalDeviceConsumption, setTotalDeviceConsumption] = useState(null);
  const [todaySavings, setTodaySavings] = useState(null);


  const validateForm = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const validationIssues = {};
      validationErrors.inner.forEach((err) => {
        validationIssues[err.path] = err.message;
      });
      setErrors(validationIssues);
      return false;
    }
  };
  const handleClickOpenBudgetDialog = () => {
    setOpenBudgetDialog(true);
  };

  const handleCloseBudgetDialog = () => {
    setOpenBudgetDialog(false);
    // console.log(user)
  };
  const handleBudgetInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleEditBudget = async () => {
    if (!(await validateForm())) {
      return;
    }

    const requestObj = {
      ...preference,
      userId: user.Username,
      uuid: preference.uuid,
      budgets: { ...preference.budgets, dailyBudgetLimit: formData.dailyBudgetLimit }
    };
    if (preference === 0) {
      CreatePreferenceApi(requestObj)
        .then((res) => {
          RefreshUser();
          showAlert('success', "Profile Updated Successfully.");
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          if (error.name === 'NotAuthorizedException') {
            if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
            }
          } else {
            showAlert('error', 'Unexpected error occurred. Please try again.');
          }
        });
    } else {
      UpdatePreferenceApi(requestObj)
        .then((res) => {
          RefreshUser();
          showAlert('success', "Budget Updated Successfully.");
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          if (error.name === 'NotAuthorizedException') {
            if (error.message === 'Refresh Token has expired' || error.message.includes('Refresh')) {
            }
          } else {
            showAlert('error', 'Unexpected error occurred. Please try again.');
          }
        });
    }



  };
  useEffect(() => {
    GetPreferenceApi(user.Username)
      .then((res) => {
        setPreference(res.data[0])
        let dailyBudgetLimit = res.data[0].budgets.dailyBudgetLimit
        setFormData({
          dailyBudgetLimit: res.data[0].budgets.dailyBudgetLimit
        })
        // console.log(res.data)
        GetGSIDeviceConsumptionApi(user.Username)
          .then((res) => {
            setDeviceConsumption(res.data)
            //START calculate total Consumption based ondevices
            let totalConsumption = 0
            for (let i = 0; i < res.data.length; i++) {
              let deviceRecord = res.data[i]
              console.log(deviceRecord)
              if (deviceRecord.totalConsumption != null) {
                let consumption = Number(deviceRecord.totalConsumption)
                console.log(typeof (consumption))
                totalConsumption += consumption
                console.log(totalConsumption)
              }
            }
            console.log(`totalConsumption:${totalConsumption}`)
            setTotalDeviceConsumption(totalConsumption)
            // END calculate total Consumption based ondevices
            // calculating AS PER amount https://www.spgroup.com.sg/our-services/utilities/tariff-information
            const costPerKwh = 0.365 //in $/kWh
            let totalCost = totalConsumption * costPerKwh
            let todaysSavings = dailyBudgetLimit - totalCost
            setTodaySavings(todaysSavings)
            // console.log(res.data)
          })
          .catch((err) => {
            // console.log(`err:${err.status}`)
            if (404 == err.status) {
              setDeviceConsumption([])
            } else {
              enqueueSnackbar('Failed to fetch Device Consumption data', { variant: "error" })
            }
          })
      })
      .catch((err) => {
        // console.log(`err:${err.status}`)
        if (404 == err.status) {

          setPreference(0)
        } else {
          enqueueSnackbar('Failed to fetch Preference data', { variant: "error" })
        }



      })
  }, [user]);


  return (
    <>
      <Box padding={2}>
        <Breadcrumbs sx={{ mb: 1 }} >
          {/* <Link underline="hover" style={{ textDecoration: "none", color: "grey" }} href="/">
            Overview
          </Link> */}
          <Link
            aria-current="page"
            underline="hover"
            style={{ textDecoration: "underline", color: "black" }}
            href="/"

          >
            Preference
          </Link>

        </Breadcrumbs>

        <Grid container direction="column" spacing={2} sx={{ height: "100%" }}>
          <Grid lg={6} item container direction="row" spacing={2}>
            <Grid item lg={4}>
              <Card sx={{ width: "100%", height: 170 }}>
                <Grid container direction="column">
                  <Grid container direction="row" sx={{ marginTop: 2 }}>
                    <Grid item lg={2}>
                      <img style={{ width: 50, marginLeft: 15, }} src="https://i.ibb.co/tYFNbxN/energy.png" alt="" />
                    </Grid>
                    <Grid item lg={9}>
                      <Typography fontSize={22} marginTop={1} marginLeft={2}> Current Usage</Typography>
                    </Grid>

                  </Grid>
                  <Grid lg={6} container direction="row">

                    <Typography>
                      {totalDeviceConsumption}kWh
                    </Typography>
                  </Grid>


                </Grid>
              </Card>
            </Grid>
            <Grid item lg={4}>
              <Card sx={{ width: "100%", height: 170 }}>
                <Grid container direction="column">
                  <Grid container direction="row" sx={{ marginTop: 2 }}>
                    <Grid item lg={2}>
                      <img style={{ width: 50, marginLeft: 15, }} src="https://cdn-icons-png.flaticon.com/128/13798/13798822.png" alt="" />
                    </Grid>
                    <Grid item lg={9}>
                      <Typography fontSize={22} marginTop={1} marginLeft={2}> Current Savings</Typography>
                    </Grid>

                  </Grid>
                  <Grid lg={6} container direction="row">

                    <Typography>
                    ${todaySavings?.toFixed(2)}
                    </Typography>
                  </Grid>


                </Grid>
              </Card>
            </Grid>
            <Grid item lg={4}>
              <Card sx={{ width: "100%", height: 170 }}>
                <Grid container direction="column">
                  <Grid container direction="row" sx={{ marginTop: 2 }}>
                    <Grid item lg={2}>
                      <img style={{ width: 48, marginLeft: 17, marginTop: 3 }} src="https://i.ibb.co/d5FcLHr/budget.png" alt="" />
                    </Grid>
                    <Grid container direction={'row'} display={'flex'} justifyContent={'space-between'} lg={10} >
                      <Grid item>
                        <Typography fontSize={22} marginTop={1} marginLeft={2}> Budget</Typography>
                      </Grid>
                      <Grid item>
                        <Button onClick={() => (setOpenBudgetDialog(true))}>
                          <img style={{ width: 30 }} src="https://cdn-icons-png.flaticon.com/128/2311/2311524.png" alt="" />
                        </Button>
                      </Grid>


                    </Grid>

                  </Grid>
                  <Grid lg={6} container direction="row">

                    <Typography>
                      {preference === null ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <>
                          {preference === 0 ? (
                            <>
                              Budget is not set
                            </>
                          ) : (
                            <>
                              {preference.budgets.dailyBudgetLimit}
                            </>
                          )}
                        </>
                      )}
                    </Typography>
                  </Grid>


                </Grid>
              </Card>
            </Grid>
          </Grid>
          <Grid lg={6} item container direction="row" spacing={2}>
            <Grid item lg={12}>
              <Card sx={{ width: "100%", height: 340 }}>
                <Line options={options} data={data} width={"800%"} />;
              </Card>
            </Grid>

          </Grid>



        </Grid>
      </Box>
      <BudgetDialog open={openBudgetDialog} handleClose={handleCloseBudgetDialog} errors={errors} handleEdit={handleEditBudget} handleInputChange={handleBudgetInputChange} formData={formData} />

    </>
  )
}

export default Budget