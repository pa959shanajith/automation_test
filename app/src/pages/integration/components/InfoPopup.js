import React, { useEffect, useState } from 'react';
import { ModalContainer, ScrollBar} from '../../global';
import PropTypes from 'prop-types';
import '../styles/InfoPopup.scss'

/*  component InfoPopup
    props:
        reqDetails - list of dict having details
        setInfo - fn to close popup
        displayError - fn to show display popup
*/
const InfoPopup = ({reqDetails,setInfo,displayError,screenType}) => {
    const [err,setErr] = useState(true)
    useEffect(()=> {
        if(!reqDetails || reqDetails.length === 0){
            displayError(reqDetails ? "No requirement details found" : `Please re-map the ${screenType} Test Cases and the AvoAssure scenarios to fetch the requirements`)
            setInfo(false)
        }else{
            setErr(false)
        }
    },[])
    if(err)return null
    return(
        <ModalContainer 
        modalClass = 'modal-md'
        title='Test Details'
        close={()=>setInfo(false)}
        footer={<Footer setInfo={setInfo}/>}
        content={<Container reqDetails={reqDetails}/>} 
      />
    )
}

const Container = ({reqDetails}) =>{
    return(
        <div data-test='zphyre-info-box' className='zphyre-info-box'>
            <ScrollBar>
            {reqDetails.map((e,i)=>
                <div className='zphyre-info-step' key={'info__'+i}>
                    <div>
                        <label className='title'>ID </label>
                        <label><span>:</span> {e.reqid}</label>
                    </div>
                    <div>
                        <label className='title'>Name </label>
                        <label><span>:</span> {e.reqname}</label>
                    </div>
                    <div>
                        <label className='title'>Create Date </label>
                        <label><span>:</span> {e.reqcreationdate}</label>
                    </div>
                    <div>
                        <label className='title'>Description </label>
                        <label><span>:</span> {e.reqdescription.trim()}</label>
                    </div>
                </div>
            )}
            </ScrollBar>
        </div>
    )
}

const Footer = ({setInfo}) => <div><button onClick={()=>setInfo(false)}>Ok</button></div>

InfoPopup.propTypes={
    reqDetails:PropTypes.arrayOf(PropTypes.object),
    setInfo:PropTypes.func,
    displayError:PropTypes.func
}

export default InfoPopup;