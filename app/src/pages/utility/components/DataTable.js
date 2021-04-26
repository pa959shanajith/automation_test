import React, { useState, useEffect, useRef }  from 'react';
import { v4 as uuid } from 'uuid';
// import { tableData } from './dummydata';
import ClickAwayListener from 'react-click-away-listener';
import { PopupMsg, ScrollBar } from '../../global';
import Table from './Table';
import "../styles/DataTable.scss";

const DataTable = props => {

    const [currScreen, setCurrScreen] = useState("Create");
    const [data, setData] = useState([{id: uuid()}]);

    const [headers, setHeaders] = useState([{id: uuid(), name: 'Header 1'}, {id: uuid(), name: 'Header 2'}]);
    const [checkList, setCheckList] = useState({type: 'row', list: []});
    const [dnd, setDnd] = useState(false);
    const [headerCounter, setHeaderCounter] = useState(3);
    const [showPop, setShowPop] = useState(false);

    useEffect(()=>{
        // GET DATA FROM API
        // let newData = JSON.parse(JSON.stringify([...tableData]));
        // newData.forEach((row, index) => {
        //     row['id'] = uuid();
        // })
        // setData(newData);
        // // SETTING UP COLUMN HEADERS
        // let colHeaders = Object.keys(tableData[0]);
        // let newHeaders = [];
        // for(let i=0; i<colHeaders.length; i++) {
        //     newHeaders.push({
        //         id: uuid(),
        //         name: colHeaders[i],
        //     })
        // }
        // setHeaders(newHeaders);
    }, [])


    const displayData = () => {
        console.log("Headers:", headers)
        console.log("Data:", data);
    }

    const onAdd = type => {
        if (type==="col") {
            let newHeaders = [...headers];
            
            newHeaders.push({
                id: uuid(),
                name: `Header ${headerCounter}`
            })

            setHeaders(newHeaders);
            setHeaderCounter(count => count + 1);
        }
        else if (checkList.list.length===1){
            if (checkList.type==="row"){
                let newData = [...data];
                let locToAdd = checkList.list[0].split('||').pop();
                newData.splice(locToAdd+1, 0, {id: uuid()});
                setData(newData);
            }
            else{
                let newHeaders = [...headers];
                let locToAdd = null;
                let headerId = checkList.list[0].split('||').pop();
                
                headers.forEach((header, headerIndex)=>{
                    if (header.id === headerId) locToAdd = headerIndex;
                })
                
                newHeaders.splice(locToAdd+1, 0, {
                    id: uuid(),
                    name: `Header ${headerCounter}`
                })

                setHeaders(newHeaders);
                setHeaderCounter(count => count + 1);
            }
        }
    }

    const onDelete = () => {
        // HANDLE CHECKLIST
        if (checkList.list.length){
            if (checkList.type==="row"){
                let newData = [...data];
                
                for (let listItem of checkList.list){
                    let rowIndex = listItem.split('||').pop();
                    
                    for (let i=0; i<newData.length; i++){
                        if (rowIndex === newData[i].id) {
                            newData.splice(i, 1);
                            break;
                        }
                    }
                }

                setData(newData);
            }
            else{
                let newHeaders = [...headers];
                let newData = [...data];

                for (let listItem of checkList.list){
                    let headerId = listItem.split('||').pop();
                    
                    for (let i=0; i<newHeaders.length; i++){
                        if (newHeaders[i].id === headerId){
                            newData.forEach(row => {
                                delete row[newHeaders[i].name]
                            })
                            newHeaders.splice(i, 1);
                        }
                    }
                }

                setHeaders(newHeaders);
                setData(newData);
            }
        }
    }

    const goToEditScreen = () => {
        setCurrScreen('Edit');
        setData([]);
        setCheckList({type: 'row', list: []});
    }

    const Popup = () => (
        <PopupMsg 
            title={showPop.title}
            content={showPop.content}
            close={()=>setShowPop(false)}
            submitText="OK"
            submit={()=>setShowPop(false)}
        />
    )

    return <>
        { showPop && <Popup /> }
        <div className="page-taskName" >
            <span className="taskname" data-test="dt__pageTitle">
                {currScreen} Data Table
            </span>
        </div>

        <div className="dt__btngroup">
            <TableActionButtons 
                onAdd={onAdd} 
                setDnd={setDnd} 
                onDelete={onDelete} 
            />
            { currScreen === "Create" 
                ? <CreateScreenActionButtons goToEditScreen={goToEditScreen} displayData={displayData} />
                : <EditScreenActionButtons />
            }
        </div>

        { currScreen==="Edit" &&<SearchDataTable /> }

        <div className="dt__table_container full__dt">
            {data.length>0 && 
            <Table 
                data={data}
                setData={setData}
                headers={headers}
                setHeaders={setHeaders}
                checkList={checkList}
                setCheckList={setCheckList}
                onAdd={onAdd}
                dnd={dnd} 
            />}
        </div>
    </>;
}

const TableActionButtons = ({ onAdd, setDnd, onDelete }) => {

    const tableActionBtnGroup = [
        {'title': 'Add Row', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add Row', onClick: ()=>onAdd()},
        {'title': 'Drag & Drop Row', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Row', onClick:  ()=>setDnd(dnd => !dnd)},
        {'title': 'Remove Row', 'img': 'static/imgs/ic-delete.png', 'alt': 'Remove Row', onClick:  ()=>onDelete()}
    ]

    return (
        <div className="dt__table_ac_btn_grp">
            {
                tableActionBtnGroup.map((btn, i) => 
                    <button data-test="dt__tblActionBtns" key={i} className="dt__tblBtn" onClick={()=>btn.onClick()}><img className="dt__tblBtn_ic" src={btn.img} alt={btn.alt} title={btn.title}/> </button>
                )
            }
        </div>
    );
}

const CreateScreenActionButtons = props => {
    return (
        <div className="dt__taskBtns">
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={props.goToEditScreen}>Edit</button>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={props.displayData}>Create</button>
        </div>
    );
}

const EditScreenActionButtons = props => {
    return (
        <div className="dt__taskBtns">
            <button className="dt__taskBtn dt__btn">Delete</button>
            <button className="dt__taskBtn dt__btn">Update</button>
        </div>
    );
}

const SearchDataTable = props => {
    const searchRef = useRef('');
    const [list, setList] =  useState([])
    const [dropdown,setDropdown] = useState(false)

    const inputFilter = () =>{

    }
    const resetField = () => {
        searchRef.current.value = "";
        setList([]);
        setDropdown(true)
    }

    return(
        <>
        {/* <div>Enter Table Name:</div> */}
        <ClickAwayListener onClickAway={()=>setDropdown(false)}>
        <div className="dt__searchDataTable">
            <input ref={searchRef} type='text' autoComplete="off" className="btn-users edit-user-dropdown-edit" onChange={inputFilter} onClick={resetField} placeholder="Search Data Table..."/>
            <div className="form-inp-dropdown" role="menu" style={{display: (dropdown?"block":"none")}}>
                <ScrollBar thumbColor="#929397" >
                {list.map((e, i) => (  
                    <option key={i}value={e}> {e}</option> 
                ))}
                </ScrollBar>
            </div>
        </div>
        </ClickAwayListener>
        </>
    )
}

export default DataTable;