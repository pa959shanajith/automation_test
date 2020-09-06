import React ,  { Fragment, useState } from 'react';
import CreateOptions from '../components/LeftBarItems.js'; 


/*Component Scrapescreen LeftBar
  use: renders ScrapeScreen LeftSide Bar page 
  todo: 
    add header, footer
*/


const ScrapeLeft = () => {
  const [options,setOptions] = useState(undefined)
  // const createType = {
  //   'addobject': React.memo((props) => (<span>Add Object</span>)),
  //   'map': React.memo((props) => (<span>Map Object</span>)),
  //   'compare': React.memo((props) => (<span>Compare Object</span>)),
  //   'create': React.memo((props) => (<span>Create Object</span>))
  // }
  // var Component = (!options)? null : createType[options];
  return (
    <Fragment>
      {(!options)?
          <CreateOptions setOptions={setOptions} />: null
          // <Component/>
      }
    </Fragment>
  );
}

export default ScrapeLeft;