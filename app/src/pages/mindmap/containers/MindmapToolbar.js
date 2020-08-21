import React from 'react';
import Toolbarmenu from '../components/ToolbarMenu';
import ModuleListDrop from '../components/ModuleListDrop'
import '../styles/MindmapToolbar.scss'
import 'font-awesome/css/font-awesome.min.css';

/*Component MindmapToolbar
  use: returns Mindmap Toolbar for create new
  todo: 
    add user permission check 
*/

const MindmapToolbar = () => {
  return (
    <div className='toolbar__container'>
        <Toolbarmenu/>
        <ModuleListDrop/>
    </div>
  );
}

export default MindmapToolbar;