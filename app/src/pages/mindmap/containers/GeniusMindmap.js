import React from "react";
import CanvasNew from './CanvasNew';
import { Dialog } from 'primereact/dialog';

const GeniusMindmap = ({ displayError, setBlockui, moduleSelect, setDelSnrWarnPop, hideMindmap }) => {
  return <Dialog header="Mindmap" maximizable visible={true} position={"right"} style={{ width: '50vw', height:"80vh", minWidth:"min(700px, 50vw)" }} modal footer={<></>} onHide={hideMindmap}>
    <CanvasNew showScrape={false} setShowScrape={undefined} ShowDesignTestSetup={false} setShowDesignTestSetup={undefined} displayError={displayError} setBlockui={setBlockui} module={moduleSelect} verticalLayout={true} setDelSnrWarnPop={setDelSnrWarnPop} GeniusDialog={true} />
  </Dialog>
}

export default GeniusMindmap;