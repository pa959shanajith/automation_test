import React from 'react';
import { Scrollbars} from 'react-custom-scrollbars';
import '../styles/Scrollbar.scss'

/*Component Scrollbar
  use: Wrapper function extends react-custom-scollbars;
  props: 
    styles for horizontalTrack,horizontalThumb,verticalTrack,verticalThumb,
    thumbSize
*/

const Scrollbar = (props) => {
  const horizontalTrack = {
    ...props.horizontalTrack
  }
  const horizontalThumb = {
    ...props.horizontalThumb
  }
  const verticalTrack = {
    ...props.verticalTrack
  }
  const verticalThumb = {
    ...props.verticalThumb
  }
  const thumbSize = (props.thumbSize)?props.thumbSize:60
  return (
    <Scrollbars
    hideTracksWhenNotNeeded={true}
    thumbSize = {thumbSize}
    renderTrackHorizontal={({ style, ...props }) => <div {...props} style={{...style,...horizontalTrack}} className="track-horizontal"/>}
    renderTrackVertical={({ style, ...props }) => <div {...props} style={{...style,...verticalTrack}} className="track-vertical"/>}
    renderThumbHorizontal={({ style, ...props }) => <div {...props} style={{...style,...horizontalThumb}} className="thumb-horizontal"/>}
    renderThumbVertical={({ style, ...props }) => <div {...props} style={{...style,...verticalThumb}} className="thumb-vertical"/>}
    renderView={props => <div {...props} className="view"/>}>
      {props.children}
    </Scrollbars>
  );
}

export default Scrollbar;