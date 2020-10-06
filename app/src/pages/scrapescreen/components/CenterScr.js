import React , {useState, useEffect , useRef} from'react';
import {useSelector, useDispatch} from "react-redux"
import {PopupMsg ,ScrollBar , ModalContainer} from '../../global';
import ClickAwayListener from 'react-click-away-listener';
import '../styles/CenterScr.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import {GetScrapeDataScreenLevel_ICE , updateScreen_ICE} from '../api';
import ModalContent from './ModalContent';
import ScrapeObject from './ScrapeObject.js'
import * as actionTypes from '../state/action';



var ScrapeCenter =(props)=>{

    
    const _CT = props._CT;
    const userinfo = useSelector(state=> state.login.userinfo);
    const scrapeData = useSelector(state=> state.scrape.ScrapeData);
    const taskScrenName = _CT.taskName;
    var screenId = _CT.screenId;
    var projectId = _CT.projectId;
    var testCaseId = _CT.testCaseId;
    var type = _CT.appType;
    const [os , setOs]= useState(undefined)
    const [custName , setCustName] = useState([])
    const [scrapeList , setScrapeList] = useState([])
    const [search , setSearch] = useState(false)
    const [eye , setEye] = useState(false);
    const [userInfo , setUserInfo] = useState([])
    const [element, setElement]=useState([])
    const [elementedit , setElementedit] = useState(false)
    const [filtered, setFiltered] = useState([]);
    const [searchVal, setSearchVal] = useState(null);
    const [dubliobjlist , setDubliobjlist]= useState([ ]);
    const [dubli , setDubli] = useState(true);
    useEffect(()=>{
        if(Object.keys(userinfo).length!==0){
            setUserInfo(userinfo)
        }
    },[userinfo])    
    useEffect(() => {
            if (scrapeData.length !== 0){
            setScrapeList(scrapeData.view)
            const onetime =[...scrapeData.view.map((e)=>(e.custname))]
            setCustName(onetime)
            setElement(onetime)}
        }
    , [scrapeData])

    useEffect(()=>{
        if (props.scpitm.view){
            var arr = [...custName]
            var scrparr =[...scrapeList]
            scrparr.push(...props.scpitm.view.map((e)=>(e)));
            arr.push(...props.scpitm.view.map((e)=>(e.custname)));
            setElement(arr);
            setCustName(arr);
            setScrapeList(scrparr);
        }
    }, [props.scpitm]); 
    
    const onSearch=(e)=>{
        var val = e.target.value;
        var filter = []
        filter = [...element].filter((e)=>e.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setFiltered(filter)
        setSearchVal(val);
    }
    const callSavebtn = () => {
        let findDuplicates = element.filter((item, index) => element.indexOf(item) != index)
        if(findDuplicates.length !==0){
            setDubliobjlist(findDuplicates)
            setDubli(true)
        }
    }
    const callDelbtn =()=>{
        return console.log("delete was clicked");
    }

    const saveName = (i, cName, event)=>{
        if(event.key === 'Enter'){
            let arr = [...element]
            arr.splice(i, 1, cName)
            setElement(arr);
            
        }
    }
    const onClose = () =>{
        props.setMweb(false);
        setOs(undefined)
      }

    const List =    ({items}) => {
        return(
        <>
        
        {items.map((e,i) => (
            <ScrapeObject key={i} item={e} idx={i} setElementedit={setElementedit} elementedit={elementedit} eye={eye} setEye={setEye} saveName={saveName}/>
        ))}
        
        </>
    )}
    
    return(
        <div id="middleContent">
            {props.mweb  ? 
            <ModalContainer title='Launch Application' 
            content= {<ModalContent os={os} setOs={setOs}/>}
            close={onClose}
            footer ={(os)? <button>Launch</button> : null}
            />: null}
            {props.spdf  ? <ModalContainer title='Scrape Screen' content="No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server." close={()=>props.setSpdf(false)} footer ={<button>OK</button>}/>: null}
            <div className="page-taskName" >
            <span className="taskname">
                {taskScrenName}
            </span>
            </div>   
            <div className="fscrape">
            <ScrollBar thumbColor = 'rgba(255, 255, 255, 0.27)' trackColor = 'none'>
                <div className="scraptree">
                    <button className="btn pull-right" id="submittaskbtn"title="submit task">
                        Submit 
                    </button>
                    <ClickAwayListener onClickAway={()=>setSearch(false)}><span className="parentobjcontainer">
                        
                        <input title="selectall" type="checkbox" className="checkstylebox"></input>
                        <span className="parentobject">
                            <span className="ascrapper">Select All</span>
                            <button onClick={callSavebtn}className=" btn" id="savetaskbtn" style={{marginLeft:"10px"}} title="savetask">Save</button>
                            <button onClick={callDelbtn} className="btn" id= "savetaskbtn" title="deletetask">Delete</button>
                            <button className="btn" id="savetaskbtn" title="edittask">Edit</button>
                            <span  ><i  className="searchscrapel"   onClick={()=>setSearch(!search)}><img src="static/imgs/ic-search-icon.png" alt=" searchICon"/></i></span>
                            {search ?<span><input onChange={(e)=>onSearch(e)}type="textbox" className="searchdcrapinput"></input></span> : null}
                        </span>
                    </span></ClickAwayListener>
                    {   
                            <List items={ searchVal? filtered : element}  />
                    }
                    {
                        ((dubliobjlist.length!==0) && dubli)? 
                            <PopupMsg 
                                title="Save Scrape Data" 
                                content={<span><span><b>Please rename/delete duplicate scraped objects</b></span><br/><br/><span><b>Object characterstics are same for:</b>{dubliobjlist.map((e)=><div>{e}</div>)}</span></span>}
                                close={()=>setDubli(false)} submit={()=>setDubli(false)} submitText ="Ok"
                            /> : null 
                    }
                </div>
                </ScrollBar>
            </div>
        
    </div>
    )
}

export default ScrapeCenter;