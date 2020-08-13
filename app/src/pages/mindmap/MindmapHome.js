import React ,  { Fragment, useState } from 'react';
import CreateOptions from './components/CreateOptions.js'; 
import './styles/MindmapHome.scss'

/*Component MindmapHome
  use: renders mindmap plugins landing page 
  note: 
    add header, footer, sidebars 
*/

const MindmapHome = () => {
  const [options,setOptions] = useState(undefined)
  return (
    <Fragment>
      {/* <Header/> */}
      {(!options)?
          <CreateOptions setOptions={setOptions}/>:
          <CreateMindmap options={options}/>  
      }
      {/* <Footer/> */}
    </Fragment>
  );
}

/*Component CreateMindmap
  use: renders mindmap create screen based on selected options
  note: 
    returns null when refreshed 
*/

const CreateMindmap = (props) => {
  return(
  <div>{props.options}</div>
  )
}

export default MindmapHome;