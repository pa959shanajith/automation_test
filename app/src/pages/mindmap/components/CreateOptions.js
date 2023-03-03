import React, { Fragment, useState } from 'react';
import {setMsg, ScreenOverlay} from '../../global'
import ImportMindmap from './ImportMindmap';
import '../styles/CreateOptions.scss'

/*Component CreateOptions
  use: renders 3 options to create mindmap in the center of screen
  props: 
    setoptions from mindmapHome.js 
*/

const CreateOptions = (props) => {
  const [importPop,setImportPop] = useState(false)
  const [blockui,setBlockui] = useState({show:false})
  const options = [
    {ico : "ic-create-newMindmap.png",label:'Create New',comp:'newmindmap'},
    {ico : "ic-endtoendFlow.png",label:'End to End Flow',comp:'enemindmap'},
    // {ico :"ic-importfromexcel-mindmap.png",label:'Import Mindmap',comp:'importmindmap'}
  ]
  const displayError = (error) =>{
    setBlockui({show:false})
    setMsg(error)
  }
  return (
    <Fragment>
      {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
      {importPop?<ImportMindmap setBlockui={setBlockui} setOptions={props.setOptions} displayError={displayError} setImportPop={setImportPop} isMultiImport={false}/>:null}
      <div className='mindmap__option-container'>
        <div>
          {options.map((e,i)=>(
            <div className='mindmap__option-box' onClick={()=>{(e.comp === 'importmindmap')?setImportPop(true):props.setOptions(e.comp)}} key={i} data-test="OptionBox" title={e.label}>
              <div>
                <img src={"static/imgs/"+e.ico} alt={e.label}/>
                <div>{e.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
}

export default CreateOptions;