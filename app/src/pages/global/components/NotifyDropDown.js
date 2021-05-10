import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../../login/state/action';
import { ScrollBar } from '../../global';
import '../styles/NotifyDropDown.scss'

/*Component NotifyDropDown
  use: renders notification dropdown imported in Header.js
*/

const NotifyDropDown = ({show}) =>{
    const dispatch = useDispatch();
    const notify = useSelector(state=>state.login.notify.data)
    useEffect(()=>{
        if(show){
            dispatch({type: actionTypes.UPDATE_NOTIFY_COUNT, payload: 0});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[show])
    const clearAll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(e.nativeEvent){
            e.nativeEvent.stopImmediatePropagation()
        }
        dispatch({type: actionTypes.CLEAR_NOTIFY, payload: 'all'});
    }
    return(
        <div id='notify-dropdown' className={'dropdown-menu'+(show?' show':'')}>
            <div id='message-box-notify' className='message-box'>
            <ScrollBar thumbColor={'grey'} verticalbarWidth={'5px'} scrollId='message-box-notify'>
                {
                    (notify.length>0)?
                    <Fragment>
                        <span onClick={clearAll} className='clear'>Clear</span>
                        {notify.map((e,i)=>(
                        <div key={i+'notify'} className='message' style={{borderBottom:(i === notify.length-1)?'none':'1px solid #eee'}}>
                            <span>Received on: {e.dateTime} </span><br/>
                            <span> {e.notifyMsg} </span>
                        </div>
                        ))}
                    </Fragment>:
                    <div key={'notify'} className='message' style={{textAlign:'center'}}>
                        <span>No new notifications</span>
                    </div>
                }
            </ScrollBar>
            </div>
        </div>
    )
}

export default NotifyDropDown;