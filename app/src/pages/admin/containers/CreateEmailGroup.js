import React, { Fragment, useState, useEffect , useRef } from 'react';
import {ScreenOverlay, ScrollBar, setMsg, Messages as MSG, ModalContainer} from '../../global' 
import {FormInput,FormInpDropDown} from '../components/FormComp';
import AssignEmailBox from '../components/AssignEmailBox'
import {getUserDetails, updateNotificationGroups, getNotificationGroups} from '../api';
import EditEmailGroup from './EditEmailGroup';
import '../styles/CreateEmailGroup.scss'


/*Component CreateEmailGroup
  use: defines email group setup middle Section for create email groups
*/

const CreateEmailGroup = (props) => {
    const groupName = useRef()
    const emailRef = useRef()
    const [edit,setEdit] = useState(false)
    const [newEmail,setNewEmail] = useState([])
    const [allUsers,setAllUsers] = useState([])
    const [assignUsers,setAssignUsers] = useState([])
    const [loading,setLoading] = useState(false)
    const [modal,setModal] = useState(false)
    const [deleteModal,setDeleteModal] = useState(false)
    const [errBorder,setErrBorder] = useState(false);
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    useEffect(()=>{
        setEdit(false)
        resetData({displayError,setAllUsers,setLoading,groupName,setAssignUsers,setNewEmail})
    },[props.resetMiddleScreen])
    
    //on selection of user from dropdown
    const selectUser = (e) => {
        var val = e.currentTarget.value
        var text = e.currentTarget.innerText
        var leftBox = [...allUsers];
        var rightBox = [...assignUsers];
        leftBox.forEach((item,i)=>{
            if(item._id===val && item.name===text){
                leftBox.splice(i,1);
                rightBox.push(item);
                setAllUsers(leftBox);
                setAssignUsers(rightBox);
            }
        })
    }
    const addNewEmail = (e,closePopup) => {
        const newEmails = [...newEmail];
        let email = "";
        if(closePopup) email = emailRef.current.value 
        else email = e.currentTarget.innerText===""?emailRef.current.value:e.currentTarget.innerText;
        const emailRegex = /\S+@\S+\.\S+/;
        if(newEmails.some((item)=>{return (item.name).toUpperCase()===email.toUpperCase()})) {
            setMsg(MSG.ADMIN.WARN_EMAIL_EXIST)   
            return true
        }
        if(emailRegex.test(email)){
            newEmails.push({_id:`email-${newEmails.length}`,name:email}) 
            setNewEmail(newEmails);
            if(closePopup) setModal(false)
            return false;
        }
        else {
            if(closePopup) setErrBorder(true)
            return true;
        }
    }

    const createGroup = async (action) => {
        let proceed = false
        groupName.current.style.outline='';
        if(groupName.current.value===""){ groupName.current.style.outline='1px solid red'; return;}
        setLoading("Loading...");
        var data = await getNotificationGroups({'groupids':[],'groupnames':[]});
        if(data.error){displayError(data.error);return;}
        data.forEach((e)=>{
            if(e.groupname===groupName.current.value){
                setMsg(MSG.ADMIN.ERR_GROUPNAME_EXIST);
                proceed = true
            } 
        })
        if(proceed){setLoading(false); return}
        const internalUsers=[], otherUsers=[];
        assignUsers.forEach((item)=>{internalUsers.push(item._id)})
        newEmail.forEach((item)=>{otherUsers.push(item.name)})
        let payload = {'groupdata': {"groupid1":{"groupname":groupName.current.value,"internalusers":internalUsers,"otherusers":otherUsers}},
                'action':  action}
        data = await updateNotificationGroups(payload);
        if(data.error){displayError(data.error);return;}
        if(data==="success") {
            resetData({displayError,setAllUsers,setLoading,groupName,setAssignUsers,setNewEmail})
            setMsg(MSG.ADMIN.SUCC_GROUP_CREATE)
        } 
        setLoading(false);
    }

    const DelModal = () => {
        let emails = '';
        newEmail.forEach((item)=>{emails=emails+" "+item.name})
        const deleteEmails = () => {
            setNewEmail([]);
        }
        return(
            <ModalContainer 
                modalClass='modal-sm'
                title={"Delete Email"}
                content={"Delete following email ID(s) from the group:"+ emails}
                close={()=>setDeleteModal(false)}
                footer={
                    <>
                        <button onClick={()=>{deleteEmails();setDeleteModal(false);}}>Yes</button>
                        <button onClick={()=>setDeleteModal(false)}>No</button>        
                    </>}
            />  
        )
    }

    return(
        <ScrollBar thumbColor="#929397">
        <div className="crt_email-group_container">
        {loading?<ScreenOverlay content={loading}/>:null}
        {modal && <ModalContainer 
            modalClass = 'modal-sm'
            title={"ADD EMAIL"}
            content={<div className="email-group_forminp">
                        <FormInpDropDown errBorder={errBorder} setErrBorder={setErrBorder} setNewOption={addNewEmail} inpRef={emailRef} setFilter={selectUser} data={allUsers} type={"Email"}/>
                    </div>}
            close={()=>setModal(false)}
            footer={<button onClick={()=>addNewEmail(undefined,true)}>Ok</button>}
        />}
        {deleteModal && DelModal()}
        {edit?
            <EditEmailGroup 
                setModal={setModal} 
                setDeleteModal={setDeleteModal}
                displayError={displayError} 
                setLoading={setLoading}
                allUsers={allUsers}
                setAllUsers={setAllUsers}
                assignUsers={assignUsers}
                setAssignUsers={setAssignUsers}
                newEmail={newEmail}
                setNewEmail={setNewEmail}
            />:
            <Fragment>
                <div id="page-taskName">
                    <span>Create Email Group Configuration</span>
                </div>
                <div className="adminActionBtn">
                    <button className=" a__btn btn-edit" onClick={()=>setEdit(true)}  title="Edit">Edit</button>
                    <button className=" a__btn " onClick={()=>{createGroup("create")}} title="Create">Create</button>
                </div>
                <div className='crt_email-group'>
                    <FormInput inpRef={groupName} label={'Group Name'} placeholder={'Enter Email Group Name'} validExp={"emailName"}/>
                    <div className="col-xs-9 form-group assignBox-container">
                        <AssignEmailBox setNewBox={setNewEmail} setDeleteModal={setDeleteModal} setModal={setModal} newEmail={newEmail} setNewEmail={setNewEmail} leftBox={allUsers} rightBox={assignUsers} setLeftBox={setAllUsers} setRightBox={setAssignUsers}/>
                    </div>
                </div>
            </Fragment>
        }
        </div>
        </ScrollBar>
    )
}

const resetData = async({displayError,setAllUsers,setLoading,groupName,setAssignUsers,setNewEmail}) => {
    setLoading("Loading...");
    const data = await getUserDetails("user");
    if(data.error){displayError(data.error);return;}
    var userOptions = [];
    for(var i=0; i<data.length; i++){
        if(data[i][3] !== "Admin") userOptions.push({_id:data[i][1],name:data[i][0]}); 
    }
    setAllUsers(userOptions.sort()); 
    groupName.current.style.outline='';
    if(groupName.current)groupName.current.value = ""
    setNewEmail([])
    setAssignUsers([])
    setLoading(false)
}

export default CreateEmailGroup;