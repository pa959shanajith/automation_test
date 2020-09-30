import React from 'react';
import MindmapHome from './containers/MindmapHome';
import { useHistory } from 'react-router-dom';
export var history
/*Component Mindmap
  use: direct to mindmap landing page
  todo: 
    add user permission check 
*/

const Mindmap = () => {
  history =  useHistory()
  return (
    <MindmapHome/>
  );
}

export default Mindmap;