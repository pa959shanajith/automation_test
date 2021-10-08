import React, { Fragment, useState, useEffect , useRef } from 'react';
import {ModalContainer, ScrollBar, Messages as MSG} from '../../global' 
import {FormInpDropDown, FormInput} from '../components/FormComp';
import AssignOptionBox from '../components/AssignOptionBox'
import {clearQueue,deleteICE_pools,updatePool,getPools} from '../api';
import '../styles/EditIcePool.scss';

/*Component EditIcePool
  use: defines icepool middle Section for edit ice pool from create ice pool section
*/
const EditIcePool = ({projList,displayError,setLoading}) => {
    const poolName = useRef()
    const updateBtn = useRef()
    const deleteBtn = useRef()
    const clearBtn = useRef()
    const filterRef = useRef()
    const [allProj,setAllProj] = useState([])
    const [assignProj,setAssignProj] = useState([])
    const [poolList,setPoolList] =  useState([])
    const [poolDict,setPoolDict] = useState({})
    const [clearPop,setClearPop] = useState(false)
    const [deletePop,setDeletePop] = useState(false)
    const [selectedPool,setSelectedPool] = useState(undefined)
    const prop = {filterRef,selectedPool,setSelectedPool,poolName,poolDict,projList,setAllProj,assignProj,setAssignProj,setPoolList,setPoolDict,setLoading,displayError}
    useEffect(()=>{
        (async()=>{
            setLoading('Loading ...')
            await resetData(prop)
            setLoading(false)
        })()
        // eslint-disable-next-line
    },[projList])
    //on click of pool dropdown
    const clickInp = () =>{
        var arr = [...allProj,...assignProj]
        arr.sort((a,b) => a.name.localeCompare(b.name));
        setAllProj(arr)
        setAssignProj([])
        setSelectedPool(undefined)
        poolName.current.disabled = true
        poolName.current.value = ''
    }
    const clickClearQueue = () =>{
        clearIceQueue({selectedPool,setLoading,displayError})
    }
    const clickDeletePool = () =>{
        if(!selectedPool)return;
        deleteIcePool(prop)
    }
    const clickUpdatePool = () =>{
        if(!selectedPool)return;
        if(!poolName.current.value){
            poolName.current.style.outline = '1px solid red';
            return;
        }
        poolName.current.style.outline=""
        updateIcePool(prop) 
    }
    //on selection of pool from dropdown
    const FilterPool = (e) => {
        poolName.current.style.outline=""
        var val = e.currentTarget.value
        var text = e.currentTarget.innerText
        poolName.current.disabled = false
        poolName.current.value = text
        setSelectedPool({_id:val,name:text})
        var prjarr = poolDict[val].projectids
        if( prjarr && prjarr.length>0){
            var a = []
            var b = []
            projList.forEach((e)=>{
                if(prjarr.indexOf(e._id)!==-1) a.push(e);
                else b.push(e);
            })
            setAllProj(b)
            setAssignProj(a)
        }
    }
    return(
        <Fragment>
            {clearPop?
                <ModalContainer
                modalClass = 'modal-sm'
                title='Clear Queue'
                close={()=>setClearPop(false)}
                footer={<Footer clickClearQueue={clickClearQueue} setClearPop={setClearPop}/>}
                content={<Container selectedPool={selectedPool} />}
            />:null}
            {deletePop?
                <ModalContainer
                modalClass = 'modal-sm'
                title='Delete ICE Pool'
                close={()=>setDeletePop(false)}
                footer={<DelFooter clickDeletePool={clickDeletePool} setDeletePop={setDeletePop}/>}
                content={<DelContainer selectedPool={selectedPool} />}
            />:null}
            <ScrollBar thumbColor="#929397">
                <div className="edit_ice-pool_container">
                    <div id="page-taskName">
                        <span>Edit ICE Pool</span>
                    </div>
                    <div className="adminActionBtn">
                        <button disabled={!selectedPool?true:false} ref={deleteBtn} className="a__btn btn-edit" onClick={()=>setDeletePop(true)}  title="Delete">Delete</button>
                        <button disabled={!selectedPool?true:false} ref={updateBtn} className="a__btn btn-edit" onClick={clickUpdatePool}  title="Update">Update</button>
                        <button ref={clearBtn} className="a__btn" onClick={()=>setClearPop(true)}  title="Clear Queue">Clear Queue</button>
                    </div>
                    <div className='edit_ice-pool'>
                        <div className="col-xs-9 form-group assignBox-container">
                            <AssignOptionBox 
                                FilterComp={<FilterComp clickInp={clickInp} inpRef={filterRef} setFilter={FilterPool} data={poolList}/>} 
                                disable={!selectedPool?true:false} leftBox={allProj} rightBox={assignProj} setLeftBox={setAllProj} setRightBox={setAssignProj}
                            />
                        </div>
                        <FormInput inpRef={poolName} label={'ICE pool'} placeholder={'Enter ICE Pool Name'} validExp={"poolName"}/>
                    </div>
                </div>
            </ScrollBar>        
        </Fragment>
    )
}

