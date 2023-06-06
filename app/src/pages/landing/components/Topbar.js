import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from "react-router-dom";
import { Menubar } from 'primereact/menubar';
import UserProfile from './UserProfile'
import '../styles/Topbar.scss'

const MenubarDemo = (props) => {
  const [showExtraheaderItem, setShowExtraheaderItem] = useState(false);
  const location = useLocation();
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
    <>
      <Menubar className='Header_size' start={start} end={end} />
    </>
  );
}


export default MenubarDemo;