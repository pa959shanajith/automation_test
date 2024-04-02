import { React, useEffect, useRef , useState} from "react"
import "../styles/GenAi.scss";
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import { Slider } from "primereact/slider";
import { Card } from "primereact/card";
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { disableAction } from "../../design/designSlice";
import {setEditParameters} from "../../settings/settingSlice";


const RightPanelGenAi = () => {
    const [value, setValue] = useState('');
    const [range, setRange] = useState(0);
    const dispatchAction = useDispatch();
    const genAiParameters = useSelector((state) => state.setting.genAiParameters);
    const editParameters = useSelector((state) => state.setting.editParameters);
    console.log(genAiParameters);

    useEffect(()=>{
      setValue(genAiParameters.domain)
      setRange(genAiParameters.temperature)
      setTestType({name : genAiParameters.test_type ? genAiParameters.test_type.toLowerCase() : ''})

    },[genAiParameters])
   

    const [testType, setTestType] = useState(null);
    const testTypes = [
        { name: 'positive' },
        { name: 'negative' }
    ];
    return (
        <>
                    <div className="flex flex-column w-full" style={{minHeight:"50%"}}>
                        <div className="parameter_container pb-2"><img src="static/imgs/parameters_icon 1.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /><label className="pb-2 label-genai3">Parameters</label></div>
                        <div className="flex flex-column gap-4 mt-2">
                            <div className="w-full">
                                <label htmlFor="username" className="pb-2 font-medium">Industry Domain <span style={{ color: "#d50000" }}>*</span></label>
                                <InputText className="w-full" value={value} onChange={(e) => { setValue(e.target.value); dispatchAction(setEditParameters({ "domain": e.target.value })) }} />
                            </div>
                            <div className="w-full">
                                <label className="pb-2 font-medium">Test Case Type <span style={{ color: "#d50000" }}>*</span></label>
                                <Dropdown value={testType} onChange={(e) => { setTestType(e.value); dispatchAction(setEditParameters({ "test_type": e.value.name })) }} options={testTypes} optionLabel="name"
                                    placeholder="Select a Test Type" className="w-full" />
                            </div>
                            <div className="w-full">
                                <label className="pb-2 font-medium">Accuracy <span style={{ color: "#d50000" }}>*</span></label>
                                <InputText value={range > 1 ? `0.${range}` : range} onChange={(e) => { setRange(e.target.value); dispatchAction(setEditParameters({ "temperature": e.target.value })); }} className="w-full" />
                                <Slider value={range * 100} onChange={(e) => {
                                    setRange(e.value/100)
                                }} className="w-full" />
                            </div>
                        </div>

                        <div className="w-14rem ">

                        </div>
                        <div className="flex flex-row w-full justify-content-between">
                            <label style={{ color: 'green' }}> Low</label>
                            <label style={{ color: 'red' }}> High</label>
                        </div>
                        {/* <div className="gen-btn">
                    <Button label="Generate" ></Button>
                    </div> */}


                    </div>
        </>
    )
}

export default RightPanelGenAi;