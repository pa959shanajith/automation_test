import React, { Fragment } from 'react';
import Toolbarmenu from '../components/ToolbarMenu';
import ModuleListDrop from '../components/ModuleListDrop'
import '../styles/MindmapToolbar.scss'

/*Component MindmapToolbar
  use: returns Mindmap Toolbar for create new
  todo: 
    add user permission check 
*/

const MindmapToolbar = () => {
  return (
    <Fragment>
      <div className='toolbar__container'>
          <Toolbarmenu/>
      </div>
      <ModuleListDrop/>
    </Fragment>
  );
}

export default MindmapToolbar;