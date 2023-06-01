import React, { useState, Fragment, useEffect } from 'react';
import { setMsg, ScreenOverlay} from '../../global'
import CreateOptions from '../components/CreateOptions.js'; 
import CreateNew from './CreateNew.js';
import ImportMindmap from'../components/ImportMindmap.js';
import {exportMindmap, getProjectList, getModules} from '../api';
import '../styles/MindmapHome.scss';
import {Messages as MSG} from '../../global';
import {parseProjList} from './MindmapUtils';
import {useDispatch, useSelector} from 'react-redux';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';


/*Component MindmapHome
  use: renders mindmap plugins landing page 
  todo: 
    import header, footer, and list of side bar element for differnet page
*/
const MindmapHome = () => {
  const [options,setOptions] = useState(undefined)
  const [importPop,setImportPop] = useState(false)
  const [blockui,setBlockui] = useState({show:false})
  // const selectProj = useSelector(state=>state.plugin.PN)
  const createType = {
    'newmindmap': React.memo(() => (<CreateNew/>)),
    'importmodules':React.memo(() => (<CreateNew importRedirect={true}/>))
 
    
  }
  const [showCard, setShowCard] = useState(true);
  const [show, setShow] = useState(false);
  var Component = createType["newmindmap"];
   const handleModule = ()=>{
    setShowCard(false)
    setShow(true);
   }
   const handleGenius = () =>{
    setShowCard(false);
    setShow(true);
   }
  const setOptions1 = (data) =>{
    setOptions(data)
  }
  const displayError = (error) =>{
    setBlockui({show:false})
    setMsg(error)
  }
  useEffect(() => {
    (async () => {
      const res = await getProjectList()
      if(res.error){return;}
      const data = parseProjList(res)
      var req={
        tab:"endToend",
        projectid:res.projectId[0],
        version:0,
        cycId: null,
        modName:"",
        moduleid:null
      }
      var moduledata = await getModules(req);
      if(moduledata.length > 0) setOptions1('newmindmap');
    })()
  },[]);
 

//data-selected="true"
 
  return (
    <div className='mp__container'>
      {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
      <div className='mp__body'>
        
        <Fragment>
        {showCard && <div className='cardMindmap'>
            <Card  id='p_card' className='Module'>
              <span className='cardText'>
                <h3 id='module'>Start by creating a Mindmap</h3>
                <p>Normal and E2E Modules</p>
              </span>
              <Button className='createBatton' title='Create Mindmap' onClick={handleModule} label='Create Mindmap'/>
              <img className='createBattonImg' src='static\imgs\Normal_Module.png' alt='Create Mindmap'/>
            </Card>
            <img src='static\imgs\OR.png' className='space' alt='OR'/>
            <Card id='p_card' className='avoGenius' >
              <span className='cardText'>
                <h3 id='module'>Start by triggering Avo Genius</h3>
                <p>Used Avo Genius for create mindmap</p>
              </span>
              <Button className='geniusBatton' title='Start Avo Genius' onClick={handleGenius} label='Start Avo Genius'/>
              <img className='avoGeniusImg' src='static\imgs\AvoGenius.png' alt='Start Avo Genius'/>
            </Card>
          </div>}
          {show &&  <Component/>}
        </Fragment>        
        {/* } */}
      </div>
      <div className='mp__footer'> 
        <div className="main-footer">
          <div className="main-footer-content">
              <span className="right-text">
                © {new Date().getFullYear()}  Avo Automation. All Rights Reserved
              </span>
            </div>
          </div>
       </div>
    </div>
  );
}
export default MindmapHome;
