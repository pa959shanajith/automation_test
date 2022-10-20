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

/*Component MindmapHome
  use: renders mindmap plugins landing page 
  todo: 
    import header, footer, and list of side bar element for differnet page
*/
const MindmapHome = () => {
  const [options,setOptions] = useState(undefined)
  const [importPop,setImportPop] = useState(false)
  const [blockui,setBlockui] = useState({show:false})
  // const selectedModule = useSelector(state=>state.mindmap.selectedModule)
  // const selectedModulelist = useSelector(state=>state.mindmap.selectedModulelist)
  // const selectedProj = useSelector(state=>state.mindmap.selectedProj)
  const[isCaptured,setIsCaptured]=useState(false)
  const[isCaptured1,setIsCaptured1]=useState(false)
  const[isCaptured2,setIsCaptured2]=useState(false)
  const[isCaptured3,setIsCaptured3]=useState(false)
  const createType = {
    'newmindmap': React.memo(() => (<CreateNew/>)),
    //'importmindmap': React.memo(() => (<CreateNew importRedirect={true}/>)),
    'enemindmap': React.memo(() => (<CreateEnE/>)),
    'assignmap': React.memo(() => (<CreateAssign/>)),
    'importmodules':React.memo(() => (<CreateNew importRedirect={true}/>))
 
    
  }
  const setOptions1 = (data) =>{
    setOptions(data)
  }
  const displayError = (error) =>{
    setBlockui({show:false})
    setMsg(error)
  }
 

//data-selected="true"
  var Component = (!options)? null : createType[options];
  return (
    <div className='mp__container'>
      <Header/> 
      <div className="breadcrumbs__container">
      <div style={{width: '2px',
    height: '39px',
    position: 'absolute',
    backgroundColor: '#5f338f',
    /* margin-right: -2rem; */
    left: '0px',
    zIndex:100,
    top: '5.2rem'}}></div>
            <ol className="breadcrumbs__elements" style={{ listStyle: "none", display: "flex", gap: "2px", flex:1, margin: '1px'}}>
                <li className="breadcrumbs__element__inner" data-selected={isCaptured?true:false} id={'bluecolor'} >
                    <span className="containerSpan"  ><p className="styledSpan" style={!isCaptured?{color:'#5f338f'}:null}>Mindmap</p></span>
                </li>
                <li className="breadcrumbs__element__inner" data-selected={isCaptured1?true:false} id={isCaptured?'bluecolor':'graycolor'}>
                    <span className="containerSpan"><p className="styledSpan" style={isCaptured?isCaptured1?{color:'white'}:{color:'#5f338f'}:{color:'gray'}}>Capture Element</p></span>
                </li>
                <li className="breadcrumbs__element__inner" data-selected={isCaptured2?true:false} id={isCaptured1?'bluecolor':'graycolor'}>
                    <span className="containerSpan"><p className="styledSpan" style={isCaptured1?isCaptured2?{color:'white'}:{color:'#5f338f'}:{color:'gray'}}>Design Test Case</p></span>
                </li>
                <li className="breadcrumbs__element__inner" data-selected={isCaptured3?true:false} id={isCaptured2?'bluecolor':'graycolor'}>
                    <span className="containerSpan"><p className="styledSpan" style={isCaptured2?isCaptured3?{color:'white'}:{color:'#5f338f'}:{color:'gray'}}>Execute Test Case</p></span>
                </li>
            </ol>
            <div style={{width: '2px',
    height: '39px',
    position: 'absolute',
    backgroundColor: '#5f338f',
    /* margin-right: -2rem; */
    right: '0px',
    top: '5.2rem'}}></div>

      </div>
      <div className='mp__body'>
        <ActionBar collapsible={true} collapse={options}>
          <div className="mp__ic_box">
            <div className="ic_box" title="Create">
              <img onClick={()=>setOptions(undefined)} alt='Create Mindmap' className={"thumb__ic"+(options==='createmindmap'? " selected_rb_thumb":"")} src="static/imgs/create.png"/>
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
            {/* <div className="ic_box" title="Export Modules">
              <img onClick={()=>exportSelectedModules()} alt='Export Modules' className={"thumb__ic"+(options==='exportmodules'? " selected_rb_thumb":"")} src="static/imgs/ic-export-script.png"/>
              <span className="rb_box_title">Export Modules</span>
            </div> */}
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
