import React, { useEffect, useRef, useState } from 'react';
import SidePanel from './SidePanel';
import ProjectOverview from '../components/ProjectOverview';
import {RedirectPage, LandingContainer} from '../../global';
import SideNavBar from '../components/SideNav';
import { Toast } from 'primereact/toast';
import { validateProject } from '../api';
import { useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
export var navigate

const HomePage = () => {
    const [validateProjectLicense, setValidateProjectLicense] = useState(false);
    const toast = useRef();
    navigate= useNavigate();
    const savedCreateProject = useSelector((state) => state.landing.savedNewProject);
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if(!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo ;

    // useEffect(() => {
    //     if (window.localStorage['navigateScreen'] !== "landing") {
    //         RedirectPage(navigate, { reason: "screenMismatch" });
    //     }
    // }, []);

    useEffect(() => {
        if ( userInfo?.rolename === "Quality Manager") {
          (async () => {
            try {
              const validateCreateProject = await validateProject();
              setValidateProjectLicense(validateCreateProject);
            } catch (error) {
              console.error("API request failed:", error);
            }
          })();
        }
      }, [userInfo?.rolename, savedCreateProject]);

    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
    }

    const toastWarn = (warnMessage) => {
        if (warnMessage.CONTENT) {
            toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
    }

    const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
    }
    return (
        <>
            <Toast ref={toast} position="bottom-center" baseZIndex={9999} />

            <LandingContainer
                sideNavBar={<SideNavBar />}
                sidePanel={<SidePanel validateProjectLicense={validateProjectLicense} toastError={toastError} toastSuccess={toastSuccess}/>}
                contentPage={<ProjectOverview validateProjectLicense={validateProjectLicense} toastError={toastError} toastSuccess={toastSuccess} />}
            ></LandingContainer>
        </>
    )
}

export default HomePage;