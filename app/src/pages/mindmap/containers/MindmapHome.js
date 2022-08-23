import React, { useState, Fragment } from 'react';
import { Header, FooterTwo as Footer,ActionBar,ReferenceBar, setMsg, ScreenOverlay} from '../../global'
import CreateOptions from '../components/CreateOptions.js'; 
import CreateNew from './CreateNew.js';
import CreateEnE from './CreateEnE.js'
import CreateAssign from './CreateAssign.js';
import ImportMindmap from'../components/ImportMindmap.js';
import {exportMindmap} from '../api';
import '../styles/MindmapHome.scss';
import {Messages as MSG} from '../../global';
import { useSelector } from 'react-redux';
import { data } from 'node-env-file';

/*Component MindmapHome
  use: renders mindmap plugins landing page 
  todo: 
    import header, footer, and list of side bar element for differnet page
*/
const MindmapHome = () => {
  const [options,setOptions] = useState(undefined)
  const [importPop,setImportPop] = useState(false)
  const [blockui,setBlockui] = useState({show:false})
  const selectedModule = useSelector(state=>state.mindmap.selectedModule)
  const selectedModulelist = useSelector(state=>state.mindmap.selectedModulelist)
  const selectedProj = useSelector(state=>state.mindmap.selectedProj)
  
  const createType = {
    'newmindmap': React.memo(() => (<CreateNew/>)),
    // 'importmindmap': React.memo(() => (<CreateNew importRedirect={true}/>)),
    'enemindmap': React.memo(() => (<CreateEnE/>)),
    'assignmap': React.memo(() => (<CreateAssign/>)),
    'importmodules':React.memo(() => (<CreateNew importRedirect={true}/>))
 
    
  }
  const setOptions1 = (data) =>{
    debugger;
    setOptions(data)
  }
  const displayError = (error) =>{
    setBlockui({show:false})
    setMsg(error)
  }
 
  const exportSelectedModules = () => {
   toJSON(selectedModulelist.length>0?selectedModulelist:selectedModule,selectedProj,displayError);
}
const toJSON = async(module,fname,displayError) => {
  try{
      var result =  await exportMindmap(Array.isArray(module)?module:module._id)
      if(result.error){displayError(result.error);return;}
      jsonDownload(fname+'.mm', JSON.stringify(result));
      setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
  }catch(err){
      console.error(err)
      displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP)
  }
}

function jsonDownload(filename, responseData) {
    var blob = new Blob([responseData], { type: 'text/json' });
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, true, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}
  const Component = (!options)? null : createType[options];
  return (
    <div className='mp__container'>
      <Header/> 
      <div className='mp__body'>
        <ActionBar collapsible={true} collapse={options}>
          <div className="mp__ic_box">
            <div className="ic_box" title="Create">
              <img onClick={()=>setOptions(undefined)} alt='Create Mindmap' className={"thumb__ic"+(options!=='assignmap'? " selected_rb_thumb":"")} src="static/imgs/create.png"/>
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
            <div className="ic_box" title="Export Modules">
              <img onClick={()=>exportSelectedModules()} alt='Export Modules' className={"thumb__ic"+(options==='exportmodules'? " selected_rb_thumb":"")} src="static/imgs/ic-export-script.png"/>
              <span className="rb_box_title">Export Modules</span>
            </div>
          </div> 
      </ActionBar>
        {(!options)?
        <Fragment>
          <div className='mp__middle_container'>
            <CreateOptions setOptions={setOptions1}/>
          </div>
          <ReferenceBar taskTop={true} collapsible={true} hideInfo={true}/>
        </Fragment>:
        <Fragment>
          {importPop?<ImportMindmap setBlockui={setBlockui} setOptions={setOptions} displayError={displayError} setImportPop={setImportPop} isMultiImport={true} />:null}
          <Component/>
        </Fragment>        
        }
      </div>
      <div className='mp__footer'><Footer/></div>
    </div>
  );
}
export default MindmapHome;
