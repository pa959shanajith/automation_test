import React, { useState, useRef} from 'react';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import '../styles/ControlBox.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Toolbar } from 'primereact/toolbar';


         


const ControlBox = ()  =>{
    const menuRef_module= useRef(null);
    const menuRef_scenario =useRef(null);
    const menuRef_screen = useRef(null);
    const menuRef_Teststep = useRef(null);

    const [visibleScenario, setVisibleScenario] = useState(false);
    const [visibleScreen, setVisibleScreen] = useState(false);
    const [visibleTestStep, setVisibleTestStep] = useState(false);
    const [addScenario , setAddScenario] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [inputValScreen , setinputValScreen]= useState("");
    const [showInput, setShowInput] = useState(false);
    const [addScreen , setAddScreen] = useState([]);
    const[ showInputScreen , setShowInputScreen]= useState(false);
    const [addTestStep , setAddTestStep] = useState([]);
    const [inputValTestStep , setinputValTestStep]= useState("");
    const[ showInputTestStep , setShowInputTestStep]= useState(false);
    const [selectedRowsScenario, setSelectedRowsScenario] = useState([]);
    const [editingRowScenario, setEditingrowScenario] = useState([]);
    
    



    const menuItemsModule = [
        { label: 'Add Scenario' },
        { label: 'Add Multiple Scenarios', command: () =>setVisibleScenario(true) },
        { label: 'Rename'  },
        { label: 'Delete' },
        { label: 'Start Genius'},
        { label: 'Execute' }

      ];
      const menuItemsScenario = [
        { label: 'Add Screen'},
        { label: 'Add Multiple Screens', command: () =>setVisibleScreen(true) },
        { label: 'Rename' },
        { label: 'Delete' },
        { label: 'Start Genius' },
        { label: 'Execute' }

      ];
      const menuItemsScreen = [
        { label: 'Add Test step' },
        { label: 'Add Multiple Test step', command: () => setVisibleTestStep(true) },
        { label: 'Capture Elements' },
        { label: 'Delete' },
        { label: 'Execute' }

      ];

      const menuItemsTestSteps = [
        { label: 'Design Test steps' },
        { label: 'Rename' },
        { label: 'Delete' }

      ];

    const footerContentScenario = (
        <div>
            <Button label="Add Scenarios"  onClick={() => setVisibleScenario(false)} className="add_scenario_btn" /> 
        </div> 
    );
    const footerContentScreen =(
    <div>
              <Button label="Add Screens"  onClick={() => setVisibleScreen(false)} className="add_scenario_btn" /> 
          </div>
    )
    const footerContentTeststep =(
      <div>
                <Button label="Add Test Step"  onClick={() => setVisibleTestStep(false)} className="add_scenario_btn" /> 
            </div>
      )

      const addRowScenario = () => {
        const newRow = { id: addScenario.length + 1, value : inputValue };
        setAddScenario([...addScenario, newRow]);
        setInputValue("");
        setShowInput(true);
      };

      const addRowScreen = () => {
        const newRowScreen = { id: addScreen.length + 1, value : inputValScreen };
        setAddScreen([...addScreen, newRowScreen]);
        setinputValScreen("");
        setShowInputScreen(true);
      };

      
      const addRowTestStep = () => {
        const newRowTestStep = { id: addTestStep.length + 1, value : inputValTestStep };
        setAddTestStep([...addTestStep, newRowTestStep]);
        setinputValTestStep("");
        setShowInputTestStep(true);
      };

      const updateRow = (rowData, updatedValue) => {
        const updatedData = addScenario.map((row) => (row.id === rowData.id ? { ...row, value: updatedValue } : row));
        setAddScenario(updatedData);
      };

      const headerCheckboxClicked = (event) => {
        if (event.checked) {
          setSelectedRowsScenario(addScenario.map(row => row.id));
        } else {
          setSelectedRowsScenario([]);
        }
      };

      const rowCheckboxClicked = (event, rowData) => {
        if (event.checked) {
          setSelectedRowsScenario([...selectedRowsScenario, rowData.id]);
        } else {
          setSelectedRowsScenario(selectedRowsScenario.filter(id => id !== rowData.id));
        }
      };

      const toggleEditable = () => {
        setEditingrowScenario(!editingRowScenario);
      };

      const updateRowScreen = (rowDataScreen, updatedValueScreen) => {
        const updatedDataScreen = addScreen.map((row) => (row.id === rowDataScreen.id ? { ...row, value: updatedValueScreen } : row));
        setAddScreen(updatedDataScreen);
      };

      const updateRowTestStep = (rowDataTestStep, updatedValueTestStep) => {
        const updatedDataTestStep = addTestStep.map((row) => (row.id === rowDataTestStep.id ? { ...row, value: updatedValueTestStep } : row));
        setAddTestStep(updatedDataTestStep);
      };

     






      const columns = [
        {
          field: "checkbox",
          header: <Checkbox onChange={headerCheckboxClicked} checked={selectedRowsScenario.length === addScenario.length && addScenario.length !== 0} />,
          body: (rowData) => <Checkbox onChange={(event) => rowCheckboxClicked(event, rowData)} checked={selectedRowsScenario.includes(rowData.id)} />,
          style: { width: '50px' },
        },
        {
          field: "addScenario",
          header: "Add Scenario",
          body: (rowData) => {
            if (showInput && rowData.id === addScenario.length) {
              return (
                <InputText placeholder='Add Scenario Name' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onBlur={() => updateRow(rowData, inputValue)} />
              );
            } else if(rowData.editingRowScenario) {
              return (
              <InputText placeholder='Edit Scenario Name' value={rowData.value} onChange={(e) => updateRow(rowData, e.target.value)} onBlur={() => toggleEditable(rowData)} />
              )
            }
            else {
              return <div onDoubleClick={() => toggleEditable(rowData)}>{rowData.value}</div>; // double click to edit
            }
          },
        },
      ];

      const columnsScreen = [
        {
          field: "addScreen",
          header: "Add Screen",
          body: (rowDataScreen) => {
            if (showInputScreen && rowDataScreen.id === addScreen.length) {
              return (
                <InputText placeholder='Add Screen Name' value={inputValScreen} onChange={(e) => setinputValScreen(e.target.value)} onBlur={() => updateRowScreen(rowDataScreen, inputValScreen)} />
              );
            } else {
              return <div onClick={() => setShowInputScreen(rowDataScreen.id === addScreen.length)}>{rowDataScreen.value}</div>;
            }
          },
        },
      ];

      const columnsTestStep = [
        {
          field: "addTestStep",
          header: "Add Test Step",
          body: (rowDataTestStep) => {
            if (showInputTestStep && rowDataTestStep.id === addTestStep.length) {
              return (
                <InputText placeholder='Add Test Step Name' value={inputValTestStep} onChange={(e) => setinputValTestStep(e.target.value)} onBlur={() => updateRowTestStep(rowDataTestStep, inputValTestStep)} />
              );
            } else {
              return <div onClick={() => setShowInputTestStep(rowDataTestStep.id === addTestStep.length)}>{rowDataTestStep.value}</div>;
            }
          },
        },
      ];

      const startContent = (
        <React.Fragment>
           
           
        </React.Fragment>
    );
    
      
      
    return (
        <>
        <Dialog  className='Scenario_dialog' visible={visibleScenario} header="Add Multiple Scenario" style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleScenario(false)}  footer={footerContentScenario}>
        <Toolbar  className="toolbar_scenario" start={startContent}  />
       
        <div style={{ height: '86%', overflow: 'auto' }}>
            <DataTable value={addScenario} tableStyle={{ minWidth: '20rem' }} headerCheckboxSelection={true} scrollable scrollHeight="calc(100% - 38px)" > 
              {columns.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} ></Column>
              ))}   
          
            </DataTable>
            <button className='add_row_btn' onClick={() => addRowScenario()} >+ Add Row </button> 
            </div>
            
        
            </Dialog>


            <Dialog  className='Scenario_dialog' header="Add Multiple Screens" visible={visibleScreen} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleScreen(false)}  footer={footerContentScreen}>
            <div style={{ height: '100%', overflow: 'auto' }}>
            <DataTable value={addScreen} tableStyle={{ minWidth: '20rem' }} scrollable scrollHeight="calc(100% - 38px)" >
              {columnsScreen.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} ></Column>
              ))}    
            </DataTable>
            </div>
            <button className='add_row_btn' onClick={() =>addRowScreen ()} >+ Add Row </button> 
            </Dialog>


            <Dialog  className='Scenario_dialog' header="Add Multiple Test Steps" visible={visibleTestStep} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleTestStep(false)}  footer={footerContentTeststep}>
            <div style={{ height: '100%', overflow: 'auto' }}>
            <DataTable value={addTestStep} tableStyle={{ minWidth: '20rem' }} scrollable scrollHeight="calc(100% - 38px)">
              {columnsTestStep.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} ></Column>
              ))}  
            </DataTable>
            </div>
            <button className='add_row_btn' onClick={() =>addRowTestStep ()} >+ Add Row </button> 
            </Dialog>




        <Menu model={menuItemsModule} popup  ref={menuRef_module} />
        <Menu model={menuItemsScenario} popup ref={menuRef_scenario} />
        <Menu model={menuItemsScreen} popup ref={menuRef_screen} />
        <Menu model={menuItemsTestSteps} popup ref={menuRef_Teststep} />


        <div className='menu_items_ref'>
      <button  onClick={ (e) => menuRef_module.current.toggle(e) }>modules</button>
      <button  onClick={ (e) => menuRef_scenario.current.toggle(e) }>scenarios</button>
      <button  onClick={(e) => menuRef_screen.current.toggle(e)}>screens</button>
      <button  onClick={(e) => menuRef_Teststep.current.toggle(e)}>Test steps</button>


      </div>

        

        </>
        
    )
}

export default ControlBox;