import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import Genius from "../../plugin/components/Genius";
import { useDispatch, useSelector } from "react-redux";
import * as actionTypesGlobal from "../state/action";
import "../styles/GeniusDialog.scss";

const GeniusDialog = () => {
  const showGeniusDialog = useSelector((state) => state.progressbar.showGenuisWindow)
  const geniusWindowProps = useSelector((state) => state.progressbar.geniusWindowProps)
  const showSmallPopup = useSelector((state) => state.progressbar.showSmallPopup)
  const userInfo=useSelector(state=>state.login.userinfo)
  const[small,setSmall]=useState(false)
  const dispatch = useDispatch();
  useEffect(()=>{

    if(showSmallPopup){
      setSmall(true)
    }
    else{
      setSmall(false)
    }
  })
  return <>
    <Dialog style={small?{width:'50vw',height:'40vh'}: {width: '80vw',height: '97vh' }} header={ small?null:`Welcome to Avo Genius ${userInfo.firstname}! `} visible={showGeniusDialog} draggable={false} className="geniusMindmapDialog" onHide={() => { dispatch({ type: actionTypesGlobal.CLOSE_GENIUS, payload: { showGenuisWindow: false, geniusWindowProps: {} } }) }}>
      <Genius {...geniusWindowProps}></Genius>
    </Dialog>  

  </>
}

export default GeniusDialog