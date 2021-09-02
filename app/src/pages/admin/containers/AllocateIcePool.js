import React, { useState, useEffect } from 'react';
import {ScreenOverlay, ScrollBar, setMsg} from '../../global' 
import AllocateByQuantity from '../components/AllocateByQuantity';
import AllocateByIce from '../components/AllocateByIce';
import '../styles/AllocateIcePool.scss'

/*Component AllocateIcePool
  use: render ICE allocation screen on select from leftbar icon imports quantity and choose ice from component
*/
const AllocateIcePool = ({resetMiddleScreen}) => {
    const [quant,setQuant] = useState(true)
    const [loading,setLoading] = useState(false);
    const [selectedPool,setSelectedPool] = useState({})
    const [saveAction,setSaveAction] = useState(false)
    useEffect(()=>{
        setQuant(true)
    },[resetMiddleScreen])
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    return(
        <ScrollBar thumbColor="#929397" hideXbar={true}>
            <div className="crt_ice-pool_container">
            {loading?<ScreenOverlay content={loading}/>:null}
            <div id="page-taskName">
                <span>Allocate ICE Pool</span>
            </div>
            <div className="adminActionBtn">
                <button disabled={selectedPool?false:true} className=" a__btn " onClick={()=>setSaveAction(true)}  title="Save">Save</button>
            </div>
            <div className='col-xs-9 form-group allocate-opt'>
                <div className={!quant?"unactive-opt":""} onClick={()=>setQuant(true)}>Quantity</div>
                <div className={quant?"unactive-opt":""} onClick={()=>setQuant(false)}>Choose ICE</div>
            </div>
            {quant?
            <AllocateByQuantity resetMiddleScreen={resetMiddleScreen} saveAction={saveAction} selectedPool={selectedPool} setSelectedPool={setSelectedPool} setSaveAction={setSaveAction} displayError={displayError} setLoading={setLoading} />:
            <AllocateByIce  saveAction={saveAction} selectedPool={selectedPool} setSelectedPool={setSelectedPool} setSaveAction={setSaveAction} displayError={displayError} setLoading={setLoading} />}
            </div>
        </ScrollBar>    
    )
}


export default AllocateIcePool