import React, { useState, useEffect , useRef } from 'react';
import {FormInpDropDown} from '../components/FormComp';
import AssignOptionBox from '../components/AssignOptionBox'
import {getAvailable_ICE,getPools,updatePool} from '../api';
import { Messages } from '../../global';

/*Component AllocateByIce
  use: render ICE allocation by choose ICE section
*/

const  AllocateByIce = ({displayError,setLoading,selectedPool,setSelectedPool,saveAction,setSaveAction}) => {
    const inpRef = useRef()
    const [poolIceData,setPoolIceData] = useState([])
    const [iceData,setIceData] = useState([])
    const [initAssign,setInitAssign] = useState([])
    const [poolList,setPoolList] =  useState([])
    const [poolDict,setPoolDict] = useState({})
    //on selection of option in formInpDropdown
    const FilterPool = (e) => {
        var val = e.currentTarget.value
        setSelectedPool(val)
        var icepool = poolDict[val].ice_list
        var arr = []
        Object.keys(icepool).forEach(e => {
            icepool[e].name = icepool[e].icename
            arr.push(icepool[e])
        });
        setPoolIceData(arr)
    }
    //on click of option in formInpDropdown
    const clickInp = () =>{
        setPoolIceData([])
        setIceData(initAssign)
        setSelectedPool(undefined)
    }
    useEffect(()=>{
        //on click of save
        if(saveAction && selectedPool){
            (async()=>{
                setLoading('Saving in Progress. Please Wait...');
                var pool = poolDict[selectedPool]
                var ice_List = []
                pool.ice_added = []
                pool.ice_deleted = []
                poolIceData.forEach((e)=>{
                    ice_List.push(e._id)
                    if(!(e._id in poolDict[selectedPool].ice_list)){
                        pool.ice_added.push(e._id)
                    }
                })
                Object.keys(poolDict[selectedPool].ice_list).forEach((e)=>{
                    if(ice_List.indexOf(e)===-1){
                        pool.ice_deleted.push(e)
                    }
                })
                var data = await updatePool(pool)
                if(data.error){displayError(data.error);return;}
                await reset()
                displayError(Messages.ADMIN.SUCC_ICEPOOL_UPDATE);
            })()
        }
        setSaveAction(false)
        // eslint-disable-next-line
    },[saveAction])
    //when component mounts
    useEffect(()=>{
        reset()
        // eslint-disable-next-line
    },[])
    const reset = async() => {
        setLoading('...Loading')
        setPoolIceData([])
        setSelectedPool(undefined)
        inpRef.current.value = ""
        var data = await getAvailable_ICE()
        if(data.error){displayError(data.error);return;}
        if(!data.available_ice && !data.unavailable_ice){displayError(data.error);return;}
        var arr = []
        Object.keys(data.available_ice).forEach(e => {
            data.available_ice[e].name = data.available_ice[e].icename
            arr.push(data.available_ice[e])
        });
        var arg = {
            poolid:"all",
            projectids:[]
        }
        var dataPools = await getPools(arg)
        if(dataPools.error){displayError(dataPools.error);return;}
        var e = Object.entries(dataPools)
        e.sort((a,b) => a[1].poolname.localeCompare(b[1].poolname))
        setIceData(arr)
        setInitAssign(arr)
        setPoolDict(dataPools)
        setPoolList(e)
        setLoading(false)
    }
    return(
        <div className='edit_ice-pool'>
            <div className="col-xs-9 form-group assignBox-container allocate_by_ice-container">
                <AssignOptionBox
                    type={'ICE'}
                    FilterComp={<FilterComp clickInp={clickInp} inpRef={inpRef} setFilter={FilterPool} data={poolList}/>}
                    disable={selectedPool?false:true} leftBox={iceData} rightBox={poolIceData} setLeftBox={setIceData} setRightBox={setPoolIceData}
                />
            </div>
        </div>
    )
}

const FilterComp = ({setFilter,data,clickInp,inpRef}) =>{
    return(
        <span className='label-select'>
            <FormInpDropDown clickInp={clickInp} type={"Pool"} inpRef={inpRef} setFilter={setFilter} data={data}/>
        </span>
    )
}

export default AllocateByIce;