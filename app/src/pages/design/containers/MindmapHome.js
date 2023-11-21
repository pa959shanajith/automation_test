import React, { useState, Fragment, useEffect } from 'react';
import { setMsg, ScreenOverlay, FooterTwo as Footer } from '../../global'
import CreateOptions from '../components/CreateOptions.js';
import CreateNew from './CreateNew.js';
import ImportMindmap from '../components/ImportMindmap.js';
import { exportMindmap, getProjectList, getModules } from '../api';
import '../styles/MindmapHome.scss';
import { Messages as MSG } from '../../global';
import { parseProjList } from './MindmapUtils';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import ModuleListSidePanel from '../components/ModuleListSidePanel';
import ModuleListDrop from '../components/ModuleListDrop';


/*Component MindmapHome
  use: renders mindmap plugins landing page 
  todo: 
    import header, footer, and list of side bar element for differnet page
*/
const MindmapHome = () => {
  const dispatch = useDispatch();
  const [options, setOptions] = useState(undefined)
  const [importPop, setImportPop] = useState(false)
  const [blockui, setBlockui] = useState({ show: false })
  const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
  let selectProj = reduxDefaultselectedProject;

  const localStorageDefaultProject = localStorage.getItem('DefaultProject');
  if (localStorageDefaultProject) {
    selectProj = JSON.parse(localStorageDefaultProject);
  }

  const createType = {
    'newmindmap': React.memo(() => (<CreateNew />)),
    'importmodules': React.memo(() => (<CreateNew importRedirect={true} />))
  }
  // const [showCard, setShowCard] = useState(true);
  const [show, setShow] = useState(false);
  const [initBlockUi, setInitBlockUi] = useState(false)

  var Component = createType["newmindmap"];
  // const handleModule = () => {
  //   setShowCard(false);
  //   setShow(true);
  // }
  // const handleGenius = () => {
  //   setShowCard(false);
  //   setShow(true);
  // }
  const setOptions1 = (data) => {
    setOptions(data)
  }
  const displayError = (error) => {
    setBlockui({ show: false })
    setMsg(error)
  }
  useEffect(() => {
    (async () => {
      const res = await getProjectList()
      if (res.error) { return; }
      const data = parseProjList(res)
      var req = {
        tab: "endToend",
        projectid: selectProj ? selectProj.projectId : res.projectId[0],
        version: 0,
        cycId: null,
        modName: "",
        moduleid: null
      }
      var moduledata = await getModules(req);
      if (moduledata.length > 0) {
        setOptions1('newmindmap');
        // setShowCard(false);
        // setShow(true);

      } else {
        // setShowCard(true);
        setShow(false);
        setInitBlockUi(true)
      }
    })()
  }, []);


  //data-selected="true"

  return (
    <div className='mp__container'>
      {(blockui.show) ? <ScreenOverlay content="Loading Content" /> : null}
      <div className='mp__body'>
        {/* {!show && <ModuleListDrop />} */}
        {/* <Fragment>
          {((showCard && !show) && initBlockUi) && <div className='cardMindmap'>
            <Card id='p_card' className='Module'>
              <span className='cardText'>
                <h3 id='module'>Start by creating a Mindmap</h3>
                <p id='module_normal'>Test Suite and E2E Flow</p>
              </span>
              <Button className='createBatton' title='Create Mindmap' onClick={handleModule} label='Create Mindmap' />
              <img className='createBattonImg' src='static\imgs\Normal_Module.png' alt='Create Mindmap' />
            </Card>
            <img src='static\imgs\OR.png' className='space' alt='OR' />
            <Card id='p_card' className='avoGenius' >
              <span className='cardText'>
                <h3 id='module'>Start by triggering Avo Genius</h3>
                <p id='module_normal'>Used Avo Genius for create mindmap</p>
              </span>
              <Button className='geniusBatton' title='Start Avo Genius' onClick={handleGenius} label='Start Avo Genius' />
              <img className='avoGeniusImg' src='static\imgs\AvoGenius.png' alt='Start Avo Genius' />
            </Card>
          </div>}
        </Fragment> */}
       <Fragment>
          {importPop?<ImportMindmap setBlockui={setBlockui} setOptions={setOptions} displayError={displayError} setImportPop={setImportPop} isMultiImport={true} />:null}
          <Component/>
        </Fragment>  
      </div>
        <div className='mp__footer'><Footer/></div>
    </div> 
  );
}
export default MindmapHome;
