import React, { Fragment, useState, useEffect , useRef } from 'react';
import {ModalContainer, ScrollBar, Messages as MSG, setMsg} from '../../global' 
import {FormInpDropDown, FormInput} from '../components/FormComp';
import AssignEmailBox from '../components/AssignEmailBox'
import {getUserDetails,getNotificationGroups,updateNotificationGroups} from '../api';
import '../styles/EditEmailGroup.scss';

/*Component EditEmailGroup
  use: defines Email Group Setup middle Section for Edit Email Group from create email group page
*/

const EditEmailGroup = (props) => {
    const displayError = props.displayError
    const setLoading = props. setLoading
    const setModal = props. setModal
    const allUsers = props.allUsers
    const setAllUsers = props.setAllUsers
    const setAssignUsers = props.setAssignUsers
    const assignUsers = props.assignUsers
    const setNewEmail = props.setNewEmail
    const newEmail = props.newEmail
    const setDeleteModal = props.setDeleteModal
    const groupName = useRef()
    const updateBtn = useRef()
    const deleteBtn = useRef()
    const filterRef = useRef()
    const [groupList,setGroupList] =  useState([])
    const [deletePop,setDeleteGroup] = useState(false)
    const [selectedGroup,setSelectedGroup] = useState(undefined)
    const prop = {newEmail,setNewEmail,filterRef,selectedGroup,setSelectedGroup,groupName,setAllUsers,assignUsers,setAssignUsers,setGroupList,setLoading,displayError}
    useEffect(()=>{
        (async()=>{
            setLoading('Loading ...')
            await resetData(prop)
            setLoading(false)
        })()
        // eslint-disable-next-line
    },[])
    //on click of dropdown
    const clickInp = () =>{
        var arr = [...allUsers,...assignUsers]
        arr.sort((a,b) => a.name.localeCompare(b.name));
        setAllUsers(arr)
        setAssignUsers([])
        setNewEmail([])
        setSelectedGroup(undefined)
        groupName.current.disabled = true
        groupName.current.value = ''
    }
    const clickDeleteGroup = () =>{
        if(!selectedGroup)return;
        deleteEmailGroup(prop)
    }
    const clickUpdateGroup = () =>{
        if(!selectedGroup)return;
        if(!groupName.current.value){
            groupName.current.style.outline = '1px solid red';
            return;
        }
        groupName.current.style.outline=""
        updateEmailGroup(prop) 
    }
    //on selection of group from dropdown
    const FflterGroup = async (e) => {
        groupName.current.style.outline=""
        var val = e.currentTarget.value
        var text = e.currentTarget.innerText
        groupName.current.disabled = false
        groupName.current.value = text
        setSelectedGroup({_id:val,name:text})
        var data = await getNotificationGroups({'groupids':[val],'groupnames':[]});
        if(data.error){
            if(data.val === 'empty'){
                displayError(data.error);
                data = {};
            }else{
                displayError(data.error);
                return true;
            }
        }
        var otherEmail = [];
        (data[0].otherusers).forEach((e,i)=>{
            otherEmail.push({_id:`email-${i}`,name:e}) 
        })
        setNewEmail(otherEmail)
        setAssignUsers(data[0].internal_user_info)
        const alreadyAssigned = {};
        (data[0].internal_user_info).forEach((e)=>{alreadyAssigned[e._id]=true})
        var allUser = [];
        allUsers.forEach((e)=>{
            if(alreadyAssigned[e._id]===undefined) allUser.push(e)
        })
        setAllUsers(allUser);
    }
    return(
        <Fragment>
            {deletePop?
                <ModalContainer
                modalClass = 'modal-sm'
                title='Delete Email Group'
                close={()=>setDeleteGroup(false)}
                footer={<DelFooter clickDeleteGroup={clickDeleteGroup} setDeleteGroup={setDeleteGroup}/>}
                content={<DelContainer selectedGroup={selectedGroup} />}
            />:null}
            <ScrollBar thumbColor="#929397">
                <div className="edit_email-group_container">
                    <div id="page-taskName">
                        <span>Edit Email Group Configuration</span>
                    </div>
                    <div className="adminActionBtn">
                        <button disabled={!selectedGroup?true:false} ref={deleteBtn} className="a__btn btn-edit" onClick={()=>setDeleteGroup(true)}  title="Edit">Delete</button>
                        <button disabled={!selectedGroup?true:false} ref={updateBtn} className="a__btn btn-edit" onClick={clickUpdateGroup}  title="Save">Update</button>
                    </div>
                    <div className='edit_email-group'>
                        <div className="col-xs-9 form-group assignBox-container">
                            <AssignEmailBox FilterComp={<FilterComp clickInp={clickInp} inpRef={filterRef} setFilter={FflterGroup} data={groupList}/>}
                             setNewBox={setNewEmail} setDeleteModal={setDeleteModal} setModal={setModal} newEmail={newEmail} setNewEmail={setNewEmail} leftBox={allUsers} rightBox={assignUsers} setLeftBox={setAllUsers} setRightBox={setAssignUsers}/>
                        </div>
                        <FormInput inpRef={groupName} label={'Group Name'} placeholder={'Enter Email Group Name'} validExp={"emailName"}/>
                    </div>
                </div>
            </ScrollBar>        
        </Fragment>
    )
}

