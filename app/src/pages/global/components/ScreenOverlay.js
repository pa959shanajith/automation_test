import React from 'react';
import '../styles/ScreenOverlay.scss'

/*Component ScreenOverlay
  use: block screen while loading something in background;
  props: 
    content : "content to be shown in the box"
*/

const ScreenOverlay = (props) => {
    return(
        <div className='overlay__container'>
            <div className='overlay__content'>{props.content}</div>
        </div>
    )
}

export default ScreenOverlay;