import React from "react";
import { Dialog } from "primereact/dialog";
import Genius from "../../plugin/components/Genius";
import { useDispatch, useSelector } from "react-redux";
import * as actionTypesGlobal from "../state/action";
import "../styles/GeniusDialog.scss";

const GeniusDialog = () => {
  const showGeniusDialog = useSelector((state) => state.progressbar.showGenuisWindow)
  const geniusWindowProps = useSelector((state) => state.progressbar.geniusWindowProps)
  const dispatch = useDispatch();
  return <>
    <Dialog style={{height:"95vh"}} header={"Welcome to Avo Genius"} visible={showGeniusDialog} draggable={false} className="geniusMindmapDialog" onHide={() => { dispatch({ type: actionTypesGlobal.CLOSE_GENIUS, payload: { showGenuisWindow: false, geniusWindowProps: {} } }) }}>
      <Genius {...geniusWindowProps}></Genius>
    </Dialog>  
  </>
}

export default GeniusDialog