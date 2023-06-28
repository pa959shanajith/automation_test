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
    const activeStep= useSelector((state)=>state.steps);
    const project = useSelector((state)=>state.landing.defaultSelectProject);
    const navigate = useNavigate();
    const steps = [
    {
        label: 'Create Test Flow(s) using Design Studio',
        description: `Create test flow of your software and Design your test cases. `,
        title:'Design'
    },
    {
        label: 'Configure & Execute Test Flow(s)                                        ',
        description:' Create execution profiles for executing your test flows.',
        title:'Execute'
    },
    {
        label: 'View Test Reports                                                                 ',
        description: ` Analyze the results of test flows execution.`,
        title:'Report'
    },
    ];

      const [ProgressStepDetails, setProgressStepDetails] = useState({});
      const [currentStep, setCurrentStep] = useState(null);

    useEffect(()=>{
      (async () => {
          const ProgressStep = await getProjectIDs({ readme: "progressStep" });
          setProgressStepDetails(ProgressStep);
        })()
      },[])

    useEffect(()=>{
      let findIndexOfStep = ProgressStepDetails?.projectId?.indexOf(activeStep?.id);
      if (ProgressStepDetails && ProgressStepDetails.progressStep && findIndexOfStep !== -1)
      {let findStep= ProgressStepDetails?.progressStep[findIndexOfStep]
      setCurrentStep(findStep);
      dispatch(updateSteps(findStep))
      }
    },[activeStep?.id])


  

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

  };


  return (
    <Card className='verticalcard' >
      <h2 className= "GetStd">Get Started</h2>
      <Box > 
        <Stepper  className='Stepper' activeStep = {currentStep} orientation="vertical">
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
                     <Button className={step.title==='Execute'?'verticalbuttonE':step.title==='Report'?'verticalbuttonR':'verticalbutton'}
                              value={step.title}
                              onClick={(e)=>handleNext(e.target.value)}
                              disabled={
                                        (step.title==="Execute" && activeStep.value < 1) || (step.title==="Report" && activeStep.value < 2)} >{step.title}</Button>
                        <NavigateNextIcon className='verticalicon'/>
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


