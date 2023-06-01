import React,{useState,useEffect} from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Menubar } from 'primereact/menubar';
import LogOut from './LogOut';
import DisplayProject from './SidePanelProjectsDisplay';
import UserProfile from './UserProfile'
import '../styles/userProfile.scss'
import { TabMenu } from 'primereact/tabmenu';
import Report from '../../report/components/reports';
import Execute from '../../execute/Components/Execute';

const MenubarDemo = (props) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
     if (["/design", "/execute", "/reports"].includes(location.pathname)) 
       {
          setShowExtraItem(true);
        }
         else {
          setShowExtraItem(false);
        }
      }, [location]);
      const [showExtraItem, setShowExtraItem] = useState(false);
      const handleTabChange = (event) => {
        setActiveIndex(event.value);
      };
      const navigateToPages =(path)=>{
        navigate(path)
      }
      const Tabitems = [
        {label: 'Design Studio',url: '/design',command: ()=>navigateToPages('/design')},
        {label: 'Configure & Execute' ,url: '/execute',command: ()=>navigateToPages('/execute')},
        {label: 'Reports',url: '/reports', command: ()=>navigateToPages('/reports')},
    ];
    const start = <img alt="logo" src="static/imgs/logo.png" onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} height="30" className="mr-2"></img>;
    const end = (
        <div className='Headers'>
       <div className='tab_menu Tab_Menu_Header'>{showExtraItem && <TabMenu model={Tabitems}  activeIndex={activeIndex} onTabChange={handleTabChange}/>}</div>
        <UserProfile/>
        </div>
        );
    return (
            <>
               <Menubar className='Header_size'  start={start} end={end}/>
            </>
    );
    }


    export default MenubarDemo;