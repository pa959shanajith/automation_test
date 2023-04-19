import React, { useRef, useState, useEffect, Fragment } from 'react';
import { RedirectPage, Messages as MSG, setMsg } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AzureContent from '../components/AzureContent';
import MappedPage from './MappedPage';
import LoginModal from '../components/LoginModal';
// import ZephyrUpdateContent from '../components/ZephyrUpdateContent';
import * as api from '../api.js';
import * as actionTypes from '../state/action.js';
// 0 vvimport "../styles/TestList.scss"
const Azure = () => {
    const history = useHistory();
    const dispatch= useDispatch();
    const user_id = useSelector(state=> state.login.userinfo.user_id);
    const screenType = useSelector(state=>state.integration.screenType); 
    const viewMappedFlies = useSelector(state=>state.integration.mappedScreenType);
    const SolmanUrlRef = useRef();
    const AzureUsernameRef = useRef();
    const AzureUrlRef = useRef();
    const AzurePATRef = useRef();
    const SolmanAuthTokenRef = useRef();
    const [domainDetails , setDomainDetails] = useState(null);
    const [loginSuccess , setLoginSuccess]=useState(false);
    const [loginError , setLoginError]= useState(null);
    const [mappedfilesRes,setMappedFilesRes]=useState([]);
    const [authType, setAuthType]=useState("basic");
    

    return(<>
      <LoginModal 
                urlRef={AzureUrlRef}
                usernameRef={AzureUsernameRef}
                passwordRef={AzurePATRef}
                // authtokenRef={SolmanAuthTokenRef}
                authType={authType}
                setAuthType={setAuthType}
                screenType={screenType}
                error={loginError}
                setLoginError={setLoginError}
                login={" "}
            />
        {/* {viewMappedFlies === "ZephyrUpdate" &&
            <ZephyrUpdateContent 
                domainDetails={domainDetails}
                setDomainDetails={setDomainDetails}
            />
        } */}
          {/* {viewMappedFlies === "ADO" && 
            <MappedPage
                screenType="Solman"
                leftBoxTitle="Solman Tests"
                rightBoxTitle="Avo Assure Scenarios"
                mappedfilesRes={mappedfilesRes}
                fetchMappedFiles={null}
            /> 
        }  */}
        {/* { viewMappedFlies ===null && !loginSuccess && 
            <LoginModal 
                urlRef={SolmanUrlRef}
                usernameRef={SolmanUsernameRef}
                passwordRef={SolmanPasswordRef}
                authtokenRef={SolmanAuthTokenRef}
                authType={authType}
                setAuthType={setAuthType}
                screenType={screenType}
                error={loginError}
                setLoginError={setLoginError}
                login={" "}
            /> } */}
        {/* { viewMappedFlies ===null && screenType=== "ADO" &&
            <SolmanContent
                domainDetails={()=>{}}
                callViewMappedFiles={()=>{}}
                callUpdateMappedFiles={()=>{}}
            /> } */}
        </> 
    )
}
export default Azure;