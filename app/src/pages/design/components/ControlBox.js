import React, { useState, useRef} from 'react';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import '../styles/ControlBox.scss';
         


const ControlBox = ()  =>{
    const menuRef_module= useRef(null);
    const menuRef_scenario =useRef(null);
    const menuRef_screen = useRef(null);
    const menuRef_Teststep = useRef(null);

    const [visibleScenario, setVisibleScenario] = useState(false);
    const [visibleScreen, setVisibleScreen] = useState(false);
    const [visibleTestStep, setVisibleTestStep] = useState(false);



    const menuItemsModule = [
        { label: 'Add Scenario', command: () => console.log('Item 1 selected') },
        { label: 'Add Multiple Scenarios', command: () =>setVisibleScenario(true) },
        { label: 'Rename', command: () => console.log('Item 3 selected') },
        { label: 'Delete', command: () => console.log('Item 3 selected') },
        { label: 'Start Genius', command: () => console.log('Item 3 selected') },
        { label: 'Execute', command: () => console.log('Item 3 selected') }

      ];
      const menuItemsScenario = [
        { label: 'Add Screen', command: () => console.log('Item 1 selected') },
        { label: 'Add Multiple Screens', command: () =>setVisibleScreen(true) },
        { label: 'Rename', command: () => console.log('Item 3 selected') },
        { label: 'Delete', command: () => console.log('Item 3 selected') },
        { label: 'Start Genius', command: () => console.log('Item 3 selected') },
        { label: 'Execute', command: () => console.log('Item 3 selected') }

      ];
      const menuItemsScreen = [
        { label: 'Add Test step', command: () => console.log('Item 1 selected') },
        { label: 'Add Multiple Test step', command: () => setVisibleTestStep(true) },
        { label: 'Capture Elements', command: () => console.log('Item 3 selected') },
        { label: 'Delete', command: () => console.log('Item 3 selected') },
        { label: 'Execute', command: () => console.log('Item 3 selected') }

      ];

      const menuItemsTestSteps = [
        { label: 'Design Test steps', command: () => console.log('Item 1 selected') },
        { label: 'Rename', command: () => console.log('Item 3 selected') },
        { label: 'Delete', command: () => console.log('Item 3 selected') }

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
  


    
 
    return (
        <>
        <Dialog  className='Scenario_dialog' header="Add Multiple Scenarios" visible={visibleScenario} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleScenario(false)}  footer={footerContentScenario}>
                <p className="m-0">
                   
                </p>
            </Dialog>
            <Dialog  className='Scenario_dialog' header="Add Multiple Screens" visible={visibleScreen} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleScreen(false)}  footer={footerContentScreen}>
                <p className="m-0">
                   
                </p>
            </Dialog>
            <Dialog  className='Scenario_dialog' header="Add Multiple Test Steps" visible={visibleTestStep} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleTestStep(false)}  footer={footerContentTeststep}>
                <p className="m-0">
                   
                </p>
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