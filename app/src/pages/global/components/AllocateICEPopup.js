import React, {useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setMsg, ModalContainer, ScreenOverlay } from '..' 
import DropDownList from './DropDownList'
import { getPools, getICE_list } from '../../execute/api';
import "../styles/AllocateICEPopup.scss";

//use : Renders Execution Table 
//todo : remove setEachDataFirst 

const AllocateICEPopup = ( {exeTypeLabel, ExeScreen, scheSmartMode, exeIceLabel, SubmitButton, setAllocateICE, allocateICE, modalTitle, modalButton , icePlaceholder} ) => {

    const current_task = useSelector(state=>state.plugin.CT)

    const [inputErrorBorder,setInputErrorBorder] = useState(false)
    const [loading,setLoading] = useState(false)
    const [smartMode,setSmartMode] = useState('normal')
    const [selectedICE,setSelectedICE] = useState("")
    const [poolList,setPoolList] = useState({})
    const [iceStatus,setIceStatus] = useState([])
    const [availableICE,setAvailableICE] = useState([])
    const [chooseICEPoolOptions,setChooseICEPoolOptions] = useState([])
    const [selectedPool,setSelectedPool] = useState("")
    const [iceNameIdMap,setIceNameIdMap] = useState({})

    useEffect(()=>{
        fetchData();
        // eslint-disable-next-line
    }, []);

    const fetchData = async () => {
        setSmartMode('normal');
		setSelectedICE("");
		var projId = current_task.testSuiteDetails[0].projectidts
		var dataforApi = {poolid:"",projectids: [projId]}
		setLoading('Fetching ICE ...')
        const data = await getPools(dataforApi);
        if(data.error){displayError(data.error);return;}
        setPoolList(data);
        var arr = Object.entries(data);
        arr.sort((a,b) => a[1].poolname.localeCompare(b[1].poolname))
        setChooseICEPoolOptions(arr);
        const data1 = await getICE_list({"projectid":projId});
        if(data1.error){displayError(data1.error);return;}
        setIceStatus(data1)
        populateICElist(arr,true,data1)
        setLoading(false);
    }

    const populateICElist =(arr,unallocated,iceStatusdata)=>{
		var ice=[]
        var iceStatusValue = {};
        if( iceStatusdata !== undefined) iceStatusValue = iceStatusdata.ice_ids;
        else if( iceStatusdata === undefined) iceStatusValue= iceStatus.ice_ids;
		const statusUpdate = (ice) => {
			var color = '#fdc010' ;
			var status = 'Offline';
			if(ice.connected){
				color = '#95c353';
				status = 'Online'
			}
			if(ice.mode){
				color = 'red';
				status = 'DND mode'
			}
			return {color,status}
		}
		if(unallocated){
            if(arr===undefined) iceStatusdata = iceStatus;
			arr = Object.entries(iceStatusdata.unallocatedICE)
			arr.forEach((e)=>{
				var res = statusUpdate(e[1])
				e[1].color = res.color;
				e[1].statusCode = res.status;
				ice.push(e[1])
			})
		}else{
            var iceNameIdMapData = {...iceNameIdMap};
			arr.forEach((e)=>{
				if(e[1].ice_list){
					Object.entries(e[1].ice_list).forEach((k)=>{
						if(k[0] in iceStatusValue){
                            var res = statusUpdate(iceStatusValue[k[0]])
                            iceNameIdMapData[k[1].icename] = {}
							iceNameIdMapData[k[1].icename].id = k[0];
							iceNameIdMapData[k[1].icename].status = iceStatusValue[k[0]].status;
							k[1].color = res.color;
							k[1].statusCode = res.status;
							ice.push(k[1])
						}
					})
				}
            })
            setIceNameIdMap(iceNameIdMapData);
		}
		ice.sort((a,b) => a.icename.localeCompare(b.icename))
        setAvailableICE(ice);
    }
    
    const onChangeChooseICEPool = (value) =>{
		var unallocated = false
        var id = value
        var arr;
		if(id==='all'){
			arr = Object.entries(poolList)
		}else if(id==='unallocated'){
            unallocated =  true;
            setSelectedPool("");
		}else{
            arr = Object.entries({[id]:poolList[id]})
            setSelectedPool(id);
		}
        populateICElist(arr,unallocated)
    }

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }

    return (
        <>
            {loading?<ScreenOverlay content={loading}/>:null}
            {allocateICE?
                <div className="allocate-ice-Modal">
                    <ModalContainer 
                        title={modalTitle} 
                        footer={submitModalButton(setInputErrorBorder, iceNameIdMap, SubmitButton, selectedPool, smartMode, selectedICE, modalButton,scheSmartMode,ExeScreen)} 
                        close={()=>{setAllocateICE(false)}}
                        content={MiddleContent(inputErrorBorder, setInputErrorBorder, exeTypeLabel, exeIceLabel, icePlaceholder, chooseICEPoolOptions, onChangeChooseICEPool, availableICE, smartMode, setSmartMode,selectedICE, setSelectedICE, ExeScreen, scheSmartMode)}
                        // modalClass=" modal-md"
                    />
                </div>
            :null} 
            
        </>
    );
} 

