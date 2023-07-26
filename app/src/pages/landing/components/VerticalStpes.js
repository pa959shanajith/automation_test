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

    const navigate = useNavigate();
    const steps = [
    {
        label: activeStep  > 0 ? 'Create/modify test automation workflows' : ' Create test automation workflows',
        description: ` Visualize testcases through mindmaps, capture elements and design test steps. `,
        title:<div><Button size="small" style={{background:" #605bff",color:"white" , fontFamily:"Open Sans",padding:"0.3rem 0.5rem 0.3rem 0.5rem"}} ><img style={{color:"white", fill:"white",marginRight:"5px"}} src="static/imgs/avo_genius_icon.svg"   />  AVO Genius</Button> <span style={{ color: 'black', fontWeight: "bold",fontFamily: "Open Sans" }}> OR </span><Button size="small" style={{background:" #605bff",color:"white",padding:"0.3rem 0.8rem"}} onClick={(e)=>handleNext("Design")}> <img src="static/imgs/design_studio_icon.svg"  style={{ marginRight: '5px' }} />Design</Button> </div>
       
    },
    {
        label: ' Configure and test execution profiles',
        description:'  Trigger test execution locally, via DevOps pipeline/cloud test provider or schedule it',
        title:<Button size="small" style={{background:" #605bff",color:"white",padding:"0.3rem 0.5rem 0.3rem 0.5rem",marginRight: "-0.2rem"}} onClick={(e)=>handleNext("Execute")}><img src="static/imgs/execute _icon.svg"   style={{ marginRight: '5px' }}/> Execute</Button>
    },
    {
        label: 'View Test Reports ',
        description: `View and analyze executed test automations.`,
        title:<Button size="small" style={{background:" #605bff",color:"white" ,padding:"0.3rem 0.8rem",marginRight: "-0.2rem"}}onClick={(e)=>handleNext("Report")} ><img src="static/imgs/reports_icon.svg" style={{ marginRight: '5px' }} />  Report</Button>
    },
    ];

  const handleNext = (value) => {
    if(value==="Design"){
      dispatch(updateSteps(1))
      navigate("/design");
      dispatch(selectedProj(project.projectId))
    }
    else if(value==="Execute"){
          dispatch(updateSteps(2))
          navigate("/execute");
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
                              disabled={
                                        (step.title==="Execute" && activeStep < 1) || (step.title==="Report" && activeStep < 2)} >{step.title}</Button>
                        {/* <NavigateNextIcon className='verticalicon'/> */}
                     </Box>
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <StepContent TransitionProps={{ unmountOnExit: false }} />
        </Box>
     </Card>
  );
}
export default VerticalSteps;


