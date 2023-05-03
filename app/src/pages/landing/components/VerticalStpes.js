import React, { useState} from 'react';
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
import staticDataDataForMindMap from '../../design/staticDataForMindMap';
import { useNavigate } from "react-router-dom";


function VerticalSteps(params) {
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const steps = [
    {
        label: 'Create Test Flow(s) using Design Studio',
        description: ` Quisque rutrum. Aenean imperdi. Etiam ultricies nisi vel augue. Curabitur ullamcorper`,
        title:'Design'
    },
    {
        label: 'Configure & Execute Test Flow(s)                                        ',
        description:' Quisque rutrum. Aenean imperdi. Etiam ultricies nisi vel augue. Curabitur ullamcorper',
        title:'Execute'
    },
    {
        label: 'View Test Reports                                                                 ',
        description: ` Quisque rutrum. Aenean imperdi. Etiam ultricies nisi vel augue. Curabitur ullamcorper`,
        title:'Report'
    },
    ];

  

  const handleNext = () => {
    // setActiveStep((prevActiveStep) => prevActiveStep + 1); 
      // let path = "/mindmap"; 
      navigate("/mindmap");
  };

  // const handleBack = () => {
  //   // setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

  // const handleReset = () => {
  //   setActiveStep(0);
  // };

  return (
    <Card className='verticalcard'>
      <h2 className='ml-2'>Get Started</h2>
      <Box sx={{ maxWidth: 800 }}>
        <Stepper className='Stepper' activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                {step.label}
                <Button className={step.title==='Execute'?'verticalbuttonE':step.title==='Report'?'verticalbuttonR':'verticalbutton'} onClick={handleNext}>{step.title}</Button>
                <NavigateNextIcon className='verticalicon'/>
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Card>
  );
}
export default VerticalSteps;
