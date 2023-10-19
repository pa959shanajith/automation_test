import React, { useEffect, useRef } from 'react';
import SidePanel from './SidePanel';
import ProjectOverview from '../components/ProjectOverview';
import {RedirectPage, LandingContainer} from '../../global';
import SideNavBar from '../components/SideNav';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
export var navigate

const HomePage = () => {
    const toast = useRef();
    navigate= useNavigate();

    useEffect(() => {
        if (window.localStorage['navigateScreen'] !== "landing") {
            RedirectPage(navigate, { reason: "screenMismatch" });
        }
    }, []);

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
                sidePanel={<SidePanel toastError={toastError} toastSuccess={toastSuccess}/>}
                contentPage={<ProjectOverview  toastError={toastError} toastSuccess={toastSuccess} />}
            ></LandingContainer>
        </>
    )
}

export default HomePage;