//choose email group section from assignoptionbox
const FilterComp = ({setFilter,data,clickInp,inpRef}) =>{
    return(
        <span className='label-select'>
            <FormInpDropDown clickInp={clickInp} inpRef={inpRef} setFilter={setFilter} data={data} type={"emailSearch"}/>
        </span>
    )
}
const DelContainer = ({selectedGroup}) => (
    <p style={{whiteSpace:'break-spaces'}}>
        {`Are you sure you want to delete Email Group : ${selectedGroup.name} ?`}
    </p>
)
const DelFooter = ({setDeleteGroup,clickDeleteGroup}) =>{
    return(
        <div>
            <button style={{marginRight:'15px'}} onClick={()=>{setDeleteGroup(false);clickDeleteGroup();}}>Yes</button>
            <button onClick={()=>setDeleteGroup(false)}>No</button>
        </div>
    )
}

const updateEmailGroup = async(prop) =>{
    prop.groupName.current.style.outline='';
    prop.setLoading('Updating Email Group ...')
    let proceed = false
    var data = await getNotificationGroups({'groupids':[],'groupnames':[]});
    if(data.error){prop.displayError(data.error);return;}
    data.forEach((e)=>{
        if(e.groupname===prop.groupName.current.value){
            setMsg(MSG.ADMIN.ERR_GROUPNAME_EXIST);
            prop.groupName.current.style.outline='1px solid red';
            proceed = true
        } 
    })
    if(proceed){prop.setLoading(false); return}
    const internalUsers=[], otherUsers=[], groupdata = {};
    prop.assignUsers.forEach((item)=>{internalUsers.push(item._id)})
    prop.newEmail.forEach((item)=>{otherUsers.push(item.name)})
    groupdata[prop.selectedGroup._id]={"groupname":prop.groupName.current.value,"internalusers":internalUsers,"otherusers":otherUsers};
    var data = await updateNotificationGroups({'groupdata': groupdata,'action':  "update"})
    if(data.error){prop.displayError(data.error);return;}
    var err = await resetData(prop)
    if(!err)prop.displayError(MSG.ADMIN.SUCC_UPDATE_EMAILGROUP)
}

const deleteEmailGroup = async(prop) =>{
    prop.setLoading('Deleting Email Group ...')
    var groupdata = {};
    groupdata[prop.selectedGroup._id]={};
    var data = await updateNotificationGroups({'groupdata': groupdata,'action':"delete"})
    if(data.error){prop.displayError(data.error);return;}
    var err = await resetData(prop)
    if(!err)prop.displayError(MSG.ADMIN.SUCC_DELETE_EMAILGROUP)
}

const resetData = async({filterRef,setSelectedGroup,groupName,setAllUsers,setAssignUsers,setNewEmail,setGroupList,setLoading,displayError,action}) => {
    filterRef.current.value = ""
    groupName.current.disabled = true
    groupName.current.value = ""
    groupName.current.style.outline='';
    setLoading("Loading...");
    var data = await getNotificationGroups({'groupids':[],'groupnames':[]});
    if(data.error){
        if(data.val === 'empty'){
            displayError(data.error);
            data = {};
        }else{
            displayError(data.error);
            return true;
        }
    }
    setGroupList(data.sort())
    data = await getUserDetails("user");
    if(data.error){displayError(data.error);return;}
    var userOptions = [];
    for(var i=0; i<data.length; i++){
        if(data[i][3] !== "Admin") userOptions.push({_id:data[i][1],name:data[i][0]}); 
    }
    setAllUsers(userOptions.sort());   
    setLoading(false);
    setAssignUsers([])
    setNewEmail([])
    setSelectedGroup(undefined)
}


export default EditEmailGroup