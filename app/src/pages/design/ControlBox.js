import React, { useState, useRef} from 'react';
import { Menu } from 'primereact/menu';
import TreeGraph from './TreeGraph';
import StaticDataForMindMap from './staticDataForMindMap';


const ControlBox = ()  =>{
    
    const [currentMenuItems, setCurrentMenuItems] = useState([]);
    const menuRef_module= useRef(null);
    const menuRef_scenario =useRef(null);
    const menuRef_screen = useRef(null);


    const menuItemsModule = [
        { label: 'Add Scenario', command: () => console.log('Item 1 selected') },
        { label: 'Add Multiple Scenarios', command: () => console.log('Item 2 selected') },
        { label: 'Rename', command: () => console.log('Item 3 selected') },
        { label: 'Delete', command: () => console.log('Item 3 selected') },
        { label: 'Start Genius', command: () => console.log('Item 3 selected') },
        { label: 'Execute', command: () => console.log('Item 3 selected') }

      ];
      const menuItemsScenario = [
        { label: 'Add Screen', command: () => console.log('Item 1 selected') },
        { label: 'Add Multiple Screens', command: () => console.log('Item 2 selected') },
        { label: 'Rename', command: () => console.log('Item 3 selected') },
        { label: 'Delete', command: () => console.log('Item 3 selected') },
        { label: 'Start Genius', command: () => console.log('Item 3 selected') },
        { label: 'Execute', command: () => console.log('Item 3 selected') }

      ];
      const menuItemsScreen = [
        { label: 'Add Test step', command: () => console.log('Item 1 selected') },
        { label: 'Add Multiple Test step', command: () => console.log('Item 2 selected') },
        { label: 'Capture Elements', command: () => console.log('Item 3 selected') },
        { label: 'Delete', command: () => console.log('Item 3 selected') },
        { label: 'Execute', command: () => console.log('Item 3 selected') }

      ];

    
 
    return (
        <>
        <Menu model={menuItemsModule} popup  ref={menuRef_module} />
        <Menu model={menuItemsScenario} popup ref={menuRef_scenario} />
        <Menu model={menuItemsScreen} popup ref={menuRef_screen} />
        <div className='menu_items_ref'>
      <button  onClick={ (e) => menuRef_module.current.toggle(e) }>modules</button>
      <button  onClick={ (e) => menuRef_scenario.current.toggle(e) }>scenarios</button>
      <button  onClick={(e) => menuRef_screen.current.toggle(e)}>screens</button>

      </div>

        

        </>
        
    )
}

export default ControlBox;