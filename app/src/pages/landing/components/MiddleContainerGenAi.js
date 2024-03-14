import { React, useRef , useState} from "react"
import "../styles/GenAi.scss";
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from "primereact/inputtextarea";

const MiddleContainerGenAi = () =>{
    const [selectedOption, setSelectedOption] = useState(null);
    const [sprints, setSprints] = useState(null);
    const [userStory, setUserStory] = useState(null);
    const [value, setValue] = useState('');
    const sprint = [
        { name: 'Positive', code: 'NY' },
        { name: 'Negative', code: 'RM' },

    ];
    const userStrories = [
        { name: 'Positive', code: 'NY' },
        { name: 'Negative', code: 'RM' },

    ];

    const handleOptionChange = (event) => {
        setSelectedOption(event.value);
      };
    return(
        <>
            <div className='flex flex-column pl-2 pb-2' style={{ gap: "0.5rem" }} >

                <span> <img src="static/imgs/generate_tetscase.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /> <label className="pb-2 label-genai3">Generate Test Case</label></span>
                <div className="flex flex-row" style={{ gap: "3rem" }}>
                    <div className="p-field-radiobutton">
                        <RadioButton
                            inputId="optionA"
                            name="option"
                            value="a"
                            onChange={handleOptionChange}
                            checked={selectedOption === 'a'}
                        />
                        <label htmlFor="optionA" className="pb-2 label-genai2">System level test cases  <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></label>
                    </div>
                    <div className="p-field-radiobutton">
                        <RadioButton
                            inputId="optionB"
                            name="option"
                            value="b"
                            onChange={handleOptionChange}
                            checked={selectedOption === 'b'}
                        />
                        <label htmlFor="optionB" className="pb-2 label-genai2">Module level test case <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></label>
                    </div>
                    <div className="p-field-radiobutton">
                        <RadioButton
                            inputId="optionC"
                            name="option"
                            value="c"
                            onChange={handleOptionChange}
                            checked={selectedOption === 'c'}
                        />
                        <label htmlFor="optionC" className="pb-2 label-genai2">User story level test case <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></label>
                    </div>

                 


        </div>
       {selectedOption!='c' && selectedOption != 'a' && selectedOption != 'b' ? (<div className='flex flex-column img-container'>
                   <span> <img src="static/imgs/choose_illustration.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></span>
                   <label> Select any one of the three methods mentioned above</label>
                    </div>) : ""}
                {selectedOption === 'c' && (
                    <>
                    <div className="flex flex-row" style={{ gap: "13rem" }}>
                        <label className="pb-2 label-genai">Sprints<span style={{ color: "#d50000" }}>*</span></label>
                        <label className="pb-2 label-genai">User story<span style={{ color: "#d50000" }}>*</span></label>
                       </div>

                        <div className="flex flex-row" style={{ gap: "3rem" }}>
                        
                        <Dropdown value={sprints} onChange={(e) => setSprints(e.value)} options={sprint} optionLabel="name"
                            placeholder="Select a Sprinte" className="w-full md:w-14rem"  style={{height:'3rem'}}/>



                        <Dropdown value={userStory} onChange={(e) => setUserStory(e.value)} options={userStrories} optionLabel="name"
                            placeholder="Select a User story" className="w-full md:w-14rem"  style={{height:'3rem'}}/>

                        <div className="gen-btn2">
                            <Button label="Generate" ></Button>
                        </div>
                    </div>

                    {/* <div className="card flex justify-content-center">
            <InputTextarea value={value} onChange={(e) => setValue(e.target.value)} rows={5} cols={30} />
        </div> */}
                    </>

                )}

        </div>

        </>
    )
    

}

export default MiddleContainerGenAi;