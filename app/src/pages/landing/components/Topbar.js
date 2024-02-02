import React, { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { Menubar } from 'primereact/menubar';
import UserProfile from './UserProfile'
import { Menu } from 'primereact/menu';
import '../styles/Topbar.scss';
import { Tooltip } from 'primereact/tooltip';
import { useSelector} from 'react-redux';
import WelcomeWizard from "../../login/components/WelcomeWizard";
import { Toast } from "primereact/toast";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import DropDownList from "../../global/components/DropDownList";
import { ListBox } from "primereact/listbox";
import { Tag } from "primereact/tag";
import { createKeyword } from "../../design/containers/DesignTestStep";
import {
  DesignModal,
  inputKeywordName,
} from "../../design/containers/DesignTestStep";
import { color } from "d3";
import { TieredMenu } from "primereact/tieredmenu";

const MenubarDemo = (props) => {
  const toast = useRef();
  const notificationMenu = useRef(null);
  const [isMenuVisible, setMenuVisibility] = useState(false);
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
    if (userInfo.tandc && userInfo.welcomeStepNo < 3) {
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

  const keywordItems = [
    {
      label: <p style={{ color: "green" }}>Approved</p>,
      items: [
        {
          template: (<div className="flex flex-row justify-content-left" style={{marginLeft:"1.2rem" ,alignContent:"center"}}>
          
          <p style={{margin: "0 0 0.75rem 0.5rem"}}>Keyword 1</p><i className="pi pi-times" style={{marginTop:'0.25rem', marginLeft:' 6rem'}}></i>
          </div>)
        },
        {
          template: (<div className="flex flex-row justify-content-left" style={{marginLeft:"1.2rem",alignContent:"center"}}>
          
          <p style={{margin: "0 0 0.75rem 0.5rem"}}>Keyword 2</p><i className="pi pi-times" style={{marginTop:'0.25rem', marginLeft:' 6rem'}}></i>
          </div>)
        },
        {
          template: (<div className="flex flex-row justify-content-left" style={{marginLeft:"1.2rem" ,alignContent:"center"}}>
          
          <p style={{margin: "0 0 0.75rem 0.5rem"}}>Keyword 3</p><i className="pi pi-times" style={{marginTop:'0.25rem', marginLeft:' 6rem'}}></i>
          </div>)
        },
      ],scrollable: true,
    },
    
    {
      label: <p style={{ color: "red" }}>Rejected</p>,
      items: [
        {
          
          template: (<div className="flex flex-row justify-content-center" style={{marginLeft:"1.2rem",alignContent:"center"}}>
          
          <p style={{margin: "0 0 0.75rem 0.5rem"}}>Keyword 3</p>
            <Button style={{height: "1.5rem",marginLeft:" 1rem"}}>Improve</Button><i className="pi pi-times" style={{marginTop:'0.25rem', marginLeft:"0.75rem"  }}></i></div>
            
          ),
        //   items: [
        //     {
        //       label: "Improve",
        //       icon: "pi pi-fw pi-pencil",
        //     },
        //     {
        //       separator: true
        //   },
        //     {
        //       label: "Delete",
        //       icon: "pi pi-fw pi-trash",
        //     },
        //   ],
          },
        
        { template: (<div className="flex flex-row justify-content-center" style={{marginLeft:"1.2rem",alignContent:"center"}}>
       
        <p style={{margin: "0 0 0.75rem 0.5rem"}}>Keyword 4</p>
          <Button style={{height: "1.5rem",marginLeft:" 1rem"}}>Improve</Button> <i className="pi pi-times" style={{marginTop:'0.25rem',marginLeft:"0.75rem"}}></i></div>
          ),
          // items: [
          //   {
          //     label: "Improve",
          //     icon: "pi pi-fw pi-pencil",
          //   },
          //   {
          //     separator: true
          // },
          //   {
          //     label: "Delete",
          //     icon: "pi pi-fw pi-trash",
          //   },
          // ],
        },
      ],
    },
  ];
  // const showMyCustomKeynotification = (event) => {
  //   setMenuVisibility(!isMenuVisible);
  //   notificationMenu.current.toggle(event);
  // };
  useEffect(() => {
    if (["/design", "/execute", "/reports"].includes(location.pathname)) {
      setShowExtraheaderItem(true);
    }
    else {
      setShowExtraheaderItem(false);
    }
  }, [location]);

  const toastError = (erroMessage) => {
    if (erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
  }

  const toastSuccess = (successMessage) => {
    if (successMessage.CONTENT) {
      toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
  }

  const toastWarn = (warnMessage) => {
    if (warnMessage.CONTENT) {
        toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
}

  const start = (
    <NavLink to={userInfo.rolename === "Admin" ? "/admin" : "/landing"} className="activeLanding">
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

      {/* Commented for future use of cutom keyword */}
      {/* <div> */}
        {/* <Button aria-controls="popup_menu_left" aria-haspopup
        icon="pi pi-bell p-overlay-badge"
        onClick={(event)=>{notificationMenu.current.toggle(event);}}
        style={{ margin: "2rem 2rem 2rem 2rem", fontSize: "1.4rem" }}
      >
        <Badge className="notify" severity={"danger"}></Badge>
      </Button> */}

        {/* <div className="card flex justify-content-center">
          <Menu style={{width:'16rem',maxHeight: keywordItems.find((section) => section.label.props.style.color === 'green')?.scrollable ? '200px' : 'none',
        overflowY: keywordItems.find((section) => section.label.props.style.color === 'green')?.scrollable ? 'auto' : 'hidden',}}
          className="keyword_menu"
            id="popup_menu_left"
            ref={notificationMenu}
            model={keywordItems}
            popup
          />
        </div>

        <i
          className="pi pi-bell p-overlay-badge"
          onClick={(event) => {
            notificationMenu.current.toggle(event);
          }}
          style={{ margin: "2rem 2rem 2rem 2rem", fontSize: "1.4rem" }}
        >
          <Badge className="notify" severity={"danger"}></Badge>
        </i>
      </div> */}

      <UserProfile
        toastError={toastError}
        toastSuccess={toastSuccess}
        toastWarn={toastWarn}
      />
    </div>
  );

  const tooltip_needhelp = {
    fontSize: "12px",fontfamily:"Open Sans",  fontWeight: "normal",marginleft:"2rem"
  };

  return (
    <div className='Topbar_Menu'>
      <Toast ref={toast} position="bottom-center" baseZIndex={1300} />
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