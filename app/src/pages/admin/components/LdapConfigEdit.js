import React, { useState, useEffect } from 'react';
import { ScreenOverlay, ModalContainer, Messages as MSG, VARIANT } from '../../global'
import { getLDAPConfig } from '../api';
import '../styles/LdapConfigEdit.scss'
import LdapConfigurationForm from './LdapConfigurationForm';
import LdapDataMapping from '../components/LdapDataMapping';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';



/*Component LdapConfigEdit
  use: defines Admin middle Section for edit Ldap Configuration
  ToDo:
*/

const  LdapConfigEdit = (props) => {

    const [loading, setLoading] = useState(false)
    const [selBox, setSelBox] = useState([])
    const [showDeleteModal, setshowDeleteModal] = useState(false)
    const [emptyPopup, setEmptyPopup] = useState(false)
    const [servername, setServername] = useState('');

    useEffect(() => {
        LdapEdit();
        // eslint-disable-next-line
    }, [props.manageEdit])

    const displayError = (error) => {
        setLoading(false)
        props.toastError(error)
    }

    const LdapEdit = async () => {
        props.setServerName("");
        props.setUrl("");
        props.setBinddn("");
        props.setBindCredentials("");
        props.setBasedn("");
        props.setCert("");
        props.setCertName("No file choosen");
        props.setSecure("false");
        props.setFieldmap({ uname: "None", fname: "None", lname: "None", email: "None" });
        props.setFieldMapOpts(["None"]);
        props.setAuth("");
        props.setTestStatus("false");
        switchSecureUrl();
        props.setLdapServerURLErrBor(false); props.setBinddnErrBor(false); props.setBindCredentialsErrBor(false); props.setLdapBaseDNErrBor(false)
        props.setLdapFMapUnameErrBor(false); props.setLdapFMapFnameErrBor(false); props.setLdapFMapLnameErrBor(false)
        props.setLdapFMapEmailErrBor(false); props.setLdapCertErrBor(false); props.setLdapServerNameErrBor(false);
        setLoading("Fetching details...");
        const data = await getLDAPConfig("server");
        if (data.error) { displayError(data.error); return; }
        setLoading(false);
        if (data === "empty") {
            // if(props.popupState.show === true) setEmptyPopup(true);
            // else 
            displayError(MSG.ADMIN.WARN_EMPTY_CONFIG);
            setSelBox([]);
        } else {
            data.sort();
            // const selBoxOptions = [];
            // for (var i = 0; i < data.length; i++) {
            //     selBoxOptions.push(data[i].name);
            // }
            setSelBox(data);
        }
        // document.getElementById("ldapServerName").selectedIndex = "0";
    }

    const switchSecureUrl = () => {
        var url1 = props.url.trim();
        if (props.secure === "false") {
            props.setCert("");
            props.setCertName("No file choosen");
            if (url1.toLowerCase().startsWith("ldaps://")) props.setUrl("ldap://" + url1.slice(8));
            if (url1.toLowerCase().endsWith(":636")) props.setUrl(url1.slice(0, -3) + "389");
        } else {
            if (url1.toLowerCase().startsWith("ldap://")) props.setUrl("ldaps://" + url1.slice(7));
            if (url1.toLowerCase().endsWith(":389")) props.setUrl(url1.slice(0, -3) + "636");
        }
    }

    const closePopup = () => {
        // setMsg({show:false,title:"",content:""});
        if (emptyPopup) {
            displayError(MSG.ADMIN.WARN_EMPTY_CONFIG);
            setEmptyPopup(false);
        }
    }

    const getServerData = async (name) => {
        props.setLdapServerURLErrBor(false); props.setBinddnErrBor(false); props.setBindCredentialsErrBor(false); props.setLdapBaseDNErrBor(false)
        props.setLdapFMapUnameErrBor(false); props.setLdapFMapFnameErrBor(false); props.setLdapFMapLnameErrBor(false)
        props.setLdapFMapEmailErrBor(false); props.setLdapCertErrBor(false)
        var failMsg = "Failed to fetch details for '" + name + "' configuration.";
        setLoading("Fetching details...");
        try {
            const data = await getLDAPConfig("config", name);
            if (data.error) { displayError(data.error); return; }
            setLoading(false);
            if (data === "fail") {
                // setMsg({show:true,title:"Edit Configuration",content: failMsg});
                // if name required in popup remove fail condition from api 
            } else {
                props.setUrl(data.url);
                props.setBasedn(data.basedn);
                props.setSecure(data.secure);
                props.setCert(data.cert);
                props.setCertName("No file choosen");
                props.setAuth(data.auth);
                props.setBinddn(data.binddn);
                props.setBindCredentials(data.bindCredentials);
                props.setFieldMapOpts(["None"]);
                for (let fmo of Object.values(data.fieldmap)) {
                    if (!props.fieldMapOpts.includes(fmo)) props.fieldMapOpts.push(fmo);
                }
                props.setFieldMapOpts(props.fieldMapOpts);
                props.setFieldmap(data.fieldmap);
            }
        } catch (error) {
            setLoading(false);
            props.toastError(MSG.CUSTOM(failMsg, VARIANT.ERROR));
        }
    }

    const closeModal = () => {
        setshowDeleteModal(false);
    }

    return (
        <div className="ldap_container-edit">
            {loading ? <ScreenOverlay content={loading} /> : null}

            <div id="page-taskName flex flex-row"> <i className="m-2 pi pi-arrow-left" onClick={() => props.setLdapEdit(false)}/> <span>Edit</span> </div>
            <div className="ldap-content_wrapper-edit">
                    <div className="flex flex-column pb-2" >
                        <label data-test="userTypeLabel" className="pb-2 font-medium leftControl-ldap" style={{ paddingLeft: '0.7rem' }}>Select Server <span style={{ color: "#d50000" }}>*</span></label>
                        <Dropdown data-test="confServer"
                            id="ldapServerName"
                            defaultValue={""}
                            className='w-full md:w-28rem'
                            value={servername}
                            options={selBox}
                            onChange={(event) => {setServername(event.value); props.setServerName(event.target.value.name); getServerData(event.target.value.name); }}
                            optionLabel="name"
                            placeholder='Select server'
                        />
                    </div>

                <LdapConfigurationForm {...props} />
                <LdapDataMapping resetField={props.manageEdit} setFieldmap={props.setFieldmap} ldapEdit={props.ldapEdit} fieldmap={props.fieldmap} fieldMapOpts={props.fieldMapOpts} ldapFMapEmailErrBor={props.ldapFMapEmailErrBor} ldapFMapLnameErrBor={props.ldapFMapLnameErrBor} ldapFMapFnameErrBor={props.ldapFMapFnameErrBor} ldapFMapUnameErrBor={props.ldapFMapUnameErrBor} />
            </div>
            <div className='flex flex-row-reverse'>
                <Button className="ml-3 mr-3" onClick={() => { setshowDeleteModal(true) }} disabled={props.serverName === ''} title="Delete Configuration">Delete</Button>
                <Button className="ml-3 mr-3" onClick={() => { props.ldapManage('update') }} disabled={props.serverName === ''} title="Update Configuration">Update</Button>
                <Button className="ml-3 mr-3" onClick={() => { props.ldapTest() }} disabled={props.serverName === ''} title="Test Configuration">Test</Button>
            </div>


            {showDeleteModal ?
                <ModalContainer title="Delete Configuration" footer={deleteModalButtons(props.ldapManage, setshowDeleteModal)} close={closeModal} content="Are you sure you want to delete ? Users depending on this configuration will not be able to login." />
                : null}
        </div>
    );
}

const deleteModalButtons = (ldapManage, setshowDeleteModal) => {
    return (
        <div>
            <Button id="deleteGlobalModalButton-ldap" onClick={() => { ldapManage("delete"); setshowDeleteModal(false); }} type="button" size="small">Yes</Button>
            <Button type="button" onClick={() => { setshowDeleteModal(false); }} size="small" text >No</Button>
        </div>
    )
}

export default LdapConfigEdit;