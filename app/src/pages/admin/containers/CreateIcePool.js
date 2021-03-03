import React, { Fragment, useState, useEffect , useRef } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar} from '../../global' 
import {FormInput} from '../components/FormComp';
import AssignOptionBox from '../components/AssignOptionBox'
import {getDetails_ICE,createPool_ICE} from '../api';
import EditIcePool from './EditIcePool';
import '../styles/CreateIcePool.scss'


/*Component CreateIcePool
  use: defines icepool middle Section for create ice pools
*/

const CreateIcePool = (props) => {
    const poolName = useRef()
    const [editPool,setEditPool] = useState(false)
    const [projList,setProjList] = useState([])
    const [allProj,setAllProj] = useState([])
    const [assignProj,setAssignProj] = useState([])
    const [popupState,setPopupState] = useState({show:false,title:"",content:""});
    const [loading,setLoading] = useState(false);
    const displayError = (error,header) =>{
        setLoading(false)
        setPopupState({
            title:header?header:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }
    const ClickCreate = async() => {
        var val =  poolName.current.value
        if(!val){
            poolName.current.style = 'border-color: red!important;'
            return;
        }
        poolName.current.style = ""
        var projList = [];
        assignProj.forEach((e)=>projList.push(e._id))
        var data = {
			poolname: val,
			projectids: projList
        }
        setLoading('Saving ICE Pool ...')
        var data = await createPool_ICE(data)
        if(data.error){displayError(data.error);return;}
        await resetData({poolName,setAllProj,setAssignProj,setProjList,setLoading,displayError})
        displayError("ICE Pool created successfully.","success")
    }
    useEffect(()=>{
        setEditPool(false)
        resetData({poolName,setAllProj,setAssignProj,setProjList,setLoading,displayError})
    },[props.resetMiddleScreen])
    return(
        <ScrollBar thumbColor="#929397">
        <div className="crt_ice-pool_container">
        {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={()=>setPopupState({show:false})} close={()=>setPopupState({show:false})} submitText={"Ok"} />:null}
        {loading?<ScreenOverlay content={loading}/>:null}
        {editPool?
            <EditIcePool projList={projList} displayError={displayError} setLoading={setLoading}/>:
            <Fragment>
                <div id="page-taskName">
                    <span>Create ICE Pool</span>
                </div>
                <div className="adminActionBtn">
                    <button className=" btn-md adminBtn btn-edit" onClick={()=>setEditPool(true)}  title="Edit">Edit</button>
                    <button className=" btn-md adminBtn" onClick={ClickCreate}  title="Save">Create</button>
                </div>
                <div className='crt_ice-pool'>
                    <FormInput inpRef={poolName} label={'ICE pool'} placeholder={'Enter ICE Pool Name'} validExp={"poolName"}/>
                    <div className="col-xs-9 form-group assignBox-container">
                        <AssignOptionBox leftBox={allProj} rightBox={assignProj} setLeftBox={setAllProj} setRightBox={setAssignProj}/>
                    </div>
                </div>
            </Fragment>
        }
        </div>
        </ScrollBar>
    )
}

const resetData = async({poolName,setAllProj,setAssignProj,setProjList,setLoading,displayError}) => {
    setLoading('Loading ...')
    if(poolName.current)poolName.current.value = ""
    var data = await getDetails_ICE(["all"],["all"])
    if(data.error){displayError(data.error);return;}
    var arr = Object.keys(data).map((id)=>{return data[id]})
    arr.sort((a,b) => a.name.localeCompare(b.name));
    setAllProj(arr)
    setProjList(arr)
    setAssignProj([])
    setLoading(false)
}

export default CreateIcePool;