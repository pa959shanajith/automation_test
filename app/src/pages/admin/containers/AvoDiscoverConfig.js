import React, { Fragment, useState, useEffect, useRef } from 'react';
import {ScreenOverlay, ScrollBar, Messages, setMsg, ModalContainer} from '../../global' 
import {FormInput,FormSelect} from '../components/FormComp'
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
    const [searchTasks,setSearchTasks] = useState([]);
    const [mapRef,setShowMap] = useState(false);
    const [avoDiscoverUserList, setAvoDiscoverUserList] = useState([]);
    const [avoDiscoverMapList, setAvoDiscoverMapList] = useState([]);
    const [loading,setLoading] = useState(false);
    const [showSave,setShowSave] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showPswdInput, setShowPswdInput] = useState(false);

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
        setShowSave(true);
        setShowPswdInput(false);
        resetRef.current.disabled = false;
        saveRef.current.disabled = true;
        avoDiscoverUrlRef.current.disabled = true;
        avoDiscoverUrlRef.current.value = data.avodiscoverurl;
		setLoading(false);
    }

    const avoDiscoverConfigActions = async (action) => {
        setLoading("Loading...");
        var regExUrl = /^http[s]?:\/\/[A-Za-z0-9.-]+:\d+$/;
        var url = avoDiscoverUrlRef.current.value.trim();
        var inputs={
            "action":action,
            "url": url,
            "avodiscoveruser": avoDiscoverUsrRef.current != undefined ? avoDiscoverUsrRef.current.value: null ,
            "avodiscoverpassword": avoDiscoverPswdRef.current != undefined ? Buffer.from(avoDiscoverPswdRef.current.value).toString('base64'): null
        }
        if(action=='save' && !regExUrl.test(url)){displayError(Messages.ADMIN.AVODISCOVER_URL_ERR);return;}
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
		const items = avoDiscoverMapList.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setAvoDiscoverMapList(items);
	}

    const refreshFields = async() => {
        setShowSave(false);
        setAvoDiscoverMapList([]);
        setShowMap(false);
        avoDiscoverUrlRef.current.disabled=false;
        avoDiscoverUrlRef.current.value='';
        saveRef.current.disabled = false;
        resetRef.current.disabled=true;
    }

    return (
        <ScrollBar thumbColor="#929397">
            <div className="discover_container">
                <div className="discover_containerwrap">
                    {loading?<ScreenOverlay content={loading}/>:null}
                    <div id="page-taskName"><span>Avo Discover Configuration</span></div>
                    <div className="adminActionBtn">
                        <button data-test="avodiscover_save" ref={saveRef} onClick={()=>avoDiscoverConfigActions('save')} className="a__btn btn-edit" title="Save">Save</button>
                        <button data-test="avodiscover_reset" ref={resetRef} onClick={()=>setShowResetModal(true)} className="a__btn" title="Reset">Reset</button>
                    </div>
                    {showResetModal?
                        <ModalContainer
                            title="Reset Avo Discover configuration"
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
                    <div className="discover_input" >
                        <FormInput data-test="url_avodiscover" inpRef={avoDiscoverUrlRef} label={'Avo Discover URL'} placeholder={'Avo Discover Server URL'}/>
                        {showSave?
                        <>
                        <FormSelect data-test="assure_usr" inpId={'assureusr'} inpRef={userRef} defValue={"Select Avo Assure User"} onChangeFn={() => {onChangeAvoAssureUsr()}} label={"Avo Assure User"} option={userList} />
                        <div className='avoDiscover_UserForm'>
                            <FormSelect data-test="usr_avodiscover" inpRef={avoDiscoverUsrRef} inpId={'usravodiscover'} onChangeFn={()=>{setShowPswdInput(true)}} defValue={"Select Avo Discover User"} label={'Avo Discover User'} option={avoDiscoverUserList} />
                            <button data-test="avodiscover_refresh" onClick={()=>avoDiscoverConfigActions('refresh')} className="a__btn btn-edit refresh" title="refresh">Refresh</button>
                        {showPswdInput?
                        <>
                        <div>
                            <FormInput data-test="avodiscover_pswd"  type="password" inpRef={avoDiscoverPswdRef} label={'Avo Discover Password'} placeholder={'Avo Discover Password'}/>
                            <button data-test="avodiscover_map" onClick={()=>avoDiscoverConfigActions('map')} className="a__btn btn-edit map" title="map">MAP</button>
                        </div>
                        </>:null
                        }
                        </div>
                        </>:null
                    }
                    </div>
                </div>
            </div>
            <Fragment>
            {mapRef?
            <>
                {loading ? <ScreenOverlay content={loading} /> : null}
                <div className="col-xs-9 form-group-ip adminForm-ip map-form" style={{paddingTop:"0",marginLeft:"25px",width:"83%",marginTop: "-130px"}}>
                    <div className="containerWrap">
                        <div className="sessionHeading-ip" data-toggle="collapse" data-target="#activeUsersToken-x">
                            <h4>Mapped Users</h4>
                            <div className="search-ip">
                                <span className="searchIcon-provision search-icon-ip">
                                    <img src={"static/imgs/ic-search-icon.png"} className="search-img-ip" alt="search icon"/>
                                </span>
							<input value={searchTasks} onChange={(event)=>{setSearchTasks(event.target.value);searchMappedList(event.target.value)}} autoComplete="off" type="text" id="searchTasks" className="searchInput-list-ip searchInput-cust-ip" />
						</div>
                        </div>
                        <div id="activeUsersToken" className="wrap wrap-cust-ip">
                        <ScrollBar scrollId='activeUsersToken-ip' thumbColor="#929397" >
                            <table className = "table table-hover sessionTable" id="tokensDetail">
                                <tbody >
                                <tr>
                                    <th> Avo Assure User </th>
                                    <th> Avo Discover User </th>
                                    <th>  </th>
                                    <th>  </th>
                                </tr>
                                {avoDiscoverMapList.map((e,index)=>(
                                    <tr key={index} className='provisionTokens'>
                                        <td> {userData[e._id]} </td>
                                        <td> {e.name} </td>
                                        <td><button value={e._id} className="btn btn-cust-ip" onClick={() => { avoDiscoverResetConfig('unmap',e._id) }} > Un-Map </button></td>
                                    </tr> 
                                ))}
                                </tbody>
                            </table>
                            </ScrollBar>
                        </div>
                    </div>

                </div>
                </>:null}
            </Fragment>
        </ScrollBar>
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