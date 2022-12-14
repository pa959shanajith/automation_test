import React, { useState, Fragment, useEffect } from 'react';
import { Header, FooterTwo as Footer,ActionBar,ReferenceBar, setMsg, ScreenOverlay} from '../../global'
import CreateOptions from '../components/CreateOptions.js'; 
import CreateNew from './CreateNew.js';
import ImportMindmap from'../components/ImportMindmap.js';
import {exportMindmap, getProjectList, getModules} from '../api';
import '../styles/MindmapHome.scss';
import {Messages as MSG} from '../../global';
import {parseProjList} from './MindmapUtils';
import {useDispatch, useSelector} from 'react-redux';


/*Component MindmapHome
  use: renders mindmap plugins landing page 
  todo: 
    import header, footer, and list of side bar element for differnet page
*/
const MindmapHome = () => {
  const [options,setOptions] = useState(undefined)
  const [importPop,setImportPop] = useState(false)
  const [blockui,setBlockui] = useState({show:false})
  const selectProj = useSelector(state=>state.mindmap.selectedProj)
  const createType = {
    'newmindmap': React.memo(() => (<CreateNew/>)),
    'importmodules':React.memo(() => (<CreateNew importRedirect={true}/>))
 
    
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
        projectid:selectProj?selectProj:res.projectId[0],
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
  var Component = createType["newmindmap"];
  return (
    <div className='mp__container'>
      <Header/> 
      <div className='mp__body'>
        <ActionBar collapsible={false} collapse={"newmindmap"}>
          <div className="mp__ic_box">
            <div className="ic_box" title="Create">
              <img onClick={()=>setOptions(undefined)} alt='Create Mindmap' className={"thumb__ic"+(options!=='assignmap' && options!=='importmodules'? " selected_rb_thumb":"")} src="static/imgs/create.png"/>
                <span className="rb_box_title">Create</span>
            </div>
            <div className="ic_box" title="Assign">
              <img onClick={()=>setOptions('assignmap')} alt='Assign Mindmap' className={"thumb__ic"+(options==='assignmap'? " selected_rb_thumb":"")} src="static/imgs/assign.png"/>
              <span className="rb_box_title">Assign</span>
            </div>
            <div className="ic_box" title="Import Modules">
              <img onClick={()=>{setOptions('importmodules');setImportPop(true);}} alt='Import Modules' className={"thumb__ic"+(options==='importmodules'? " selected_rb_thumb":"")} src="static/imgs/ic-import-script.png"/>
              <span className="rb_box_title">Import Modules</span>
            </div>
          </div> 
      </ActionBar>
        <Fragment>
          {importPop?<ImportMindmap setBlockui={setBlockui} setOptions={setOptions} displayError={displayError} setImportPop={setImportPop} isMultiImport={true} />:null}
          <Component/>
        </Fragment>        
        {/* } */}
      </div>
      <div className='mp__footer'><Footer/></div>
    </div>
  );
}
export default MindmapHome;
