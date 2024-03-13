import { React, useRef , useState} from "react"
import "../styles/GenAi.scss";
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

const MiddleContainerGenAi = () =>{
    const [selectedOption, setSelectedOption] = useState(null);
    const [sprints, setSprints] = useState(null);
    const [userStory, setUserStory] = useState(null);
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
                    <label className="pb-2 label-genai">Generate Test Case</label>
                    <div className="flex flex-row" style={{ gap:"3rem" }}>
                    <div className="p-field-radiobutton">
        <RadioButton
          inputId="optionA"
          name="option"
          value="a"
          onChange={handleOptionChange}
          checked={selectedOption === 'a'}
        />
        <label htmlFor="optionA" className="pb-2 label-genai">System level test cases</label>
      </div>
      <div className="p-field-radiobutton">
        <RadioButton
          inputId="optionB"
          name="option"
          value="b"
          onChange={handleOptionChange}
          checked={selectedOption === 'b'}
        />
        <label htmlFor="optionB" className="pb-2 label-genai">Module level test case</label>
      </div>
      <div className="p-field-radiobutton">
        <RadioButton
          inputId="optionC"
          name="option"
          value="c"
          onChange={handleOptionChange}
          checked={selectedOption === 'c'}
        />
        <label htmlFor="optionC" className="pb-2 label-genai">User story level test case</label>
      </div>


        </div>
        {selectedOption === 'c' && (
        <div className="flex flex-row" style={{ gap:"3rem" }}>
        <label className="pb-2 font-medium">Sprints<span style={{ color: "#d50000" }}>*</span></label>

<Dropdown value={sprints} onChange={(e) => setSprints(e.value)} options={sprint} optionLabel="name"
    placeholder="Select a Sprinte" className="w-full md:w-14rem" />

<label className="pb-2 font-medium">User story<span style={{ color: "#d50000" }}>*</span></label>

<Dropdown value={userStory} onChange={(e) => setUserStory(e.value)} options={userStrories} optionLabel="name"
    placeholder="Select a User story" className="w-full md:w-14rem" />

<div className="gen-btn">
                    <Button label="Generate" ></Button>
                    </div>
        </div>
        )}

        </div>
        </>
    )
    

}

export default MiddleContainerGenAi;