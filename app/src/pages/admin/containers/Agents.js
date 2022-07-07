import React, { useState, useEffect } from 'react';
import {Messages as MSG, VARIANT, setMsg, ModalContainer, ScrollBar} from '../../global';
import { SearchBox } from '@avo/designcomponents';
import '../styles/Agents.scss'
import ReactTooltip from 'react-tooltip';

/* Component Agents */

const Agents = (props) => {
    const [searchText, setSearchText] = useState("");
    const [gridList, setGridList] = useState([
        {
            name: 'Name 1ansadnsa,mdnas,mdnasm,dnsad   dasd as ',
            list: '',
            clientCount: '1'
        },{
            name: 'Name 2',
            list: '',
            clientCount: '2'
        },{
            name: 'Name 3',
            list: '',
            clientCount: '10'
        }
    ]);
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [filteredList, setFilteredList] = useState(gridList);
    const handleSearchChange = (value) => {
        let filteredItems = gridList.filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
        setFilteredList(filteredItems);
        setSearchText(value);
    }
    const deleteGridConfig = () => {
        setShowConfirmPop({'title': 'Delete Avo Grid Configuration', 'content': <p>Are you sure, you want to delete <b>Name 1</b> Configuration?</p>, 'onClick': ()=>{ setShowConfirmPop(false); showMessageBar('Name 1 Configuration Deleted', 'SUCCESS'); }});
    }
    const ConfirmPopup = () => (
        <ModalContainer 
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={()=>setShowConfirmPop(false)}
            footer={
                <>
                <button onClick={showConfirmPop.onClick}>Yes</button>
                <button onClick={()=>setShowConfirmPop(false)}>No</button>
                </>
            }
        />
    )
    const showMessageBar = (message, selectedVariant) => (
        setMsg(MSG.CUSTOM(message,VARIANT[selectedVariant]))
    )
    return (<>
        { showConfirmPop && <ConfirmPopup /> }
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                Avo Grid Configuration
            </span>
        </div>
        <div className="api-ut__btnGroup">
            <button data-test="submit-button-test" onClick={() => console.log({
                    name: '',
                    list: '',
                    clientCount: ''
                })} >New Grid</button>
            { gridList.length > 0 && <>
                <div className='searchBoxInput'>
                    <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                </div>
                <div>
                    <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>'''' Please Download Avo Agent '''' </span>
                </div>
            </> }
        </div>
        { gridList.length > 0 ? <>
            { /* Table */ }
            <div className="d__table" style={{ flex: 0 }}>
                <div className="d__table_header">
                    <span className=" d__step_head tkn-table__sr_no tkn-table__head" >#</span>
                    <span className="d__obj_head tkn-table__name tkn-table__head" >Name</span>
                    <span className="d__inp_head tkn-table__project tkn-table__head" >Server List</span>
                    <span className="d__out_head tkn-table__project tkn-table__head" >Avo CLient Count</span>
                    <span className="details_col d__det_head tkn-table__button" >Action</span>
                </div>
            </div>
            <div id="activeUsersToken" className="wrap active-users-token">
                <ScrollBar scrollId='activeUsersToken' thumbColor="#929397" >
                <table className = "table table-hover sessionTable" id="gridList">
                    <tbody>
                        {
                            searchText.length > 0 && filteredList.length > 0 && filteredList.map((item, index) => <tr key={item.key} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__name" data-for="name" data-tip={item.name}> <ReactTooltip id="name" effect="solid" backgroundColor="black" /><React.Fragment>{item.name}</React.Fragment> </td>
                                <td className="tkn-table__project" data-for="list" data-tip={item.list}> <ReactTooltip id="list" effect="solid" backgroundColor="black" /> {item.list} </td>
                                <td className="tkn-table__project" data-for="clientCount" data-tip={item.clientCount}> <ReactTooltip id="clientCount" effect="solid" backgroundColor="black" /> {item.clientCount} </td>
                                <td className="tkn-table__button"> <img style={{ marginRight: '10%' }} onClick={() => console.log(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> &nbsp; <img onClick={() => deleteGridConfig()} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/></td>
                            </tr>)
                        }
                        {
                            searchText.length == 0 && gridList.length > 0 && gridList.map((item, index) => <tr key={item.key} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__name" data-for="name" data-tip={item.name}> <ReactTooltip id="name" effect="solid" backgroundColor="black" />{item.name} </td>
                                <td className="tkn-table__project" data-for="list" data-tip={item.list}> <ReactTooltip id="list" effect="solid" backgroundColor="black" /> {item.list} </td>
                                <td className="tkn-table__project" data-for="clientCount" data-tip={item.clientCount}> <ReactTooltip id="clientCount" effect="solid" backgroundColor="black" /> {item.clientCount} </td>
                                <td className="tkn-table__button"> <img style={{ marginRight: '10%' }} onClick={() => console.log(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> &nbsp; <img onClick={() => deleteGridConfig()} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/></td>
                            </tr>)
                        }
                    </tbody>
                </table>
                </ScrollBar>
            </div>
        </> : <div className="no_config_img"> <img src="static/imgs/empty-config-list.svg" alt="Empty List Image"/> </div> }
    </>);
}

export default Agents;