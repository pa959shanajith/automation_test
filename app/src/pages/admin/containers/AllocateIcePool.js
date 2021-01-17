import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg} from '../../global' 
import AllocateByQuantity from '../components/AllocateByQuantity';
import AllocateByIce from '../components/AllocateByIce';
import '../styles/AllocateIcePool.scss'

/*Component AllocateIcePool
  use: render ICE allocation screen on select from leftbar icon imports quantity and choose ice from component
*/
const AllocateIcePool = ({resetMiddleScreen}) => {
    const [quant,setQuant] = useState(true)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""});
    const [loading,setLoading] = useState(false);
    const [selectedPool,setSelectedPool] = useState({})
    const [saveAction,setSaveAction] = useState(false)
    useEffect(()=>{
        setQuant(true)
    },[resetMiddleScreen])
    const displayError = (error,header) =>{
        setLoading(false)
        setPopupState({
            title:header?header:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }
    return(
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={()=>setPopupState({show:false})} close={()=>setPopupState({show:false})} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            <div id="page-taskName">
                <span>Allocate ICE Pool</span>
            </div>
            <div className="adminActionBtn">
                <button disabled={selectedPool?false:true} className=" btn-md adminBtn" onClick={()=>setSaveAction(true)}  title="Save">Save</button>
            </div>
            <div className='col-xs-9 form-group allocate-opt'>
                <div className={!quant?"unactive-opt":""} onClick={()=>setQuant(true)}>Quantity</div>
                <div className={quant?"unactive-opt":""} onClick={()=>setQuant(false)}>Choose ICE</div>
            </div>
            {quant?
            <AllocateByQuantity resetMiddleScreen={resetMiddleScreen} saveAction={saveAction} selectedPool={selectedPool} setSelectedPool={setSelectedPool} setSaveAction={setSaveAction} displayError={displayError} setLoading={setLoading} setPopupState={setPopupState}/>:
            <AllocateByIce  saveAction={saveAction} selectedPool={selectedPool} setSelectedPool={setSelectedPool} setSaveAction={setSaveAction} displayError={displayError} setLoading={setLoading} setPopupState={setPopupState}/>}
        </Fragment>
    )
}


export default AllocateIcePool