import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import Genius from "../../plugin/components/Genius";
import { useDispatch, useSelector } from "react-redux";
import { showGenuis } from '../globalSlice';
import "../styles/GeniusDialog.scss";

const GeniusDialog = () => {
  const showGeniusDialog = useSelector((state) => state.progressbar.showGenuisWindow)
  const geniusWindowProps = useSelector((state) => state.progressbar.geniusWindowProps)
  const showSmallPopup = useSelector((state) => state.progressbar.showSmallPopup)
  const userInfo = useSelector((state) => state.landing.userinfo);
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
    <Dialog style={small?{width:'45vw',height:'30vh'}: {width: '80vw',height: '97vh' }} header={ small?null:"Avo Genius"} visible={showGeniusDialog} draggable={false} className="geniusMindmapDialog" onHide={() => { dispatch(showGenuis({ showGenuisWindow: false, geniusWindowProps: {} })) }}>
      <Genius {...geniusWindowProps}></Genius>
    </Dialog>  

  </>
}

export default GeniusDialog