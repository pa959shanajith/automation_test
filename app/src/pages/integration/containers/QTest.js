import React ,{useState, useRef, useEffect} from 'react';
import { RedirectPage, VARIANT, Messages as MSG  } from '../../global';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { loginToQTest_ICE, viewQtestMappedList_ICE } from '../api.js';
import LoginModal from '../components/LoginModal';
import MappedPage from '../containers/MappedPage';
import QTestContent from '../components/QTestContent.js';
import * as actionTypes from '../state/action.js';

const  QTest = props => {

    const history = useHistory();
    const dispatch = useDispatch()
    const user_id = useSelector(state=> state.login.userinfo.user_id); 
    const screenType = useSelector(state=>state.integration.screenType);
    const viewMappedFiles = useSelector(state=>state.integration.mappedScreenType);
    const urlRef = useRef();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const [domainDetails , setDomainDetails] = useState([]);
    const [mappedFilesICERes , setMappedFIlesICERes]= useState([]);
    const [loginSuccess , setLoginSuccess] = useState(false);
    const [loginError, setLoginError]= useState(null);

    useEffect(() => {
        return ()=>{
            dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
            dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
            dispatch({
                type: actionTypes.SEL_TC_DETAILS, 
                payload: {
                    selectedTCNames: [],
                    selectedTSNames: [],
                    selectedFolderPaths: []
                }
            });
            dispatch({type: actionTypes.SYNCED_TC, payload: []});
            dispatch({type: actionTypes.SEL_TC, payload: []});
        }
    }, [])

    const loginQtest = async() => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Logging...'});
        const qcPassword = passwordRef.current.value;
        const qcURL = urlRef.current.value;
        const qcUsername = usernameRef.current.value;
        const domainDetails = await loginToQTest_ICE(qcPassword, qcURL, qcUsername);
        
        if(domainDetails.error) dispatch({type: actionTypes.SHOW_POPUP, payload:domainDetails.error});
        else if(domainDetails === "unavailableLocalServer") setLoginError("ICE Engine is not available, Please run the batch file and connect to the Server.");
        else if (domainDetails === "invalidcredentials") setLoginError("Invalid Credentials , Retry Login")
        else if (domainDetails === "scheduleModeOn") setLoginError("Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
        else if (domainDetails === "Invalid Session"){
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
            return RedirectPage(history);
        }
        else if(domainDetails === "invalidcredentials") setLoginError("Invalid Credentials");
        else if (domainDetails === "invalidurl") setLoginError("Invalid URL");
        else if (domainDetails === "fail") setLoginError("Fail to Login");
        else if (domainDetails === "Error:Failed in running Qc") setLoginError("Unable to run Qc");
        else if(domainDetails === "Error:Qc Operations") setLoginError("Failed during execution");
        else{
            setDomainDetails(domainDetails);
            setLoginSuccess(true);
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }

    const onViewMappedFiles = async() => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        const mappedResponse = await viewQtestMappedList_ICE(user_id)
        if(mappedResponse.length === 0){
            dispatch({type: actionTypes.SHOW_POPUP, payload: MSG.INTEGRATION.WARN_NO_MAPPED_DETAILS});
        }
        else{
            dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: "qTest" });
            setMappedFIlesICERes(mappedResponse);
        }
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    
    return (<>
        {viewMappedFiles === "qTest" ? 
            <MappedPage
                screenType="qTest"
                leftBoxTitle="qTest Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedFilesICERes}
            /> : 
        <>
        { !loginSuccess &&
            <LoginModal 
                urlRef={urlRef}
                usernameRef={usernameRef}
                passwordRef={passwordRef}
                error={loginError}
                screenType={screenType}
                login={loginQtest}
            />
        }
        { screenType === "qTest" &&
            <QTestContent
                onViewMappedFiles={onViewMappedFiles}
                domainDetails={domainDetails}
            />   
        }
        </>
        }
        </>
    
    )
}

export default QTest;


