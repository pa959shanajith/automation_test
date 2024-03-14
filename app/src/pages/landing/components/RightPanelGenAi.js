import { React, useRef , useState} from "react"
import "../styles/GenAi.scss";
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import { Slider } from "primereact/slider";
import { Card } from "primereact/card";
import { Button } from 'primereact/button';

const RightPanelGenAi = () => {
    const [value, setValue] = useState('');
    const [range, setRange] = useState(0);

    const [testType, setTestType] = useState(null);
    const testTypes = [
        { name: 'Positive', code: 'NY' },
        { name: 'Negative', code: 'RM' },

    ];
    return (
        <> 
        <Card>
            <div className='flex flex-row pl-2 pb-2' style={{ gap: "4.5rem" }} >
                <div className="flex flex-column">
                <span><img src="static/imgs/variables_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /><label className="pb-2 label-genai3">Parameters</label></span>
                    <label htmlFor="username" className="pb-2 font-medium">Industry Doamin <span style={{ color: "#d50000" }}>*</span></label>
                    <InputText value={value} onChange={(e) => setValue(e.target.value)} />
                    <label className="pb-2 font-medium">Test Case Type <span style={{ color: "#d50000" }}>*</span></label>

                    <Dropdown value={testType} onChange={(e) => setTestType(e.value)} options={testTypes} optionLabel="name"
                        placeholder="Select a Test Type" className="w-full md:w-14rem" />


                    <div className="w-14rem ">

                        <label className="pb-2 font-medium">Temperature <span style={{ color: "#d50000" }}>*</span></label>

                        <InputText value={range} onChange={(e) => setRange(e.target.value)} className="w-full" />
                        <Slider value={range} onChange={(e) => setRange(e.value)} className="w-full" />
                    </div>
                    <div className="flex flex-row lable-div-temp">
                    <label style={{color:'green'}}> Low</label>
                    <label style={{color:'red'}}> High</label>
                    </div>
                    <div className="gen-btn">
                    <Button label="Generate" ></Button>
                    </div>
                    

                </div>
            </div>
            </Card>


        </>
    )
}

export default RightPanelGenAi;