const MiddleContent = (inputErrorBorder, setInputErrorBorder, exeTypeLabel, exeIceLabel, icePlaceholder,chooseICEPoolOptions, onChangeChooseICEPool, availableICE, smartMode, setSmartMode, selectedICE, setSelectedICE, ExeScreen, scheSmartMode) => {

    const setSelectedICEState = (value) => {
        if(value==='normal' ) setSelectedICE("");
        else setSelectedICE({});
    }

    return(
        <div >
            {ExeScreen!==undefined && ExeScreen===true ?
                <div className='adminControl-ice popup-content'>
                    <div>
                        <span className="leftControl" title="Execution type">{exeTypeLabel}</span>
                        <select onChange={(event)=>{setSmartMode(event.target.value);setSelectedICEState(event.target.value)}} id='executionType'>
                            <option smart="false" value='normal' >Normal Execution</option>
                            <option smart="true" value='smartModule' >Module Smart Execution</option>
                            <option	smart="true" value='smartScenario'>Scenario Smart Execution</option>
                        </select>
                    </div>
                </div>:null
            }
            <div className='adminControl-ice popup-content'>
                <div>
                    <span className="leftControl" title="Token Name">Select ICE Pool</span>
                    <select id='chooseICEPool' onChange={(event)=>{onChangeChooseICEPool(event.target.value)}} >
                        <option value='unallocated'>Unallocated ICE</option>
                        {chooseICEPoolOptions.map((e,index)=>(
                            <option key={index} value={e[0]}>{e[1].poolname}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='adminControl-ice popup-content'>
				<div>
					<span className="leftControl" title="Token Name">{exeIceLabel}</span>
                    <DropDownList ExeScreen={ExeScreen} inputErrorBorder={inputErrorBorder} setInputErrorBorder={setInputErrorBorder} placeholder={icePlaceholder} data={availableICE} smartMode={(ExeScreen===true?smartMode:scheSmartMode)} selectedICE={selectedICE} setSelectedICE={setSelectedICE} />
				</div>
			</div>

            <div className='adminControl-ice popup-content popup-content-status'>
				<div>
					<span className="leftControl" title="Token Name">ICE Status:</span>
					<div>
						<ul className="e__IceStatus">
							<li className="popup-li">
								<label title='available' className="legends">
									<span id='status' className="status-available"></span>
									 Available
								</label>
								<label title='unavailable' className="legends">
									<span id='status' className="status-unavailable" ></span>
                                    Unavailable
								</label>
								<label title='do not disturb' className="legends">
									<span id='status' className="status-dnd"></span>
									 Do Not Disturb
								</label>
							</li>
						</ul>
					</div>
				</div>
			</div>
        </div>
    )
}

const submitModalButton = (setInputErrorBorder, iceNameIdMap, SubmitButton,  selectedPool, smartMode, selectedICE, modalButton, scheSmartMode, ExeScreen) => {
    const executionData = {};
    executionData.type = (ExeScreen===true?((smartMode==="normal")?"":smartMode):scheSmartMode)
    executionData.poolid =  selectedPool
    if((ExeScreen===true?smartMode:scheSmartMode) !== "normal") executionData.targetUser = Object.keys(selectedICE).filter((icename)=>selectedICE[icename]);
    else executionData.targetUser = selectedICE

    const buttonAction = () => {
        if(ExeScreen!==true && selectedICE==="") setInputErrorBorder(true);
        else SubmitButton(executionData, iceNameIdMap);
    }

    return(
        <div>
            <button type="button" onClick={()=>{buttonAction()}} >{modalButton}</button>
        </div>
    )
}

export default AllocateICEPopup;