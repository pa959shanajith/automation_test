import React, { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { Menubar } from 'primereact/menubar';
import UserProfile from './UserProfile'
import { Menu } from 'primereact/menu';
import '../styles/Topbar.scss'


const MenubarDemo = (props) => {
  const [showExtraheaderItem, setShowExtraheaderItem] = useState(false);
  const location = useLocation();
  const needHelpmenuLeft = useRef(null);

  const needHelpItems = [
    {
      label: 'Help and Feedback',
      items: [
          {
              label: 'Ask the community',
              disabled: true,
              icon: <img src="static/imgs/ask the community icon.svg" alt='add icon'  style={{marginRight:"0.5rem"}} />,
              command: () => {
              }
          },
          {
              label: 'Submit Feedback',
              disabled: true,
              icon: <img src="static/imgs/comment.svg" alt='add icon' style={{marginRight:"0.5rem"}} />,
              command: () => {
              }
          },
          {
            label: 'Report a bug',
            disabled: true,
            icon: <img src="static/imgs/bug_report_black_24dp 1.svg" alt='add icon' style={{marginRight:"0.5rem" }} />,
            command: () => {
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

  useEffect(() => {
    if (["/design", "/execute", "/reports"].includes(location.pathname)) {
      setShowExtraheaderItem(true);
    }
    else {
      setShowExtraheaderItem(false);
    }
  }, [location]);

  const start = (
    <NavLink to="/landing" className="activeLanding">
      <img alt="logo" src="static/imgs/logo.png" onError={(e) => e.target.src = "static/imgs/logo.png"} height="30" className="mr-2"></img>
    </NavLink>
  );

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
      <div className="card needHelp flex justify-content-center bg-white shadow-2">
        <img className='needHelp_img' src="static/imgs/need_help.png" alt="need_Help" onClick={(event) => needHelpmenuLeft.current.toggle(event)} aria-controls="popup_menu_left" aria-haspopup/>
        <Menu className='needHelp_Menu w-13rem top-50' model={needHelpItems} popup ref={needHelpmenuLeft}/>
      </div>
    </div>
  );
}


export default MenubarDemo;