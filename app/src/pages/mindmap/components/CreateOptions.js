import React from 'react';
import '../styles/CreateOptions.scss'

/*Component CreateOptions
  use: renders 3 options to create mindmap in the center of screen
  props: 
    setoptions from mindmapHome.js 
*/

const CreateOptions = (props) => {
  const options = [
    {ico : "ic-create-newMindmap.png",label:'CREATE NEW',comp:'newmindmap'},
    {ico : "ic-endtoendFlow.png",label:'End to End Flow',comp:'enemindmap'},
    {ico :"ic-importfromexcel-mindmap.png",label:'Import From Excel',comp:'excelmindmap'}
  ]
  return (
    <div className='mindmap__option-container'>
      <div>
        {options.map((e,i)=>(
          <div className='mindmap__option-box' onClick={()=>props.setOptions(e.comp)} key={i}>
            <div>
              <img src={"static/imgs/"+e.ico} alt={e.label}/>
              <div>{e.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreateOptions;