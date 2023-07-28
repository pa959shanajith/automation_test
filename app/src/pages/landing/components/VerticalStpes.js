import React, { useState,useEffect} from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Card } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import '../styles/VerticalSteps.scss';
import { useNavigate } from "react-router-dom";
import { useSelector,useDispatch  } from 'react-redux';
import { updateSteps } from './VerticalComponentsSlice';
import { disable } from 'agenda/dist/job/disable';
import { getProjectIDs } from "../api"
import { selectedProj } from '../../design/designSlice';
// this component renders the "get started Box" in the landing page with the help of MUI framework

const VerticalSteps = (props) => {
    const dispatch= useDispatch ();
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    let project = reduxDefaultselectedProject;
    const activeStep = reduxDefaultselectedProject.progressStep;


    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
      project = JSON.parse(localStorageDefaultProject);
    }
    const buttonStyle_design = {
      background:" #605bff",color:"white" , fontFamily:"Open Sans",padding:"0.3rem 0.8rem"
    };
    const buttonStyle_genius = {
      background:" #605bff",color:"white" , fontFamily:"Open Sans",padding:"0.3rem 0.8rem 0.3rem 0.8rem"
    };
    const buttonStyle_execute = {
      background: (Button!="Execute"&& activeStep <1)? '#a0c8ff' : '#605bff',
      color: 'white',
      padding: '0.3rem 0.7rem',
      marginRight: '13rem',
    };
    const buttonStyle_report = {
      background:(Button!="Report"&& activeStep <2)? '#a0c8ff' : '#605bff',
      color:"white" ,padding:"0.3rem 0.8rem",marginRight: "13.3rem"
    };
    
    const navigate = useNavigate();
    const steps = [
    {
        label: activeStep  > 0 ? 'Create/modify test automation workflows' : ' Create test automation workflows',
        description: ` Visualize testcases through mindmaps, capture elements and design test steps. `,
        title:<div><Button  type = "AVOgenius" size="small" style={buttonStyle_genius} ><img style={{color:"white", fill:"white",marginRight:"10px"}} src="static/imgs/avo_genius_18x18_icon.svg"   />  AVO Genius</Button> <span style={{ color: 'black', fontWeight: "bold",fontFamily: "Open Sans" }}> OR </span><Button type = "designStudio" size="small" style={buttonStyle_design} onClick={(e)=>handleNext("Design Studio")} > <img src="static/imgs/design_studio_18x18_icon.svg"  style={{ marginRight: '10px' }} />Design Studio</Button> </div>
       
    },
    {
        label: ' Configure and test execution profiles',
        description:'  Trigger test execution locally, via DevOps pipeline/cloud test provider or schedule it',
        title:<Button disabled = {(Button!="Execute"&& activeStep <1)}  size="small" style={buttonStyle_execute} onClick={(e)=>handleNext("Execute")}><img src="static/imgs/execute_18x18_icon.svg"   style={{ marginRight: '10px' }} /> Execute</Button>
    },
    {
        label: 'View Test Reports ',
        description: `View and analyze executed test automations.`,
        title:<Button  disabled = {(Button!="Report"&& activeStep <2)} size="small" style={buttonStyle_report}onClick={(e)=>handleNext("Report")} ><img src="static/imgs/reports_18x18_icon.svg" style={{ marginRight: '10px' }} />  Report</Button>
    },
    ];

  const handleNext = (value) => {
    if(value=== "Design Studio"){
      dispatch(updateSteps(1))
      navigate("/design");
      dispatch(selectedProj(project.projectId))
    }
    else if(value==="Execute"){
          dispatch(updateSteps(2))
          navigate("/execute");
          dispatch(selectedProj(project.projectId))
        }
       else if(value==="Report"){
              dispatch(updateSteps(3))
              navigate("/reports");
            }
            else if(value==="AVO Genius"){
              dispatch(updateSteps(3))
              navigate("/reports");
            }

  };


  return (
    <Card className='verticalcard' >
      <h2 className= "GetStd">{(activeStep > 0) ? "Welcome Back !" : "Get Started"}</h2>
        <Box > 
        <Stepper  className='Stepper' activeStep = {activeStep} orientation="vertical">
          {steps.map((step, index) => ( 
            <Step key={step.label}>
              <StepLabel  className='stepLabel'>
                <Box className='titleDescBut' >
                     <Box>
                        <Box className='label'>
                          {step.label}
                        </Box>
                        <Typography className='description'>{step.description}</Typography>
                     </Box>
                     <Box className='buttonNav'>
                     <Button  className={step.title==='Execute'?'verticalbuttonE':step.title==='Report'?'verticalbuttonR':'verticalbutton'}
                              value={step.title}
                              onClick={(e)=>handleNext(e.target.value)}
                              // disabled={
                              //           (step.title==="Execute" && activeStep < 1) || (step.title==="Report" && activeStep < 2)} 
                              >{step.title}</Button>
                        {/* <NavigateNextIcon className='verticalicon'/> */}
          {/* {console.log(e.target.value)} */}
                     </Box>
                </Box>
              </StepLabel>
            </Step>
           ))
          }
        </Stepper>
        <StepContent TransitionProps={{ unmountOnExit: false }} />
        </Box>
     </Card>
  );
}
export default VerticalSteps;


