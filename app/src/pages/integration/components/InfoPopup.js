import React, { Fragment } from 'react';
import { ModalContainer, ScrollBar} from '../../global';
import '../styles/InfoPopup.scss'

/*  component InfoPopup
    props:
        reqDetails - list of dict having details
        setInfo - fn to close popup
*/
const InfoPopup = ({reqDetails,setInfo}) => {
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
        <div className='zphyre-info-box'>
            {reqDetails.length === 0?
                <div className='empty-data'>
                    NO DETAILS FOUND
                </div>
                :
                <Fragment>
                    <ScrollBar>
                    {reqDetails.map((e,i)=>
                        <div key={'info__'+i}>
                            <div>
                                <label className='title'>name : </label>
                                <label>{e.reqName}</label>
                            </div>
                            <div>
                                <label className='title'>Create Date : </label>
                                <label>{e.reqCreationDate}</label>
                            </div>
                            <div>
                                <label className='title'>Description : </label>
                                <label>{e.reqDescription}</label>
                            </div>
                        </div>
                    )}
                    </ScrollBar>
                </Fragment>
            }
        </div>
    )
}

const Footer = ({setInfo}) => <div><button onClick={()=>setInfo(false)}>Ok</button></div>

export default InfoPopup;