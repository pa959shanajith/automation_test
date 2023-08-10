import React, { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { Menubar } from 'primereact/menubar';
import UserProfile from './UserProfile'
import { Menu } from 'primereact/menu';
import '../styles/Topbar.scss';
import { Tooltip } from 'primereact/tooltip';
import { useSelector} from 'react-redux';
import WelcomeWizard from "../../login/components/WelcomeWizard";
const MenubarDemo = (props) => {
  const [showExtraheaderItem, setShowExtraheaderItem] = useState(false);
  const location = useLocation();
  const needHelpmenuLeft = useRef(null);
  const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const [showTooltip_help, setShowTooltip_help] = useState(false);
  const imageRefhelp = useRef(null);
  const [showTCPopup,setShowTCPopup] = useState(false);
  const [show_WP_POPOVER, setPopover] = useState(false);
  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if(!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo ;
  const handleTooltipToggle = () => {
    const rect = imageRefhelp.current.getBoundingClientRect();
    setCardPosition({ right: rect.right, left: rect.left, top: rect.top, bottom: rect.bottom });
    setShowTooltip_help(true);
  };

  const handleMouseLeave1 = () => {
    setShowTooltip_help(false);
  };

  useEffect(()=>{
    if (userInfo.tandc) {
        setShowTCPopup(true);
    }
  },[userInfo])

  const needHelpItems = [
    {
      label: 'Help and Feedback',
      items: [
        {
          label: 'Ask the community',
          disabled: true,
          icon: <img src="static/imgs/ask the community icon.svg" alt='add icon' style={{ marginRight: "0.5rem" }} />,
          command: () => {
          }
        },
        {
          label: 'Submit Feedback',
          disabled: true,
          icon: <img src="static/imgs/comment.svg" alt='add icon' style={{ marginRight: "0.5rem" }} />,
          command: () => {
          }
        },
        {
          label: 'Report a bug',
          disabled: true,
          icon: <img src="static/imgs/bug_report_black_24dp 1.svg" alt='add icon' style={{ marginRight: "0.5rem" }} />,
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
          icon: <img src="static/imgs/video.svg" alt='add icon' style={{ marginRight: "0.5rem" }} />,
          command: () => {
            window.open('https://elearning.avoassure.ai', '_blank');
          }
        },
        {
          label: 'Training Documents',
          icon: <img src="static/imgs/file-o.svg" alt='add icon' style={{ marginRight: "0.5rem" }} />,
          command: () => {
            window.open('https://docs.avoautomation.com', '_blank');
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
      <img alt="logo" src="static/imgs/logo.png" onError={(e) => e.target.src = "static/imgs/logo.png"} height="30" className="mr-2" title="Go to Home"></img>
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

  const tooltip_needhelp = {
    fontSize: "12px",fontfamily:"Open Sans",  fontWeight: "normal",marginleft:"2rem"
  };

  return (
    <div className='Topbar_Menu'>
      <Menubar className='Header_size' start={start} end={end} />
      <div className='Need_Help_menu'>
        <div className="card needHelp flex justify-content-center bg-white shadow-2">
          <img className='needHelp_img' ref={imageRefhelp} onMouseEnter={() => handleTooltipToggle()} onMouseLeave={() => handleMouseLeave1()} src="static/imgs/need_help.png" alt="need_Help" onClick={(event) => needHelpmenuLeft.current.toggle(event)} aria-controls="popup_menu_left" aria-haspopup />
          {/* {showTooltip_help && (<div className='card__insprint1' style={{ position: 'absolute',  right: `${cardPosition.right - 1500}px`, top: `${cardPosition.top- 775}px`, display: 'block' }}>
        <div className='text__insprint__content'>
      <h3 className='text__insprint__title'>Need help?</h3>
      <p className='text__insprint__info'>View training videos and documents.</p>
    </div>
                 
                </div>)} */}
          <Tooltip target=".needHelp_img" position="left" content="View training videos and documents." style={tooltip_needhelp} />
          <Menu className='needHelp_Menu w-13rem' id='needHelp_font' model={needHelpItems} popup ref={needHelpmenuLeft} />
        </div>
      </div>
      {showTCPopup && (userInfo.welcomeStepNo!==undefined)?<WelcomeWizard showWizard={setShowTCPopup} userInfo={userInfo} setPopover={setPopover}/>:null}
    </div>
  );
}


export default MenubarDemo;