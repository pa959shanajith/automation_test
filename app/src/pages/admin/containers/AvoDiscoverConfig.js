import React, { Fragment, useState, useEffect, useRef } from 'react';
import {ScreenOverlay, ScrollBar, Messages, setMsg, ModalContainer} from '../../global' 
import {FormInput,FormSelect,FormInputButton,FormSelectButton} from '../components/FormComp'
import {getUserDetails,avoDiscoverSaveConfig,avoDiscoverReset,fetchAvoDiscoverMap} from '../api';
import '../styles/AvoDiscoverConfig.scss'

/*Component AvoDiscoverConfig
  use: defines Admin middle Section for Avo Discover Configuration
*/

const AvoDiscoverConfig = (props) => {
    const avoDiscoverUrlRef =  useRef();
    const userRef =  useRef();
    const avoDiscoverUsrRef = useRef();
    const avoDiscoverPswdRef = useRef();
    const resetRef = useRef();
    const saveRef = useRef();
    const [userData,setUserData] = useState({});
    const [userList,setUserList] = useState([]);
    const [searchTasks,setSearchTasks] = useState("");
    const [mapRef,setShowMap] = useState(false);
    const [avoDiscoverUserList, setAvoDiscoverUserList] = useState([]);
    const [avoDiscoverMapList, setAvoDiscoverMapList] = useState([]);
    const [loading,setLoading] = useState(false);
    const [showSave,setShowSave] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showPswdInput, setShowPswdInput] = useState(false);
    const [mappedlist, setMappedList] = useState([]);

    useEffect(()=>{
        fetchAvoDiscoverConfig();
    },[props.resetMiddleScreen["avoDiscoverConfigTab"],props.MiddleScreen])
    
    const displayError = (error) =>{
        setLoading(false);
        setMsg(error);
    }

    const fetchAvoDiscoverConfig = async() => {
        setLoading(true);
        var users=[];
		const data = await fetchAvoDiscoverMap();
		if(data.error) { displayError(data.error);setAvoDiscoverMapList([]);setLoading(false); return;}
        if(data === 'empty'){
            refreshFields();
            setLoading(false);
            return;
        }
        var inputs = {
            "action":"fetch",
            "url":data['avodiscoverurl']
        }
        const data1 = await avoDiscoverSaveConfig(inputs);
        if (data1.error) {setLoading(false);return;}
        for(var i=0; i<data1.length; i++){
            users.push(data1[i]['username']);
        }
        await fetchUsers(setUserList, setUserData, displayError);
        setAvoDiscoverUserList(users.sort());
        setShowMap(true);
        setAvoDiscoverMapList(data.mappedavodiscoverlist);
        setMappedList(data.mappedavodiscoverlist);
        setShowSave(true);
        setShowPswdInput(false);
        resetRef.current.disabled = false;
        saveRef.current.disabled = true;
        avoDiscoverUrlRef.current.disabled = true;
        avoDiscoverUrlRef.current.value = data.avodiscoverurl;
        document.getElementById('usravodiscover').selectedIndex = '0';
        document.getElementById('assureusr').selectedIndex = '0';
		setLoading(false);
    }

    const avoDiscoverConfigActions = async (action) => {
        setLoading("Loading...");
        var regExUrl = /^https:\/\/[A-Za-z0-9.-]+:\d+$/;
        var url = avoDiscoverUrlRef.current.value.trim();
        var inputs={
            "action":action,
            "url": url,
            "avodiscoveruser": avoDiscoverUsrRef.current != undefined ? avoDiscoverUsrRef.current.value: null ,
            "avodiscoverpassword": avoDiscoverPswdRef.current != undefined ? Buffer.from(avoDiscoverPswdRef.current.value).toString('base64'): null,
            "userid": userRef.current ? Object.keys(userData).find(key => userData[key] === userRef.current.value): null
        }
        if(action === 'save' && !regExUrl.test(url)){displayError(Messages.ADMIN.AVODISCOVER_URL_ERR);return;}
        else{
            const getAvoDiscoverData = await avoDiscoverSaveConfig(inputs);
            if(getAvoDiscoverData.error){displayError(getAvoDiscoverData.error);return;}
            else if (getAvoDiscoverData == 'User already mapped'){displayError(Messages.ADMIN.WARN_AVODISCOVER_EXIST);return;}
            else{
                if(['save','refresh'].includes(action)){
                    fetchUsers(setUserList, setUserData, displayError);
                    var avoDiscoverUserOptions = [];
                    for(var i=0; i<getAvoDiscoverData.length; i++){
                        avoDiscoverUserOptions.push(getAvoDiscoverData[i]['username']);
                    }
                    setAvoDiscoverUserList(avoDiscoverUserOptions.sort());
                    setShowSave(true);
                    resetRef.current.disabled = false;
                    saveRef.current.disabled=true;
                    avoDiscoverUrlRef.current.disabled=true;
                } else if(action == 'map'){
                    setAvoDiscoverMapList(getAvoDiscoverData.mappedavodiscoverlist);
                    setMappedList(getAvoDiscoverData.mappedavodiscoverlist);
                    document.getElementById('usravodiscover').selectedIndex = '0';
                    document.getElementById('assureusr').selectedIndex = '0';
                    setShowMap(true);
                    setShowPswdInput(false);
                }
                if(action=='refresh'){
                    document.getElementById('usravodiscover').selectedIndex = '0';
                    avoDiscoverUrlRef.current.disabled=true;
                    setShowPswdInput(false);
                }
            }
        }

        setLoading(false);   
    }

    const avoDiscoverResetConfig = async(action,userid) => {
        setLoading(true);
        const resetdata = await avoDiscoverReset(action,userid,avoDiscoverUrlRef.current.value);
        if(resetdata.error){displayError(resetdata.error);return;}
        if(resetdata.mappedavodiscoverlist){
            setAvoDiscoverMapList(resetdata.mappedavodiscoverlist);
        }
        if(action==='unmap'){
            document.getElementById('usravodiscover').selectedIndex = '0';
            document.getElementById('assureusr').selectedIndex = '0';
        }
        setShowPswdInput(false);
        setLoading(false);
    }

    const onChangeAvoAssureUsr = async() => {
        document.getElementById('usravodiscover').selectedIndex = '0';
        setShowPswdInput(false);
    }

    const searchMappedList = (val) =>{
		const items = mappedlist.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setAvoDiscoverMapList(items);
	}

    const refreshFields = async() => {
        setShowSave(false);
        setAvoDiscoverMapList([]);
        setMappedList([]);
        setShowMap(false);
        setShowPswdInput(false);
        avoDiscoverUrlRef.current.disabled=false;
        avoDiscoverUrlRef.current.value='';
        saveRef.current.disabled = false;
        resetRef.current.disabled=true;
    }

    return (
        <div className="discover_container">
            <div id="page-taskName"><span>Avo Discover Configuration</span></div>
            <div className="adminActionBtn">
                <button data-test="avodiscover_save" ref={saveRef} onClick={()=>avoDiscoverConfigActions('save')} className="a__btn btn-edit" title="Save">Save</button>
                <button data-test="avodiscover_reset" ref={resetRef} onClick={()=>setShowResetModal(true)} className="a__btn" title="Reset">Reset</button>
            </div>
            {showResetModal?
                <ModalContainer
                    title="Reset Avo Discover Configuration"
                    content={"Are you sure you want to Reset ? All Avo Assure user configuration with Avo Discover users will be reset."}
                    close={()=>setShowResetModal(false)}
                    footer={
                        <>
                        <button onClick={()=>{avoDiscoverResetConfig('reset','');refreshFields();setShowResetModal(false);}}>Yes</button>
                        <button onClick={()=>setShowResetModal(false)}>No</button>
                        </>
                    }
                    modalClass=" modal-sm"
                />
            :null}
            <div className = "discover_containerwrap">
                <ScrollBar hideXbar={true} thumbColor="#929397">
                    <Fragment>
                    {loading?<ScreenOverlay content={loading}/>:null}
                    <div className="col-xs-9" style={{width: "98%"}}>
                        <div className="discover_input">
                            <FormInput data-test="url_avodiscover" inpRef={avoDiscoverUrlRef} label={'Avo Discover URL'} placeholder={'Avo Discover Server URL'}/>
                            {showSave?
                            <>
                            <FormSelect data-test="assure_usr" inpId={'assureusr'} inpRef={userRef} defValue={"Select Avo Assure User"} onChangeFn={() => {onChangeAvoAssureUsr()}} label={"Avo Assure User"} option={userList} />
                            <FormSelectButton data-test="usr_avodiscover" inpRef={avoDiscoverUsrRef} inpId={'usravodiscover'} onChangeFn={()=>{setShowPswdInput(true)}} onClick={()=>{avoDiscoverConfigActions('refresh')}} title="Refresh" defValue={"Select Avo Discover User"} label={'Avo Discover User'} option={avoDiscoverUserList} />
                            </>:null
                            }
                            {showPswdInput?
                            <>
                            <FormInputButton data-test="avodiscover_pswd"  type="password" inpRef={avoDiscoverPswdRef} onClick={()=>{avoDiscoverConfigActions('map')}} title="Map" label={'Avo Discover Password'} placeholder={'Avo Discover Password'}/>   
                            </>:null
							}
                        </div>
                    </div>
                    </Fragment>
                    <Fragment>
                        {loading ? <ScreenOverlay content={loading} /> : null}
                        <div>
                        {mapRef?
                        <>
                            {loading ? <ScreenOverlay content={loading} /> : null}
                            <div className="col-xs-9 form-group-ip adminForm-ip" style={{paddingTop:"0",width:"85%"}}>
                                <div className="containerWrap">
                                    <div className="AvoDiscoverHeading">
                                        <h4>Mapped Users</h4>
                                        <div className="search-ip">
                                            <span className="searchIcon-provision search-icon-ip">
                                                <img src={"static/imgs/ic-search-icon.png"} className="search-img-ip" alt="search icon"/>
                                            </span>
                                        <input value={searchTasks} onChange={(event)=>{setSearchTasks(event.target.value);searchMappedList(event.target.value)}} autoComplete="off" type="text" className="searchInput-list-ip searchInput-cust-ip" />
                                        </div>
                                    </div>
                                    <div className="wrap wrap-cust-ip">
                                    <ScrollBar thumbColor="#929397">
                                        <table className = "table table-hover sessionTable">
                                            <tbody>
                                            <tr>
                                                <th> Avo Assure User </th>
                                                <th> Avo Discover User </th>
                                                <th>  </th>
                                            </tr>
                                            {avoDiscoverMapList.map((e,index)=>(
                                                <tr key={index}>
                                                    <td> {userData[e._id]} </td>
                                                    <td> {e.name} </td>
                                                    <td><button value={e._id} className="btn btn-cust-ip" onClick={() => { avoDiscoverResetConfig('unmap',e._id) }} title="Un-Map" > Un-Map </button></td>
                                                </tr> 
                                            ))}
                                            </tbody>
                                        </table>
                                    </ScrollBar>
                                    </div>
                                </div>

                            </div>
                        </>:null}
                    </div>
                    </Fragment>
                </ScrollBar>
            </div>
        </div>
    );
}

const fetchUsers = async (setUserList, setUserData, displayError)=>{
    const data = await getUserDetails("user");
    if(data.error){displayError(data.error);return;}
    var userOptions = [];
    var userData = {};
    for(var i=0; i<data.length; i++){
        if(data[i][3] !== "Admin"){
            userOptions.push(data[i][0]);
            userData[data[i][1]] = data[i][0];
        }
    }
    setUserData(userData);
    setUserList(userOptions.sort()); 
}

export default AvoDiscoverConfig;