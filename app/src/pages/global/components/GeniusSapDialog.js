import React, { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { useDispatch, useSelector } from "react-redux";
import {showSapGenius} from "../globalSlice";
import GeniusSap from "../../landing/components/GeniusSap"
import "../styles/GeniusSapDialog.scss"
import { Toast } from 'primereact/toast';




const GeniusSapDialog = () =>{
  const showSapGeniusDialog = useSelector((state) => state.progressbar.showSapGeniusWindow)
  const geniusSapWindowProps = useSelector((state) => state.progressbar.geniusSapWindowProps)
  const showSmallPopup = useSelector((state) => state.progressbar.showSmallPopup)
  const userInfo = useSelector((state) => state.landing.userinfo);
  const[small,setSmall]=useState(false)
  const dispatch = useDispatch();
  const toast = useRef();

  

  useEffect(()=>{

    if(showSmallPopup){
      setSmall(true)
    }
    else{
      setSmall(false)
    }
  })

  const toastError = (erroMessage) => {
    if (erroMessage && erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
  }

  const toastSuccess = (successMessage) => {
    if (successMessage && successMessage.CONTENT) {
      toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
  }

  const toastWarn = (warnMessage) => {
    if (warnMessage.CONTENT) {
        toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
  }

  const toastInfo = (infoMessage) => {
    if (infoMessage.CONTENT) {
        toast.current.show({ severity: infoMessage.VARIANT, summary: 'Info', detail: infoMessage.CONTENT, life: 3000 });
    }
    else toast.current.show({ severity: 'info', summary: 'Info', detail: infoMessage, life: 3000 });
  }

  return <>
    <Toast ref={toast} position="bottom-center" baseZIndex={9999} style={{ maxWidth: "35rem" }} />
    <Dialog style={small?{width:'45vw',height:'30vh'}: {width: '80vw',height: '97vh' }} header={ small?null:"Avo Genius for SAP"} visible={showSapGeniusDialog} draggable={false} className="geniusMindmapDialog" onHide={() => { dispatch(showSapGenius({ showSapGeniusWindow: false, geniusSapWindowProps: {} })) }}>
        <GeniusSap {...geniusSapWindowProps } toastWarn={toastWarn} toastSuccess={toastSuccess} toastInfo={toastInfo} toastError={toastError}></GeniusSap>
    </Dialog>  

</>


}
export default GeniusSapDialog;