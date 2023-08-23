import React, { useEffect, useState } from 'react';
import { Quotes } from './OverlayQuotes';
import '../styles/ScreenOverlayImpact.scss'

/*Component ScreenOverlay
  use: block screen while loading something in background;
  props: 
    content : "content to be shown in the box"
*/

const ScreenOverlayImpact = (props) => {

    const [quoteIndex, setQuoteIndex] = useState(0);
    const[showStatus,setShowStatus]=useState(false)

    useEffect(()=>{
        let quoteInterval = setInterval(()=>{
            setQuoteIndex(oldIndex => getRandomIndex(oldIndex));
        }, 4000)
        return () => clearInterval(quoteInterval);
    }, [])

    useEffect(()=>{
        setShowStatus(true)
    let timer=setTimeout(()=>{
        setShowStatus(false)
    },10000)
    return () => clearTimeout(timer);

    },[props])

    return(
        <div className='overlay__container'>
            <div className='overlay__subContainer overlay__top'>
                <img className="overlay__loading" src="static/imgs/loading.gif" />
               <div className='overlay__content'>{props.content}</div>
               <span className='overlay__text'>
                    { Quotes[quoteIndex] }
                </span>
            </div>
            <div className='overlay__subContainer overlay__bottom'>
            {(showStatus && props.marqueItems.screenName)?<div style={{display:'flex',color:'white',flexDirection:'column',gap:'10px',marginTop:'2rem',width:'20rem' }}>
                
                
                <div style={{display:'flex',color:'white',flexDirection:'column'}}>
                <div>Screen Name:{props.marqueItems.screenName}</div>
               {props.marqueItems.changed ?  <div className="align__marques" >{props.marqueItems.changed} elements got changed<span><img src="static/imgs/warning_icon.svg" className='accordion_icons'></img></span></div>:null}
               {props.marqueItems.notfound ? <div className="align__marques">{props.marqueItems.notfound} elements not found<span><img src="static/imgs/danger.svg" className='accordion_icons'></img></span></div>:null}
               {props.marqueItems.newlyfound ? <div className="align__marques">{props.marqueItems.newlyfound} new elements found<span><img src="static/imgs/brain.svg" className='accordion_icons'></img></span></div>:null}
               {props.marqueItems.unchanged ? <div className="align__marques">{props.marqueItems.unchanged} elements remain unchanged<span><img src="static/imgs/success.svg" className='accordion_icons'></img></span></div>:null}
                </div>
                
                </div>:null}
                
            </div>
        </div>
    )
}

function getRandomIndex (oldIndex) {
    let result = oldIndex;
    while (result === oldIndex ) {
        result = Math.floor(Math.random() * (Quotes.length-1));
    }
    return result;
}

export default ScreenOverlayImpact