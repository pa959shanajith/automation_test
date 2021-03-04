import React, { useEffect } from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import Header from '../../global/components/Header';
import Footer from '../../global/components/FooterTwo';
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

    useEffect(()=>{//persist the screentype of integration (implementation for bug#18796)
        let currScreenType = window.localStorage['integrationScreenType'];
        if (currScreenType) {
            dispatch({type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: currScreenType});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return(
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
    )
}

export default Integrations;
