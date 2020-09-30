import React,{useState} from 'react';
import {ReferenceBar } from '../../global';
import '../styles/RightBarItems.scss'
function Rightbar() {
    const[filterPop , setFilterPop] = useState(false)
    const[filterpopY , setFilterpopY] = useState(null)

    const closeAllPopups = () => {
        setFilterPop(false);
    }

    const popups = () => {

        return filterPop &&
        <div className="task_pop" style={{marginTop: `calc(${filterpopY}px-20vh)`}}>
            <span className="pop__header">Filters</span>
            <div><button>Checkbox</button></div>
            <div><button>Dropdown</button></div>
            <div><button>Button</button></div>
            <div><button>Image</button></div>
            <div><button>Link</button></div>
            <div><button>Radio Button</button></div>
            <div><button>Textbox</button></div>
            <div><button>Listbox</button></div>
            <div><button>Table</button></div>
            <div><button>IRIS</button></div>
            <div><button>Other</button></div>
            <div><button>UserCreted</button></div>
            <div><button>Dublicate CustNames</button></div>
        </div>
    }

    const toggleFilterPop =(event)=>{
        console.log("filter was clicked")
        setFilterpopY(event.clientY)
        setFilterPop(!filterPop)
    }
    return (
    
        <ReferenceBar popups={popups()} >
         {/* {
            filterPop?
            <div className="task_pop" style={{marginTop: `calc(${filterpopY}px)`}}>
                <span className="pop__header">Filters</span>
                <div><button>Checkbox</button></div>
                <div><button>Dropdown</button></div>
                <div><button>Button</button></div>
                <div><button>Image</button></div>
                <div><button>Link</button></div>
                <div><button>Radio Button</button></div>
                <div><button>Textbox</button></div>
                <div><button>Listbox</button></div>
                <div><button>Table</button></div>
                <div><button>IRIS</button></div>
                <div><button>Other</button></div>
                <div><button>UserCreted</button></div>
                <div><button>Dublicate CustNames</button></div>
            </div> :
            null
        }   */}
            <span className="ic_box "><span><img className="rb__ic-info thumb__ic" src="static/imgs/ic-screenshot.png" alt="screenshot"/></span><span className="rb_box_title">Screenshot</span></span>
            <span onClick={toggleFilterPop} className="ic_box "  ><span><img className={"rb__ic-info thumb__ic " + (filterPop && "active_rb_thumb")} src="static/imgs/ic-filter.png" alt="fliter"/></span><span className="rb_box_title">Filter</span></span>
        </ReferenceBar>
        
    
    )
}

export default Rightbar
