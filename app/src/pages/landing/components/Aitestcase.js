import React, { useState,useRef } from 'react';
import '../styles/testcase.scss';
import { TabMenu } from 'primereact/tabmenu';
import { TabView, TabPanel } from 'primereact/tabview';
import Input from  './AiInput';
import Output from './AiOutput';

export default function AiTestcase() {
 const [activeIndex, setActiveIndex] = useState(0);
 const[isReset,setIsReset]=useState(false)
const tabMenuRef = useRef(null);
const items = [
   { label: 'Input', icon: <img src="static/imgs/InputAi.svg" alt="Input" className="icon-with-padding mr-1 p-2 text-dark" /> },
   { label: 'Output', icon: <img src="static/imgs/Output.svg" alt="Output" className="icon-with-padding mr-2 p-2 text-dark" /> },
    ];
      const handleNextButtonClick = () => {
      const outputTabIndex = items.findIndex(item => item.label === 'Output');
       if (tabMenuRef.current && outputTabIndex !== -1) {
           setActiveIndex(outputTabIndex);
       }
       };
       const resetInputs =() =>{
        console.log("reset values")
        setIsReset(true);
            }
     const callback=(getDetails)=>{
     console.log(getDetails)
     }
   return (
      <div className='tab_continer p-0 flex flex-column'>
         <div className="row">
            <div className="card">

               <TabMenu model={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} ref={tabMenuRef} className='ai_menu'/>
               {activeIndex === 0 && <Input  items={items} callback={callback} isReset={isReset} />}
               {activeIndex === 1 && <Output  />}
            </div>
         </div>
         {activeIndex === 0 ?(
            <div className='row btn-alignment'>
               <div className=" float-right d-flex justify-content-end gap-2">
                  <button type="button" class="btn-cls btn btn-outline-primary m-1 " style={{ padding: '1rem 2rem' }} onClick={resetInputs}>Reset</button>
                  <button type="button" class=" btn-cls text-light bg-primary  ml-3 " style={{ padding: '1rem 2rem' }} onClick={handleNextButtonClick}>Next</button>
               </div>
            </div>
         ) : null
         }
      </div>
    )
}
        