import React, { useState, useLayoutEffect, Fragment, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

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
    verticalbarWidth: number
    scrollId : container id
*/

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

const ScrollBar = (props) => {

    const [width, height] = useWindowSize();

    useEffect(()=>{

    }, [width, height])

    return(
        <>
         <Fragment>
         <style type="text/css">
                {`
                .ps > .ps__rail-x,
                .ps > .ps__rail-y {
                    opacity: 1!important; 
                }
 
                ${props.scrollId?'#'+props.scrollId+' > .ps ':''}.ps__thumb-y,
                ${props.scrollId?'#'+props.scrollId+' > .ps ':''}.ps__thumb-y:hover {
                    opacity: 1!important;
                    left: 0;
                    right: 0;
                    width: ${props.verticalbarWidth?props.verticalbarWidth:'6px'}!important;
                    background:${props.thumbColor?props.thumbColor:'#000'}!important;
                }
                ${props.scrollId?'#'+props.scrollId+' > .ps ':''}.ps__rail-y, 
                ${props.scrollId?'#'+props.scrollId+' > .ps ':''}.ps__rail-y:hover {
                    border-radius: 3px;
                    margin-right: 2px;
                    background: ${props.trackColor?props.trackColor:'white'}!important;
                    width: ${props.verticalbarWidth?props.verticalbarWidth:'6px'}!important;
                    ${(props.hideYbar)?'visibility: hidden!important':''};
                }
                ${
                    props.hoverColor ? 
                    `${props.scrollId?`#${props.scrollId}:hover > .ps `:''}.ps__thumb-y,
                    ${props.scrollId?`#${props.scrollId}:hover > .ps `:''}.ps__thumb-y:hover {
                        background:${props.hoverColor}!important;
                    }
                    `
                    : ''
                }

                ${props.scrollId?'#'+props.scrollId+' > .ps ':''}.ps__thumb-x,
                ${props.scrollId?'#'+props.scrollId+' > .ps ':''}.ps__thumb-x:hover {
                    opacity: 1!important;
                    left: 0;
                    right: 0;
                    height: ${props.horizontalbarWidth?props.horizontalbarWidth:'6px'}!important;
                    background:${props.thumbColor?props.thumbColor:'#000'}!important;
                }
                ${props.scrollId?'#'+props.scrollId+' > .ps ':''}.ps__rail-x, 
                ${props.scrollId?'#'+props.scrollId+' > .ps ':''}.ps__rail-x:hover {
                    border-radius: 3px;
                    margin-right: 2px;
                    background: ${props.trackColor?props.trackColor:'white'}!important;
                    height: ${props.horizontalbarWidth?props.horizontalbarWidth:'6px'}!important;
                    ${(props.hideYbar)?'visibility: hidden!important':''};
                }
                ${
                    props.hoverColor ? 
                    `${props.scrollId?`#${props.scrollId}:hover > .ps `:''}.ps__thumb-x,
                    ${props.scrollId?`#${props.scrollId}:hover > .ps `:''}.ps__thumb-x:hover {
                        background:${props.hoverColor}!important;
                    }
                    `
                    : ''
                }
                `}
            </style> 
            <PerfectScrollbar options={{minScrollbarLength:props.minScrollbarLength,wheelPropagation:true,suppressScrollX:props.hideXbar, useBothWheelAxes:false,suppressScrollY:props.hideYbar}} style={{maxHeight:'inherit',height:'inherit'}} onScrollX={props.onScrollX} onScrollY={props.onScrollY} >
                {props.children}
            </PerfectScrollbar>
        </Fragment>
        </>
    )
}

export default ScrollBar;