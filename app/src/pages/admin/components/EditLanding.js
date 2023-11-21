import React ,  { Fragment , useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import * as actionTypes from '../state/action';
import '../styles/EditLanding.scss';
import useOnClickOutside from './UseOnClickOutside'
import { ModalContainer} from '../../global' 
import {AdminActions} from '../adminSlice';

/*Component EditLanding
  use: renders edit New User Landing page
  todo: 
*/
    
const EditLanding = (props) => {
    const dispatch = useDispatch()
    const [showDeleteModal,setshowDeleteModal] = useState(false)
    const node = useRef();
    const type = useSelector(state => state.admin.type);
    const fType = useSelector(state => state.admin.fType);
    const firstname = useSelector(state => state.admin.firstname);
    const lastname = useSelector(state => state.admin.lastname);
    const server = useSelector(state => state.admin.server);
    const ldap = useSelector(state => state.admin.ldap);
    const userIdName = useSelector(state => state.admin.userIdName);
    const confExpired = useSelector(state => state.admin.confExpired);
    const allUsersList = useSelector(state => state.admin.allUsersList);
    const confServerList = useSelector(state => state.admin.confServerList)
    const allUserFilter = useSelector(state => state.admin.allUserFilter)

    useOnClickOutside(node, () => props.setShowDropdownEdit(!props.showDropdownEdit));

    return (
        <Fragment>
            <div className="adminActionBtn">
                <button data-test="updateButton" className=" a__btn pull-right Create-User__btn_edit" onClick={()=>props.manage({action:'update'})} disabled={userIdName===''} title="Update User">Update</button>
                <button data-test="deleteButton" className=" a__btn pull-right Create-User__btn_edit" onClick={()=>{setshowDeleteModal(true)}} disabled={userIdName===''} style={{marginRight:"10px"}} title="Delete Configuration">Delete</button>           
            </div>

            <div className="col-xs-9 " style={{paddingTop:"5%"}}>
                <div className='userForm-edit adminControl-edit'>
                    <button title={fType} className="userTypeBtn_conv-edit " style={{margin:"4px 0",right:"0",cursor:"default"}}>{fType}</button>
                    <input data-test="userListInputEdit" list="allUsersListauto" className=" btn-users edit-user-dropdown-edit" onClick = {()=>{props.click();props.setShowDropdownEdit(!props.showDropdownEdit);props.setAllUserFilList(allUsersList);}} type="text"  id="userIdName"  onChange={(event)=>{dispatch(AdminActions.UPDATE_ALL_USER_FILTER(event.target.value));props.searchFunctionUser(event.target.value);}} value={allUserFilter}  placeholder="Search User.." autoComplete="none"/>
                    {(props.showDropdownEdit && allUsersList!==[])?
                        <div ref={node} className=" dropdown-menu-edit dropdown-menu-users-edit create-user__dropdown c__usersList" role="menu" style={{}}>
                            {props.allUserFilList.map((uid,index) => (  
                                <option key={index} role="presentation" onClick = {()=>{props.setShowDropdownEdit(!props.showDropdownEdit);dispatch(AdminActions.UPDATE_USERIDNAME(uid[1]+';'+uid[0]));dispatch(AdminActions.UPDATE_ALL_USER_FILTER(uid[0]));props.getUserData({user_idName:uid[1]+';'+uid[0]});}} value={uid[1] +";"+uid[0]} className="user-select__option"> {uid[0]}</option> 
                            ))}
                        </div>
                        :null
                    }
                </div>

                {(type !== "inhouse"  && userIdName!=='')?
                    <div className="adminControl-edit" >
                        <select onChange={(event)=>{props.clearForm();dispatch(AdminActions.UPDATE_SERVER(event.target.value));}} className={props.confServerAddClass?'adminSelect-edit  form-control__conv-edit selectErrorBorder':'adminSelect-edit  form-control__conv-edit'} id="confServer" style={{marginLeft:"0",width:"100%"}}>
                            {confServerList.map((srv,index) => (      
                                <option key={index} value={srv.name} selected={srv.name===server} disabled={confExpired===srv.name}>{srv.name}</option>
                            ))}
                        </select>
                    </div>
                    : null
                }

                {( userIdName!=='' && type === "ldap")?
                    
                    <div className="userForm-edit" style={{display:"inline-flex"}}>
                        <input type="text" autoComplete="off" id="ldapDirectory" name="ldapDirectory" value={ldap.user} onChange={(event)=>{dispatch(AdminActions.UPDATE_LDAP_USER(event.target.value))}}  className={props.ldapDirectoryAddClass?((props.ldapDirectoryAddClass==="selectErrorBorder")?"middle__input__border-edit form-control__conv-edit form-control-custom-edit create selectErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit create inputErrorBorder"):"middle__input__border-edit form-control__conv-edit form-control-custom-edit create"}  placeholder="User Domain Name"/>
                        <button title="Fetch" disabled={server === ''} onClick={()=>{props.ldapGetUser();}} className=" a__btn pull-right  Create-User__btn_edit btn-disabled" >Fetch</button>
                    </div>
                    :null
                }
                <div className='leftControl-edit adminControl-edit'>
                    <input data-test="firstName-input__edit" type="text" autoComplete="First-name" name="firstname" id="firstname" value={firstname} onChange={(event)=>{dispatch(AdminActions.UPDATE_INPUT_FIRSTNAME(event.target.value))}} maxLength="100" className={props.firstnameAddClass?"middle__input__border-edit form-control__conv-edit form-control-custom-edit  inputErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit "} placeholder="First Name"/>
                </div>
                <div className='rightControl-edit adminControl-edit'>
                    <input data-test="lastName-input__edit" type="text" autoComplete="Last-name" name="lastname" id="lastname" value={lastname} onChange={(event)=>{dispatch(AdminActions.UPDATE_INPUT_LASTNAME(event.target.value))}} maxLength="100" className={props.lastnameAddClass?"middle__input__border-edit form-control__conv-edit form-control-custom-edit inputErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit   "} placeholder="Last Name"/>
                </div>
            </div>
            {showDeleteModal?
                <ModalContainer title="Delete User" footer={submitModalButtons(props.manage, setshowDeleteModal)} close={()=>{setshowDeleteModal(false);}} content= {"Are you sure you want to delete ? \nAll task assignment information and ICE provisions will be deleted for this user."} modalClass=" modal-sm" />
            :null} 
        </Fragment>
    )
}  

const submitModalButtons = (manage, setshowDeleteModal) => {
    return(
        <div>
            <button onClick={()=>{manage({action:"delete"});setshowDeleteModal(false);}} type="button" className="edit__modal_button" >Yes</button>
            <button type="button" onClick={()=>{setshowDeleteModal(false);}} >No</button>
        </div>
    )
}

export default EditLanding;