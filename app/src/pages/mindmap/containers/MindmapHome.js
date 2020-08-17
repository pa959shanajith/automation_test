import React ,  { Fragment, useState } from 'react';
import CreateOptions from '../components/CreateOptions.js'; 
import CreateNew from './CreateNew.js'

/*Component MindmapHome
  use: renders mindmap plugins landing page 
  todo: 
    add header, footer, sidebars , tabtitleinfo
*/

const MindmapHome = () => {
  const [options,setOptions] = useState(undefined)
  const createType = {
    'newmindmap': React.memo((props) => (<CreateNew {...props}/>)),
    'enemindmap': React.memo((props) => (<span>END TO END MINDMAP</span>)),
    'excelmindmap': React.memo((props) => (<span>Import Excel</span>))
  }
  var Component = (!options)? null : createType[options];
  return (
    <Fragment>
      {(!options)?
          <CreateOptions setOptions={setOptions}/>:
          <Component/>
      }
    </Fragment>
  );
}

export default MindmapHome;