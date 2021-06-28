import React, { useState, useEffect } from 'react';
import { ModalContainer, ScreenOverlay, PopupMsg } from '../../global';
import { getUserICE,setDefaultUserICE } from '../api';
import '../styles/ChangeDefaultIce.scss';

/*
    Component: Change Default Ice Modal Popup
    Uses: Renders the modal Popup for changing default Ice
    Props: setShowModal -> setState for displaying and hiding modal

*/

const ChangeDefaultIce = ({setShowMainPopup}) => {

    const [chooseDefICE, setChooseDefICE] = useState([])
    const [defICE, setDefICE] = useState("")
    const [loading,setLoading] = useState(false)
    const [showPopup,setShowPopup] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""})

    useEffect( ()=>{
        fetchIce();
    }, []);
   
    const fetchIce = async () => {
        setLoading("Fetching ICE ...");
        try{
            const data = await getUserICE();
            setLoading(false);
            if(data == 'fail' || !data.ice_list || data.ice_list.length<1){
                setPopupState({show:true,title:"Change Default ICE",content:unavailableLocalServer_msg});
            }
            else{
                setChooseDefICE(data.ice_list);
                setDefICE(data.ice_list[0]);
                setShowPopup(true);
            }
        }catch(error){
            setLoading(false)
            console.error(error)
            setPopupState({show:true,title:"Change Default ICE",content:unavailableLocalServer_msg});
        }
    };

    const Content = () => (
        <div className="defIce_inputs_container">
            <span className="leftControl defIce-span " title="Token Name">Select Default ICE :</span>
            <select id='chooseDefICE' onChange={(e)=>{setDefICE(e.target.value)}}>
                {chooseDefICE.map((e,index)=>(
                    <option key={index} value={e}>{e}</option>
                ))}
            </select>
        </div>
    );

    const Footer = () => (
        <div >
            <button onClick={()=>{changeDefICEClick()}}>Submit</button>
        </div>
    );
    
    const changeDefICEClick = async () =>{
		setLoading("Setting Default ICE ...")
        var ice = defICE;
		try{
            const data = await setDefaultUserICE(ice);
            setLoading(false);
			if(data == 'success'){
                setPopupState({show:true,title:"Change Default ICE",content:"Changed default ICE successfully"});
			}else{
                setPopupState({show:true,title:"Change Default ICE",content:"Failed to change default ICE"});
            }
		}catch(error){
            setLoading(false)
			console.error(error)
			setPopupState({show:true,title:"Change Default ICE",content:"Failed to change default ICE"});
		}
	}
    return (
        <>
            {showPopup?
                <ModalContainer
                    close={()=>{setShowMainPopup(false);}}
                    title={"Change Default ICE"}
                    content={Content()}
                    footer={Footer()}
                    modalClass={" modal-md"}
                />
            :null}
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={()=>{setPopupState({show:false});setShowMainPopup(false);}} close={()=>{setPopupState({show:false});setShowMainPopup(false);}} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
        </>   
    );
}

const unavailableLocalServer_msg = "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server.";

export default ChangeDefaultIce;