import React, { useState, useLayoutEffect, Fragment, useEffect, useRef } from 'react';
import { ScrollPanel } from 'primereact/scrollpanel';
// import PerfectScrollbar from 'react-perfect-scrollbar';
// import 'react-perfect-scrollbar/dist/css/styles.css';

/*Component Scrollbar
  use: Wrapper function extends react-custom-scollbars;
  props: 
    styles for horizontalTrack,horizontalThumb,verticalTrack,verticalThumb,
    minScrollbarLength: number
    trackColor : color
    thumbColor : color
    hideYbar : boolean 
    hideXbar : boolean 
    verticalbarWidth: number
    scrollId : container id
*/

let refEvent = new CustomEvent('updateScrollBar');

function updateScrollBar(){
    dispatchEvent(refEvent);
}

function useUpdateScrollBar() {
    const [temp, setTemp] = useState([]);
    useLayoutEffect(() => {
        function updateSize() {
            setTemp([])
        }
        window.addEventListener('updateScrollBar', updateSize);
        updateSize();
        return () => window.removeEventListener('updateScrollBar', updateSize);
    }, []);
    return temp;
}

const ScrollBar = (props) => {
    
    const [temp] = useUpdateScrollBar();
    const scrollRef = useRef();

  useLayoutEffect(() => {
    function updateSize() {
      dispatchEvent(refEvent);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
      }, []);
      
    return(
        <>
         <Fragment>
         <style type="text/css">
                {`
                .p-scrollpanel-thumb {
                    opacity: 1!important;
                    width: ${props.verticalbarWidth?props.verticalbarWidth:'6px'}!important;
            background:${props.thumbColor?props.thumbColor:'#000'}!important;
          }
          
          .p-scrollpanel-track {
            border-radius: 3px;
            background: ${props.trackColor?props.trackColor:'white'}!important;
            width: ${props.verticalbarWidth?props.verticalbarWidth:'6px'}!important;
            ${(props.hideYbar)?'visibility: hidden!important':''};
          }

          .p-scrollpanel-thumb-x {
            opacity: 1!important;
            height: ${props.horizontalbarWidth?props.horizontalbarWidth:'6px'}!important;
            background:${props.thumbColor?props.thumbColor:'#000'}!important;
          }         
          .p-scrollpanel-track-x {
                    border-radius: 3px;
                    background: ${props.trackColor?props.trackColor:'white'}!important;
                    height: ${props.horizontalbarWidth?props.horizontalbarWidth:'6px'}!important;
                    ${(props.hideYbar)?'visibility: hidden!important':''};
                }
        `}
        </style>
        <ScrollPanel ref={scrollRef} style={{ maxHeight: 'inherit', height: 'inherit' }}>
          {props.children}
        </ScrollPanel>
      </Fragment>
    </>
  );
};

const WrappedScrollBar = props => {
    return (
        <div className="scroll_bar_outerContainer" style={props.outerContainerStyle || {}}>
            <div className="scroll_bar_middleContainer" style={props.middleContainerStyle || {}}>
                <div className="scroll_bar_innerContainer" id={props.scrollId}>
                    <ScrollBar {...props} >
                        {props.children}
                    </ScrollBar>
                </div>
            </div>
        </div>
    );
}

export default ScrollBar;
export { updateScrollBar,WrappedScrollBar };