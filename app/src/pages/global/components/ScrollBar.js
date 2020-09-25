import React, { Fragment } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css'

/*Component Scrollbar
  use: Wrapper function extends react-custom-scollbars;
  props: 
    styles for horizontalTrack,horizontalThumb,verticalTrack,verticalThumb,
    maxThumbSize : number
    minThumbSize : number
    trackColor : color
    thumbColor : color
    hideYbar : boolean 
    hideXbar : boolean 
    scrollId : container id
*/

const ScrollBar = (props) => {
    return(
        <Fragment>
            <style type="text/css">
                {`
                ${props.scrollId?'#'+props.scrollId+' ':''}.simplebar-scrollbar:before {
                    top: 0px;
                    bottom: 0px;
                    left: 0px;
                    right: 0px;
                    opacity: 1!important;
                    background:${props.thumbColor?props.thumbColor:'#000'};
                }
                ${props.scrollId?'#'+props.scrollId+' ':''}.simplebar-track.simplebar-vertical {
                    top: 2px;
                    bottom: 2px;
                    right: 2px;
                    border-radius: 3px;
                    background: ${props.trackColor?props.trackColor:'white'};
                    width: ${props.verticalbarWidth?props.verticalbarWidth:'6px'};
                    ${(props.hideYbar)?'visibility: hidden!important':''};
                }
                ${props.scrollId?'#'+props.scrollId+' ':''}.simplebar-track.simplebar-horizontal {
                    background: ${props.trackColor?props.trackColor:'white'};
                    left: 0;
                    height: 10px;
                    ${(props.hideXbar)?'visibility: hidden!important':''};
                }
                `}
            </style>
            <SimpleBar scrollbarMaxSize={props.maxThumbSize?props.maxThumbSize:0} scrollbarMinSize={props.maxThumbSize?props.maxThumbSize:25} autoHide={false} style={{height:'inherit'}}>
                {props.children}
            </SimpleBar>
        </Fragment>
    )
}

export default ScrollBar;