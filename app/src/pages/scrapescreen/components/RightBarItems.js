import React,{useState} from 'react';
import { useSelector } from 'react-redux';
import {ReferenceBar } from '../../global';
import '../styles/RightBarItems.scss'
import ClickAwayListener from 'react-click-away-listener';

const Rightbar=(props)=> {
    const[filterPop , setFilterPop] = useState(false);
    const[filterpopY , setFilterpopY] = useState(null);
    const scrapeData = useSelector(state=> state.scrape.ScrapeData);
    const Fliteroptions =[
        {"title":"Checkbox", "dataTag":"checkbox"},
        {"title":"button", "dataTag":"button"},
        {"title":"Dropdown", "dataTag":"select"},
        {"title":"image", "dataTag":"image"},
        {"title":"link", "dataTag":"a"},
        {"title":"Radio Button", "dataTag":"radiobutton"},
        {"title":"Text Box", "dataTag":"input"},
        {"title":"List Box", "dataTag":"list"},
        {"title":"Table", "dataTag":"table"},
        {"title":"IRIS", "dataTag":"relative"},
        {"title":"other", "dataTag":"others"},
        {"title":"User Created", "dataTag":"userobj"},
        {"title":"Dublicate Cust Names", "dataTag":"dublicatecustnames"}
    ]

    const closeAllPopups = () => {
        setFilterPop(false);
    }

    const toggleFilterPop =(event)=>{
        setFilterpopY(event.clientY)
        setFilterPop(!filterPop)
    }
    const filterMain=(dataTag)=>{
        const val=dataTag
        const dataTagList=[...scrapeData.view.map((e)=>(e.tag))]
        const filteredList=[...dataTagList].filter((e)=>e.toUpperCase().indexOf(val.toUpperCase())!==-1)
        console.log(dataTagList)
        console.log(filteredList)
    }
    const popups = () => {

        return filterPop &&
        <ClickAwayListener onClickAway={closeAllPopups}>
        <div className="filter_pop" style={{marginTop: `calc(${filterpopY}px - 15vh)`}}>
            <h4 className="pop_header" onClick={()=>setFilterPop(false)}><span className="pop_title">Filters</span><img className="task_close_arrow" alt="close_task" src="static/imgs/ic-arrow.png"/></h4>
            <div className="popupContent popupContent-filter">
                <div id="selectAllFilters"><input type="checkbox"/><span id="selecttext">Select All</span></div>
                {Fliteroptions.map((e,i)=>(<div key={i}><span onClick={()=>filterMain(e.dataTag)}>{e.title}</span></div>))}
            </div>
        </div>
        </ClickAwayListener>
    }

    
    return (
    
        <ReferenceBar popups={popups()} closeAllPopups={()=>closeAllPopups()} >

            <span className="ic_box "><span><img className="rb__ic-info thumb__ic" src="static/imgs/ic-screenshot.png" alt="screenshot"/></span><span className="rb_box_title">Screenshot</span></span>
            <span onClick={toggleFilterPop} className="ic_box "  ><span><img className={"rb__ic-info thumb__ic " + (filterPop && "active_rb_thumb")} src="static/imgs/ic-filter.png" alt="fliter"/></span><span className="rb_box_title">Filter</span></span>
        </ReferenceBar>
        
    
    )
}

export default Rightbar
