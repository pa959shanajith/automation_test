import React , {useState, useEffect} from'react';
import '../styles/CenterScr.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import {GetScrapeDataScreenLevel_ICE} from '../api';


var ScrapeCenter =()=>{
    const user = JSON.parse(localStorage.getItem('user'))
    const taskScrenName = user[1].taskName;
    const [task , setTask] = useState(false)
    const [custName , setCustName] = useState([])
    const [search , setSearch] = useState(true)
    useEffect(() => {
        (async () =>{
            var res = await GetScrapeDataScreenLevel_ICE()
            var custName =[] ;
            custName = res.view;
            setCustName(custName)
            setTask(true);
        })()
    }, [])
    return(
        <div id="middleContent">
            <div className="page-taskName" >
            <span className="taskname">
                {taskScrenName}
            </span>
                <button className="btn pull-right" id="submittaskbtn"title="submit task">
                    Submit 
                </button>
            <div className="fscrape">
                <div className="scraptree">
                    <span className="parentobjcontainer">
                        <input title="selectall" type="checkbox" className="checkstylebox"></input>
                        <span className="parentobject">
                            <span className="ascrapper">Select All</span>
                            <button className=" btn" id="savetaskbtn" style={{marginLeft:"10px"}} title="savetask">Save</button>
                            <button className="btn" id= "savetaskbtn" title="deletetask">Delete</button>
                            <button className="btn" id="savetaskbtn" title="edittask">Edit</button>
                            <span><i onClick={()=>setSearch(!search)}><img src="static/imgs/ic-search-icon.png" alt=" searchICon"/></i></span>
                            <span><input type="textbox" className={search?"special searchdcrapinput" :"searchdcrapinput"}></input></span> 
                        </span>
                    </span>
                    <br/>
                    {task? custName.map((e,i) => (
                    <span key={i}>{e.custname}</span>
                    )): null}
                </div>
            </div>
        </div>
    </div>
    )
}

export default ScrapeCenter;