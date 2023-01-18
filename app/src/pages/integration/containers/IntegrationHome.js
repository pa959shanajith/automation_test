import React, { useEffect , useState} from 'react';
import { useDispatch ,useSelector } from 'react-redux';
import {Header, FooterTwo as Footer, setMsg, ScreenOverlay, PopupMsg } from '../../global';
import Leftbar from '../components/Leftbar';
import Rightbar from '../components/Rightbar';
import ImportMappings from '../components/ImportMappings';
import ALM from './ALM';
import QTest from './QTest';
import Zephyr from './Zephyr';
import Jira from './Jira';
import * as actionTypes from '../state/action';
import '../styles/IntegrationHome.scss'

//Integration Screen main Home Renders--> Header, LefbarScreen , CenterScreen, RIghtbarScreen and Main FooterBar // 

const Integrations = () => {
    const dispatch = useDispatch();
    const screenType = useSelector(state=>state.integration.screenType);
    const showOverlay = useSelector(state => state.integration.showOverlay);
    const [importPop,setImportPop] = useState(false)

    useEffect(()=>{//persist the screentype of integration (implementation for bug#18796)
        let currScreenType = window.localStorage['integrationScreenType'];
        if (currScreenType)
            dispatch({type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: currScreenType});
        else 
            dispatch({type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: null});
        dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null });
    }, [dispatch])

    const displayError = (error) =>{
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        setMsg(error)
    }

    return(
        <>
        { showOverlay && <ScreenOverlay content={showOverlay} /> }
        {importPop?<ImportMappings displayError={displayError} setImportPop={setImportPop}/>:null}
        <div className="parent">
            <Header/>
            <div id="holder">
                <Leftbar setImportPop={setImportPop} />

                <div className="integration_middleContent">
                    { screenType === 'ALM' && <ALM /> }
                    { screenType === "Zephyr" && <Zephyr /> }
                    { screenType === "qTest" && <QTest /> }
                    { screenType === "Jira" && <Jira /> }
                </div>

                <Rightbar />
            </div>    
            <div className="integration_Footer"><Footer/></div>
        </div>
        </>
    )
}

export default Integrations;
