import React, { useState } from 'react';
import CreateOptions from '../components/CreateOptions.js'; 
import CreateNew from './CreateNew.js';
import { Header, FooterTwo as Footer} from '../../global'
import '../styles/MindmapHome.scss';

/*Component MindmapHome
  use: renders mindmap plugins landing page 
  todo: 
    import header, footer, and list of side bar element for differnet page
*/

const MindmapHome = () => {
  const [options,setOptions] = useState(undefined)
  const createType = {
    'newmindmap': React.memo(() => (<CreateNew/>)),
    'enemindmap': React.memo(() => (<span>END TO END MINDMAP</span>)),
    'excelmindmap': React.memo(() => (<span>Import Excel</span>))
  }
  var Component = (!options)? null : createType[options];
  return (
    <div className='mp__container'>
      <Header/> 
      <div className='mp__body'>
        <div className='mp__leftbar'></div>
        {(!options)?
          <CreateOptions setOptions={setOptions}/>:
          <Component/>
        }
        <div className='mp__rightbar'></div>
      </div>
      <div className='mp__footer'><Footer/></div>
    </div>
  );
}

export default MindmapHome;