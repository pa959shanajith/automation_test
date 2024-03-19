// import React, { useState } from 'react';
// import { Button } from "primereact/button";
// import { Dropdown } from "primereact/dropdown";

// const FooterGenAi = () => {
//     const [selectedOption, setSelectedOption] = useState('');
//     const [dropDownValue, setDropDownValue] = useState({});
//     return (
//         <div id="footerBar">
//             <div className="gen-btn2">
//                 <Button label="Generate" onClick={testCaseGenaration} disabled={buttonDisabled}></Button>
//             </div>
//             <div className="gen-btn2">
//                 <Button label="Save" disabled={buttonDisabled} onClick={saveTestcases}></Button>
//             </div>
//             <div className="cloud-test-provider">
//                 {
//                     (selectedOption == 'b' || selectedOption == 'c') && (
//                         <Dropdown
//                             style={{ backgroundColor: "primary" }}
//                             placeholder="Automate" onChange={async (e) => {
//                                 console.log("event", e);
//                                 setDropDownValue(e.value);
//                                 await fetchData(e.value.code)
//                                 console.log("dropDownValue", dropDownValue);
//                             }}
//                             options={multiLevelTestcase}
//                             optionLabel="name"
//                             value={dropDownValue}
//                         />)
//                 }
//             </div>
//         </div>
//     )
// }

// export default FooterGenAi