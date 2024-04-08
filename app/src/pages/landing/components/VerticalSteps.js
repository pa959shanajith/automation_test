import React, { useState,useEffect, useRef} from 'react';
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
import { getProjectIDs } from "../api"
import { selectedProj } from '../../design/designSlice';
import { showGenuis, geniusMigrate } from '../../global/globalSlice';
import { showSapGenius } from '../../global/globalSlice';
import { getModules,updateTestSuiteInUseBy } from '../../design/api'
import { Toast } from 'primereact/toast';
import { loadUserInfoActions } from '../LandingSlice';
import { RedirectPage } from "../../global";
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
// this component renders the "get started Box" in the landing page with the help of MUI framework

const VerticalSteps = (props) => {
    const dispatch= useDispatch ();
    const toast = useRef();
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    let project = reduxDefaultselectedProject;
    const activeStep = reduxDefaultselectedProject.progressStep;
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if(!userInfo) userInfo = userInfoFromRedux; 
    else userInfo = userInfo ;


    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
      project = JSON.parse(localStorageDefaultProject);
    }
    const buttonStyle_design = {
      background:" #605bff",color:"white" , fontFamily:"Open Sans",justifyContent:"space-evenly",alignItems:"center",minWidth:"11.2rem",  textTransform: 'capitalize',marginLeft:" 1.6rem" };
    const buttonStyle_genius = {
      background:" #605bff",color:"white" , fontFamily:"Open Sans",justifyContent:"space-evenly",alignItems:"center",minWidth:"11.2rem",marginTop:"2rem",textTransform: 'capitalize' ,marginLeft:" 1.6rem"
    };
    const buttonStyle_genius_disabled = {
      background:"#BDBDBD" ,color:"white" , marginTop: "2rem", fontFamily:"Open Sans",padding:"0.3rem 1.8rem 0.3rem 1.8rem",textTransform: 'capitalize' ,marginLeft:"1.6rem"
    };

    const buttonStyle_execute = {
      background: (Button!="Execute"&& activeStep <2)? '#BDBDBD' : '#605bff',
      color: 'white',
      padding: '0.3rem 0.7rem',
      // marginRight: '2rem',
      minWidth:"11.2rem",
      textTransform: 'capitalize',
      marginLeft:" 1.6rem"
    };
    const buttonStyle_report = {
      background:(Button!="Report"&& activeStep <3)? '#BDBDBD' : '#605bff',
      color:"white" ,padding:"0.3rem 0.8rem",minWidth:"11.2rem",
      // marginRight: "13.7rem"
      textTransform: 'capitalize' ,
      marginLeft:" 1.6rem"
    };
    const buttonStyle_elementRepository = {
      background:" #605bff",
      color: 'white',
      padding:"0.3rem 0.8rem 0.3rem 0.8rem",
      // marginRight: '2rem',
      minWidth:"10rem",
      textTransform: 'capitalize' 
    };
    
    const agsLicense = {
      value: userInfo?.licensedetails?.AGS === false,
      msg: "You do not have access for Avo Genius."
    }
    const handleRepository=()=>{
      // navigate("/elementRepository");
      dispatch(loadUserInfoActions.setElementRepositoryIndex(3))
    }

    const navigate = useNavigate();
    const steps = [
      {
        label: ' Utilize the Element Repository',
        description:'Central location to capture, access and manage elements.',
        title:<Button  size="small" style={buttonStyle_elementRepository} onClick={(e)=>{handleRepository()}}><img src="static/imgs/element_repository_white.svg"   style={{ marginRight: '10px' }} /> <div>Element Repository</div></Button>
    },
    {
        label: <>
          <span>{activeStep > 1 ? 'Create/modify test automation workflows' : ' Create test automation workflows'}</span>
          {/* <Tag value="Recommended for complex applications" className="tag_label" ></Tag> */}
          <img className='info_btn_design'src="static/imgs/info.png" ></img>
          <Tooltip target=".info_btn_design" position="right" content='Recommended for complex applications.'/>
        </>,
        description: (<>
        <span>Visualize testcases through mindmaps, capture elements and design test steps.</span><div style={{margin:"0.5rem 0rem"}}><strong>OR</strong></div>
        <div className='label'>
          <span >{activeStep > 1 ? 'Create/modify test automation workflows' : ' Create test automation workflows'}
          </span>
          {/* <Tag value="Recommended for simple applications" className="tag_label" ></Tag> */}
          <img className='info__btn'src="static/imgs/info.png" ></img>
          <Tooltip target=".info__btn" position="right" content='Recommended for simple applications.'/>
        </div>
        <div>Create rapid automation using Smart recorder.</div>
        </>),
        title:(
          <div className='flex flex-column justify-content-center align-items-center'>
             <Button type="designStudio" size="small" style={buttonStyle_design} onClick={(e) => handleNext("Design Studio")} >
              <div className='flex justify-content-center align-items-center'>
                <img src="static/imgs/design_studio_icon 1.svg" style={{ color: "white", fill: "white", width: "100%" }} />
              </div>
              <div>Design Studio</div>
            </Button>
            <Button className={agsLicense.value ? 'geniusDisable_tooltip' : 'genius_tooltip'} disabled={project.appType !== "Web" && project.appType !== "SAP" || agsLicense.value} type="AVOgenius" size="small" style={project.appType !== "Web" && project.appType !== "SAP" || agsLicense.value ? buttonStyle_genius_disabled : buttonStyle_genius} onClick={(e) => handleNext("AVO Genius")} title={agsLicense.value ? agsLicense.msg : "AVO Genius(Smart Recorder)"}>
              <div className='flex justify-content-center align-items-center'>
                <img style={{ color: "white", fill: "white", width: "100%" }} src="static/imgs/avo_genius_icon1.svg" />
              </div>
              <div style={{marginRight:"1.5rem"}}>Avo Genius</div>
            </Button>
           
          </div>
        ) 
    },
    {
        label: ' Configure and test execution profiles',
        description:'  Trigger test execution locally, via DevOps pipeline/cloud test provider or schedule it',
        title:<Button disabled = {(Button!="Execute"&& activeStep <2)}  size="small" style={buttonStyle_execute} onClick={(e)=>handleNext("Execute")}><img src="static/imgs/execution_icon.svg"   style={{ marginRight: '10px' }} /> <div style={{marginRight:"2.6rem"}}>Execute</div></Button>
    },
    {
        label: 'View Test Reports ',
        description: `View and analyze executed test automations.`,
        title:<Button  disabled = {(Button!="Report"&& activeStep <3)} size="small" style={buttonStyle_report}onClick={(e)=>handleNext("Report")} ><img src="static/imgs/reports_icon1.svg" style={{ marginRight: '10px' }} /> <div style={{marginRight:"3rem"}}>Reports</div> </Button>
    },
   
    ];

  const handleNext = async(value) => {
    const projectList = await getProjectIDs()
    if(projectList.projectId.some((item)=>item === project.projectId)){
      dispatch(loadUserInfoActions.updatedProject(true))
       if(value=== "Design Studio"){
        dispatch(updateSteps(2))
        navigate("/design");
        var reqForOldModule={
          tab:"createTab",
          projectid:project.projectId,
          version:0,
          cycId: null,
          modName:"",
          moduleid:null
        }
        
        
      var firstModld=await getModules(reqForOldModule)
      if(firstModld.length>0){
      var reqForFirstModule={
        tab:"createTab",
        projectid:project.projectId,
        version:0,
        cycId: null,
        modName:"",
        moduleid:firstModld[0]?._id
      }
      var firstModDetails=await getModules(reqForFirstModule)
      if(!firstModDetails.currentlyInUse?.length>0)
      await updateTestSuiteInUseBy("Web",firstModld[0]._id,"123",userInfo?.username,true,false)
        dispatch(selectedProj(project.projectId))
      }}
      else if(value==="Execute"){
            dispatch(updateSteps(3))
            navigate("/execute");
            dispatch(selectedProj(project.projectId))
      }
      else if(value==="Report"){
        dispatch(updateSteps(4))
        navigate("/reports");
      }
      else if(value==="AVO Genius"){
        if (project.appType === "Web") {
          openGen();
        } else if (project.appType === "SAP") {
          openSapGen();
        }
      }
    }else if(projectList.projectId.length === 0){
      RedirectPage(navigate, { reason: "logout" });
    }
    else{
      toast.current.show({severity:'warn', summary: 'Warning', detail:`${project.projectName} project unassign for you`, life: 3000}); 
      dispatch(loadUserInfoActions.updatedProject(true))
    }

  };
  const openGen = () => {
    dispatch(geniusMigrate(false))
    dispatch(showGenuis({
      showGenuisWindow: true, geniusWindowProps: {}
    })
    );
  };

  const openSapGen = () => {
    dispatch(showSapGenius({showSapGeniusWindow:true,geniusSapWindowProps:{}})
    )
  }


  return (
    <Card className='verticalcard' >
      <Toast  ref={toast} position="bottom-center" baseZIndex={1000}/>
      <h2 className= "GetStd"> <img src="static/imgs/get_started_icon.svg"></img>{(activeStep > 0) ? "Welcome Back !" : "Get Started"}</h2>
        <Box > 
        <Stepper  className='Stepper customStepper' activeStep = {activeStep} orientation="vertical">
          {steps.map((step, index) => ( 
            <Step key={step.label}>
              <StepLabel  className='stepLabel' >
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
        {/* <StepContent TransitionProps={{ unmountOnExit: false }} /> */}
        </Box>
     </Card>
  );
}
export default VerticalSteps;


