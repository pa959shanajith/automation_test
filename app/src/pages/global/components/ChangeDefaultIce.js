import React, { useState, useEffect } from 'react';
import { ModalContainer, ScreenOverlay, setMsg, Messages as MSG } from '../../global';
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

    useEffect( ()=>{
        fetchIce();
    }, []);

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
   
    const fetchIce = async () => {
        setLoading("Fetching ICE ...");
        try{
            const data = await getUserICE();
            if(data.error){displayError(data.error);return;}
            setLoading(false);
            if(data == 'fail' || !data.ice_list || data.ice_list.length<1){
                displayError(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER)
            }
            else{
                setChooseDefICE(data.ice_list);
                setDefICE(data.ice_list[0]);
                setShowPopup(true);
            }
        }catch(error){
            setLoading(false)
            console.error(error)
            displayError(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER)
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
                displayError(MSG.GLOBAL.SUCC_CHANGE_DEFAULT_ICE);
			}else{
                displayError(MSG.GLOBAL.ERR_CHANGE_DEFAULT_ICE);
            }
		}catch(error){
            setLoading(false)
			console.error(error)
			displayError(MSG.GLOBAL.ERR_CHANGE_DEFAULT_ICE);
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
            {loading?<ScreenOverlay content={loading}/>:null}
        </>   
    );
}

export default ChangeDefaultIce;