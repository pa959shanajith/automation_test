import React, { useEffect } from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import {Header, FooterTwo as Footer, ScreenOverlay, PopupMsg } from '../../global';
import Leftbar from '../components/Leftbar';
import Rightbar from '../components/Rightbar';
import ALM from './ALM';
import QTest from './QTest';
import Zephyr from './Zephyr';
import * as actionTypes from '../state/action';
import '../styles/IntegrationHome.scss'

//Integration Screen main Home Renders--> Header, LefbarScreen , CenterScreen, RIghtbarScreen and Main FooterBar // 

const Integrations = () => {
    const dispatch = useDispatch();
    const screenType = useSelector(state=>state.integration.screenType);
    const showPop = useSelector(state => state.integration.showPop);
    const showOverlay = useSelector(state => state.integration.showOverlay);

    useEffect(()=>{//persist the screentype of integration (implementation for bug#18796)
        let currScreenType = window.localStorage['integrationScreenType'];
        if (currScreenType) {
            dispatch({type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: currScreenType});
        }
    }, [])

    const PopupDialog = () => (
        <PopupMsg 
            title={showPop.title}
            close={()=>dispatch({type: actionTypes.SHOW_POPUP, payload: false})}
            content={showPop.content}
            submitText={showPop.submitText || "OK" }
            submit={ showPop.onClick 
                        ? showPop.onClick 
                        : ()=>dispatch({type: actionTypes.SHOW_POPUP, payload: false})
                    }
        />
    );

    return(
        <>
        { showPop && <PopupDialog /> }
        { showOverlay && <ScreenOverlay content={showOverlay} /> }
        <div className="parent">
            <Header/>
            <div id="holder">
                <Leftbar />

                <div className="integration_middleContent">
                    { screenType === 'ALM' && <ALM /> }
                    { screenType === "Zephyr" && <Zephyr /> }
                    { screenType === "qTest" && <QTest /> }
                </div>

                <Rightbar />
            </div>    
            <div className="integration_Footer"><Footer/></div>
        </div>
        </>
    )
}

export default Integrations;
