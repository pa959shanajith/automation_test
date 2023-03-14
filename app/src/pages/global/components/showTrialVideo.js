import React, { useEffect,useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";

// import * as actionTypesGlobal from "../state/action";


const ShowTrialVideo=()=> {

    const showTrialDemoVideo = useSelector((state) => state.progressbar.showTrialVideo)
    const[videoUrl,setVideoUrl]=useState("")
    const dispatch = useDispatch();
   

    useEffect(()=>{
        fetch("/getClientConfig").then(data=>data.json()).then(response=>setVideoUrl(response.videoTrialUrl))
    },[])
    
  return (
    <>
    <Dialog style={{width: '80vw',height: '87vh',border:'2px solid #5f338f' }} header={ `Welcome to Avo Assure`} visible={showTrialDemoVideo} draggable={false} className="geniusMindmapDialog" onHide={() => { }}>
    <div className={"welcomeInstall "} style={{justifyContent:"unset !important",}}>
        <video width="90%" height="500px" controls loop autoPlay >
            <source src={videoUrl} type="video/mp4" />
        </video>
    </div>
    </Dialog> 
    </>
  )
}

export default ShowTrialVideo