//choose pool section from assignoptionbox
const FilterComp = ({setFilter,data,clickInp,inpRef}) =>{
    return(
        <span className='label-select'>
            <FormInpDropDown clickInp={clickInp} inpRef={inpRef} setFilter={setFilter} data={data} type={"Pool"}/>
        </span>
    )
}

//popup header and footer components for delete and clear queue warnings
const Container = ({selectedPool}) => (
    <p style={{whiteSpace:'break-spaces'}}>{selectedPool?
        `Are you sure you want to clear queue of the ICE pool : ${selectedPool.name} ? \nAll the jobs queued in this pool will be cancelled.`
        :`Are you sure you want to clear all the queues ? \nAll the jobs queued in every pool will be cancelled.`
        }
    </p>
)
const Footer = ({setClearPop,clickClearQueue}) =>(
    <div>
        <button style={{marginRight:'15px'}} onClick={()=>{setClearPop(false);clickClearQueue();}}>Yes</button>
        <button onClick={()=>setClearPop(false)}>No</button>
    </div>
)
const DelContainer = ({selectedPool}) => (
    <p style={{whiteSpace:'break-spaces'}}>
        {`Are you sure you want to delete ICE Pool : ${selectedPool.name} ? \nAll the jobs queued on this pool will be canceled.`}
    </p>
)
const DelFooter = ({setDeletePop,clickDeletePool}) =>{
    return(
        <div>
            <button style={{marginRight:'15px'}} onClick={()=>{setDeletePop(false);clickDeletePool();}}>Yes</button>
            <button onClick={()=>setDeletePop(false)}>No</button>
        </div>
    )
}

const updateIcePool = async(prop) =>{
    prop.setLoading('Saving ICE Pool ...')
    var pool = prop.poolDict[prop.selectedPool._id]
    pool.poolname = prop.poolName.current.value
    pool.projectids=[]
    pool.ice_added=[]
    pool.ice_deleted=[]
    prop.assignProj.forEach(e=>{
        pool.projectids.push(e._id)
    })
    var data = await updatePool(pool)
    if(data.error){prop.displayError(data.error);return;}
    var err = await resetData(prop)
    if(!err)prop.displayError(MSG.ADMIN.SUCC_ICEPOOL_SAVED)
}

const deleteIcePool = async(prop) =>{
    prop.setLoading('Deleting ICE Pool ...')
    var id = prop.selectedPool._id
    var data = await deleteICE_pools({'poolid':[id]})
    if(data.error){prop.displayError(data.error);return;}
    var err = await resetData(prop)
    if(!err)prop.displayError(MSG.ADMIN.SUCC_DELETE_ICEPOOL)
}

const clearIceQueue = async({selectedPool,setLoading,displayError}) =>{
    setLoading('Clearing Queue ...')
    var poolids = []
    var type = "any";
    if(selectedPool){
        poolids.push(selectedPool._id)
    }else{
        type = "all"
    }
    var data = await clearQueue({"poolids":poolids,"type":type});
    if(data.error){displayError(data.error);return;}
    displayError(MSG.ADMIN.SUCC_CLEAR_QUEUE)
}

const resetData = async({filterRef,setSelectedPool,poolName,projList,setAllProj,setAssignProj,setPoolDict,setProjList,setPoolList,setLoading,displayError,action}) => {
    var dataPool = {
        poolid:"all",
        projectids:[]
    }
    filterRef.current.value = ""
    poolName.current.disabled = true
    poolName.current.value = ""
    var data = await getPools(dataPool)
    if(data.error){
        if(data.val === 'empty'){
            displayError(data.error);
            data = {};
        }else{
            displayError(data.error);
            return true;
        }
    }
    var e = Object.entries(data)
    e.sort((a,b) => a[1].poolname.localeCompare(b[1].poolname))
    setPoolDict(data)
    setPoolList(e)
    setAllProj(projList)
    setAssignProj([])
    setSelectedPool(undefined)
}


export default EditIcePool