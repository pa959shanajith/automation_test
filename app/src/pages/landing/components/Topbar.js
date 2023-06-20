import React, { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink } from "react-router-dom";
import { Menubar } from 'primereact/menubar';
import UserProfile from './UserProfile'
import '../styles/Topbar.scss'
import { Button } from 'primereact/button';
import { Chips } from 'primereact/chips';
import { Menu } from 'primereact/menu';


const MenubarDemo = (props) => {
  const [showExtraheaderItem, setShowExtraheaderItem] = useState(false);
  const [needHelpmenuVisible, setNeedHelpMenuVisible] = useState(false);
  const location = useLocation();
  const needHelpMenuRef = useRef(null);

  const needHelpItems = [
    {
      label: 'Help and Feedback',
      items: [
          {
              label: 'Ask the community',
              icon: <img src="static/imgs/ask the community icon.svg" alt='add icon'  style={{marginRight:"0.5rem",cursor:"not-allowed !important" }} />,
              command: () => {
                  // toast.current.show({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
              }
          },
          {
              label: 'Submit Feedback',
              icon: <img src="static/imgs/comment.svg" alt='add icon' style={{marginRight:"0.5rem",cursor:"not-allowed !important" }} />,
              command: () => {
                  // toast.current.show({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
              }
          },
          {
            label: 'Report a bug',
            icon: <img src="static/imgs/bug_report_black_24dp 1.svg" alt='add icon' style={{marginRight:"0.5rem",cursor:"not-allowed !important" }} />,
            command: () => {
                // toast.current.show({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
            }
        }
      ]
  },
  {
    label: 'Training',
    items: [
        {
            label: 'Training Videos',
            icon: <img src="static/imgs/video.svg" alt='add icon' style={{marginRight:"0.5rem" }}/>,
            command: () => {
              window.open('https://elearning.avoassure.ai','_blank');
                // toast.current.show({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
            }
        },
        {
            label: 'Training Documents',
            icon: <img src="static/imgs/file-o.svg" alt='add icon' style={{marginRight:"0.5rem" }}/>,
            command: () => {
              window.open('https://docs.avoautomation.com','_blank');
            }
        },
    ]
}
  ];

  const toggleMenu = () => {
    setNeedHelpMenuVisible(prevState => !prevState);
    // event.preventDefault();
  };

  useEffect(() => {
    if (["/design", "/execute", "/reports"].includes(location.pathname)) {
      setShowExtraheaderItem(true);
    }
    else {
      setShowExtraheaderItem(false);
    }
  }, [location]);
  const start = <img alt="logo" src="static/imgs/logo.png" onError={(e) => e.target.src = "static/imgs/logo.png"} height="30" className="mr-2"></img>;
  const end = (
    <div className='Headers'>
      <div className='Tab_Menu_Header'>
        <>
          {showExtraheaderItem && <NavLink to="/design" activeClassName="active">Design Studio</NavLink>}
          {showExtraheaderItem && <NavLink to="/execute" activeClassName="active">Configure & Execute</NavLink>}
          {showExtraheaderItem && <NavLink to="/reports" activeClassName="active">Reports</NavLink>}
        </>
      </div>
      <UserProfile />
    </div>
  );
  return (
    <div className='Topbar_Menu'>
      <Menubar className='Header_size' start={start} end={end} />
      {/* <Button className='needHelp' label='' > */}
      <div className='needHelp bg-white shadow-2' onClick={toggleMenu}>
      <img src="static/imgs/need_help.png"  alt="need_Help"  ref={needHelpMenuRef}/>
      {needHelpmenuVisible && (
      <Menu className='needHelp_Menu' model={needHelpItems} onHide={() => setNeedHelpMenuVisible(false)} ref={needHelpMenuRef} overlay/>)}
      </div>
      {/* <Chips label="PrimeReact Chip" /> */}
      {/* </Button> */}
    </div>
  );
}


export default MenubarDemo;