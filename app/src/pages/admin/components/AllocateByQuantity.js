import React, { useState, useEffect , useRef } from 'react';
import {FormInpDropDown} from './FormComp';
import {getAvailable_ICE,getPools,updatePool} from '../api';
import { Messages } from '../../global';

/*Component AllocateByQuantity
  use: render ICE allocation by Quantity section
*/

const AllocateByQuantity = ({resetMiddleScreen,selectedPool,setSelectedPool,displayError,setLoading,saveAction,setSaveAction}) => {
    const iceNum = useRef()
    const inpRef = useRef()
    const [iceCount,setIceCount] = useState({total:'-',available:'-'});
    const [poolList,setPoolList] =  useState([])
    const [poolDict,setPoolDict] = useState({})
    const [iceData,setIceData] = useState({})
    //on selection of option in formInpDropdown
    const FilterPool = (e) => {
        var val = e.currentTarget.value
        iceNum.current.disabled = false
        setSelectedPool(val)
        setLoading('Loading ICE ...')
        var icepool = poolDict[val].ice_list
        iceNum.current.max = iceCount.available+Object.keys(icepool).length
        iceNum.current.min = 0;
        iceNum.current.value = Object.keys(icepool).length
        setLoading(false)
    }
    //on click of option in formInpDropdown
    const clickInp = () =>{
        iceNum.current.style.outline=''
        setSelectedPool(undefined)
        iceNum.current.disabled = true
        iceNum.current.value = ''
    }
    useEffect(()=>{
        //on click of save
        if(saveAction && selectedPool){
            (async()=>{
                if(!iceNum.current.value){iceNum.current.style.outline='1px solid red';return;}
                iceNum.current.style.outline=''
                var pool = poolDict[selectedPool]
                var val = iceNum.current.value - Object.keys(pool.ice_list).length
                pool.ice_deleted = []
                pool.ice_added = []
                var availableIce = iceCount.available
                if(val > availableIce){displayError(Messages.ADMIN.WARN_ICE_EXCEEDS);return;}
                if(val<0){
                    pool.ice_deleted = Object.keys(pool.ice_list).slice(0,Math.abs(val))
                }else{
                    pool.ice_added = Object.keys(iceData.available_ice).slice(0,val)
                }
                setLoading('Saving ICE Pool ...')
                var data = await updatePool(pool)
                if(data.error){displayError(data.error);return;}
                await reset()
                displayError(Messages.ADMIN.SUCC_ICEPOOL_UPDATE);
            })()
        }
        setSaveAction(false)
        // eslint-disable-next-line
    },[saveAction])

    //on reload and load
    useEffect(()=>{
        reset()
        // eslint-disable-next-line
    },[resetMiddleScreen])
    
    const reset = async() => {
        setLoading('...Loading')
        setSelectedPool(undefined)
        inpRef.current.value ='';
        iceNum.current.value ='';
        var data = await getAvailable_ICE()
        if(data.error){displayError(data.error);return;}
        if(!data.available_ice && !data.unavailable_ice){displayError(data.error);return;}
        var available = Object.keys(data.available_ice).length
        var total = available + Object.keys(data.unavailable_ice).length
        setIceCount({total:total,available:available})
        setIceData(data)
        var arg = {
            poolid:"all",
            projectids:[]
        }
        var dataPools = await getPools(arg)
        if(dataPools.error){displayError(dataPools.error);return;}
        var e = Object.entries(dataPools)
        e.sort((a,b) => a[1].poolname.localeCompare(b[1].poolname))
        setPoolDict(dataPools)
        setPoolList(e)
        setLoading(false)
    }
    return(
        <div className='allocate-quant-container'>
            <div className='col-xs-9 form-group input-label'>
                <label>Available ICE</label>
                <span>{`${iceCount.available} / ${iceCount.total}`}</span>
            </div>
            <div style={{zIndex:1}} className='col-xs-9 form-group input-label'>
                <label>Pool Name</label>
                <span className='filter-pool'>
                    <FormInpDropDown type={'Pool'} clickInp={clickInp} inpRef={inpRef} data={poolList} setFilter={FilterPool}/>
                </span>
            </div>
            <div className='col-xs-9 form-group input-label'>
                <label>Enter number of ICE to assign</label>
                <input className='ice-count' ref={iceNum} disabled={selectedPool?false:true} type='number'></input>
            </div>
        </div>
    )
}

export default AllocateByQuantity;