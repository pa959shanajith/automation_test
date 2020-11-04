import React, { Fragment } from 'react';
import Toolbarmenu from '../components/ToolbarMenu';
import ModuleListDrop from '../components/ModuleListDrop'
import '../styles/MindmapToolbar.scss'

/*Component MindmapToolbar
  use: returns Mindmap Toolbar for create new
  todo: 
    add user permission check 
*/

const MindmapToolbar = (props) => {
  return (
    <Fragment>
      <div className='toolbar__container'>
          <Toolbarmenu setBlockui={props.setBlockui} setPopup={props.setPopup}/>
      </div>
      <ModuleListDrop setPopup={props.setPopup}/>
    </Fragment>
  );
}

export default MindmapToolbar;