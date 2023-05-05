import React, { useEffect,useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import "../styles/ShowTrialVideo.scss";

import * as actionTypesGlobal from "../state/action";


const ShowTrialVideo=()=> {

    const showTrialDemoVideo = useSelector((state) => state.progressbar.showTrialVideo)
    const userInfo = useSelector(state=>state.login.userinfo);
    const[videoUrl,setVideoUrl]=useState("")
    const dispatch = useDispatch();
    const [showOverlay, setShowOverlay] = useState(false);


    
    useEffect(()=>{
        fetch("/getClientConfig").then(data=>data.json()).then(response=>setVideoUrl(response.videoTrialUrl))
    },[])
    

    const handleClick=() =>{
      setShowOverlay(false);
      {dispatch({type:actionTypesGlobal.OPEN_TRIAL_VIDEO,payload:{showTrialVideo:false}}) };
    }

    const handleClose = () => {
      setShowOverlay(true);
    };

    const GetOverlayPlan =()=>{
      return (
      (userInfo.isTrial && userInfo.firstTimeLogin && showOverlay) ? 
          <div className="overlay">
    <span className="overlayingPlan"><img alt="View Plan" src='static/imgs/ViewPlanArrow.png' /></span>
    <span className="overlayingArrow" ><img  alt="arrow"   src='static/imgs/ViewPlanicon.png' /></span>
    <button className="overlaybutton" onClick={()=>handleClick()}><img alt="View Plan" src='static/imgs/ViewPlanOk.png' /></button><span ><h1 className="overlaysta">Know your plan from here.</h1></span>
    </div>
    
    
    : null)
        
    };
 

  return (
    <> 
     {showOverlay?<GetOverlayPlan/>:
     <><Dialog style={{width: '80vw',height: '87vh',border:'2px solid #5f338f' }} header={ `Welcome to Avo Assure`} visible={showTrialDemoVideo} draggable={false} className="geniusMindmapDialog" onHide={() =>{handleClose()}}>
 <div className={"welcomeInstall "} style={{justifyContent:"unset !important",}}>
    <video width="90%" height="500px" controls loop autoPlay >
         <source src={videoUrl} type="video/mp4" />
     </video>
 </div>
 </Dialog>
</>
}
  </>
)
}

export default ShowTrialVideo