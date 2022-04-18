import React, { useEffect, useState } from "react";
import "../styles/WelcomeWizard.scss";
import axios from "axios";
import {ProgressIndicator} from "@fluentui/react";
import { Stepper } from 'react-form-stepper';
import { Messages as MSG, setMsg } from '../../global';
import { AnimationClassNames } from '@fluentui/react';

const WelcomeWizard = () => {
  const [percentComplete,setPercentComplete] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const [showMacOSSelection, setShowMacOSSelection] = useState(false);
  const [selectedMacOS, setSelectedMacOS] = useState("");

  useEffect(()=>{
    if (percentComplete === 1) {
        setActiveStep((currPage) => currPage + 1);
    }
  },[percentComplete])

  const getOS = () => {
    let userAgent = navigator.userAgent.toLowerCase();
    if (/windows nt/.test(userAgent))
        return "Windows";
    
    else if (/mac os x/.test(userAgent)) 
        return "MacOS";
    
    else 
        return "Not Supported";
  }

  const getIce = async (queryICE) => {
    try {
        const res = await fetch("/downloadICE?ver="+queryICE);
        const status = await res.text();
        if (status === "available"){
            setShowIndicator(true);
            axios({
                url: window.location.origin+"/downloadICE?ver="+queryICE+"&file=getICE",
                method: "GET",
                responseType: "blob", 
                onDownloadProgress(progress) {
                    setPercentComplete(progress.loaded/progress.total)
                }
            }).then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', queryICE);
                document.body.appendChild(link);
                link.click();
            }).catch((err)=>{
                console.log(err);
                setShowIndicator(false);
            });
        }
        else setMsg(MSG.GLOBAL.ERR_PACKAGE);
    } catch (ex) {
        console.error("Error while downloading ICE package. Error:", ex);
        setMsg(MSG.GLOBAL.ERR_PACKAGE);
    }
  };

  const startDownloadICE = () => {
      const OS = getOS();

      if (OS!=="Not Supported"){
        switch(OS) {
            case "Windows":
                return getIce("AvoAssure_ICE.zip");
            case "MacOS":
                return setShowMacOSSelection(true);
            default:
                return
        }
      }
      else {
        setMsg(MSG.GLOBAL.ERR_PACKAGE);
      }
  }

  const _handleMacOSDownload = () =>{
      if (selectedMacOS==="") {
        setMsg({"CONTENT":"Please select a OS version", "VARIANT":"error"});
      }
      else {
        setShowMacOSSelection(false);
        getIce(`AvoAssure_ICE_${selectedMacOS}.zip`)
      }
  }

  const getWelcomeStep = ()=>{
    return <div className="welcomeToAssure">
        <div className="step1">
            <div>Welcome...</div>
            <div>Terms and Conditions...</div>
        </div>
        <button className="type1-button"onClick={() => {setActiveStep((currPage) => currPage + 1);}}>Next</button>
    </div>
  };

  const getDownloadStep = ()=>{
    return <div className={"welcomeInstall "+AnimationClassNames.slideLeftIn400}>
                <span>
                    <img src={"static/imgs/WelcomInstall.svg"} className="" alt=""/>
                </span>
                <div className="step2">{!showIndicator || showMacOSSelection?"Please install Avo Assure Client":"Downloading Avo Assure Client"}</div>
                {showIndicator && !showMacOSSelection ?
                <div className="downloadProgress">
                    <ProgressIndicator 
                    barHeight={30}
                    styles = {{
                        root:{width:"90%"},
                        progressBar: { background:"#643693"},
                        itemName: { fontSize: '1em', marginBottom: '0.6em',color:"black", display:"none" },
                        itemDescription: { fontSize: '1em', marginTop: '0.6em' },
                    }} label={'Downloading ICE Package...'} percentComplete={percentComplete} />
                </div> : 
                (showMacOSSelection ? 
                <>
                    <div className="radioContainer">
                        <label style={{marginRight:"2rem"}}>
                            <input type="radio" checked={selectedMacOS === "Catalina"} value="catalina" onChange={() => { setSelectedMacOS("Catalina") }} />
                            <span>Catalina</span>
                        </label>
                        <label>
                            <input type="radio" checked={selectedMacOS === "BigSur"} value="bigsur" onChange={() => { setSelectedMacOS("BigSur") }} />
                            <span>BigSur</span>
                        </label>
                    </div>
                    <button class="type2-button" onClick={_handleMacOSDownload}>Install</button>
                </>:<button className="type2-button"onClick={startDownloadICE}>Install Now</button>)}
            </div>
  };

  const getStartTrialStep = ()=>{
      return <div className={"welcomeInstall "+AnimationClassNames.slideLeftIn400}>
                <span>
                    <img src={"static/imgs/WelcomeStart.svg"} className="" alt=""/>
                </span>
                <div className="step2">Thanks for installing</div>
                <button className="type2-button"
                    onClick={() => {
                        setActiveStep((currPage) => currPage + 1);
                    }}
                >Start your free trial
                </button>
            </div>
  }

  return (
      <div className="container1">
        <div className="form">
        <div className="progressbar">
             <Stepper
                steps={[
                    { label: 'Welcome', active:activeStep===0, completed:activeStep>0, children:activeStep===0?1:<i class="fa fa-check"></i>},
                    { label: 'Download Client', active:activeStep===1, completed:activeStep>1, children:(activeStep<2) ?2:<i class="fa fa-solid fa-check"></i>},
                    { label: 'Start Trial', active:activeStep===2, completed:activeStep>2, children:(activeStep<3)?3:<i class="fa fa-solid fa-check"></i>}]}
                className="stepper"
                stepClassName="stepButtons"
                styleConfig={{
                    cursor:"default",
                    activeBgColor:"#643693",
                    completedBgColor:"#321e4f",
                    inactiveBgColor:"#aaa",
                    labelFontSize:"16px",
                    size:"1.8rem"
                }}
                connectorStateColors={true}
                connectorStyleConfig={{
                    activeColor:"#643693",
                    completedColor:"#643693"
                }}
             />
        </div>
        <div className="form-container">
            {activeStep===0?getWelcomeStep():null}
            {activeStep===1?getDownloadStep():null}
            {activeStep===2?getStartTrialStep():null}
        </div>
        </div>
    </div>
  );
}

export default WelcomeWizard;