import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import Genius from "../../landing/components/Genius";
import { useDispatch, useSelector } from "react-redux";
import { showGenuis } from '../globalSlice';
import "../styles/GeniusDialog.scss";
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';

const GeniusDialog = () => {
  const showGeniusDialog = useSelector((state) => state.progressbar.showGenuisWindow)
  const geniusWindowProps = useSelector((state) => state.progressbar.geniusWindowProps)
  const showSmallPopup = useSelector((state) => state.progressbar.showSmallPopup)
  const geniusMigrate=useSelector((state) => state.progressbar.geniusMigrate)
  const userInfo = useSelector((state) => state.landing.userinfo);
  const[small,setSmall]=useState(false)
  const [visibleRight, setVisibleRight] = useState(false);
  const dispatch = useDispatch();
  useEffect(()=>{

    if(showSmallPopup){
      setSmall(true)
    }
    else{
      setSmall(false)
    }
  })
  const geniusHeader = (
    <div className="flex flex-wrap justify-content-between">
       <div>{small?null:geniusMigrate?"Non Avo To Avo migration":"Avo Genius"}</div>
      {geniusMigrate && <Button className="migrate-help-btn" icon="pi pi-question-circle" text onClick={() => setVisibleRight(true)}/>}
    </div>
  )
  return <>
    <Dialog style={small ? { width: '45vw', height: '30vh' } : geniusMigrate ? { width: '49vw', height: '97vh' } : { width: '80vw', height: '97vh' }} header={geniusHeader} visible={showGeniusDialog} draggable={false} className="geniusMindmapDialog" onHide={() => { dispatch(showGenuis({ showGenuisWindow: false, geniusWindowProps: {} })) }}>
      <Sidebar visible={visibleRight} position="right" onHide={() => setVisibleRight(false)}>
        <div className="migrate-sidebar">
          <h2>Migration Steps:</h2>
          <img className="migrate-sidebar-icon" src="static/imgs/genius_migration.svg" alt="genius migration SVG Image" />
          <ol className="migrate-help-ol" type="1">
            <li>Fill up the project details and click on Start Migration.</li>
            <li>When the Avo Genius window opens, run the automation scripts that needs to be converted.</li>
            <li>Use Stop button on Avo Genius window once automation scripts are run and Save Data.</li>
            <li>Close Avo Genius and navigate to Design Studio of the project created to view the scripts.</li>
          </ol>
        </div>
      </Sidebar>
      <Genius {...geniusWindowProps}></Genius>
    </Dialog>

  </>
}

export default GeniusDialog