import React ,  { Fragment , useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../state/action';
import '../styles/EditLanding.scss';
import useOnClickOutside from './UseOnClickOutside'
import {ScrollBar, ModalContainer} from '../../global' 

/*Component EditLanding
  use: renders edit New User Landing page
  todo: 
*/
    
const EditLanding = (props) => {
    const dispatch = useDispatch()
    const userConf = useSelector(state=>state.admin.userConf)
    const [showDeleteModal,setshowDeleteModal] = useState(false)
    const node = useRef();

    useOnClickOutside(node, () => props.setShowDropdownEdit(!props.showDropdownEdit));

    return (
        <Fragment>
            <div className="adminActionBtn">
                <button data-test="updateButton" className=" a__btn pull-right Create-User__btn_edit" onClick={()=>props.manage({action:'update'})} disabled={userConf.userIdName===''} title="Update User">Update</button>
                <button data-test="deleteButton" className=" a__btn pull-right Create-User__btn_edit" onClick={()=>{setshowDeleteModal(true)}} disabled={userConf.userIdName===''} style={{marginRight:"10px"}} title="Delete Configuration">Delete</button>           
            </div>

            <div className="col-xs-9 " style={{paddingTop:"5%"}}>
                <div className='userForm-edit adminControl-edit'>
                    <button title={userConf.fType} className="userTypeBtn_conv-edit " style={{margin:"4px 0",right:"0",cursor:"default"}}>{userConf.fType}</button>
                    <input data-test="userListInputEdit" list="allUsersListauto" className=" btn-users edit-user-dropdown-edit" onClick = {()=>{props.click();props.setShowDropdownEdit(!props.showDropdownEdit);props.setAllUserFilList(userConf.allUsersList);}} type="text"  id="userIdName"  onChange={(event)=>{dispatch({type:actionTypes.UPDATE_ALL_USER_FILTER,payload:event.target.value});props.searchFunctionUser(event.target.value);}} value={userConf.allUserFilter}  placeholder="Search User.." autoComplete="none"/>
                    {(props.showDropdownEdit && userConf.allUsersList!==[])?
                        <div ref={node} className=" dropdown-menu-edit dropdown-menu-users-edit create-user__dropdown c__usersList" role="menu" style={{}}>
                            <ScrollBar scrollId='allUsersListauto' thumbColor="#929397" >
                            {props.allUserFilList.map((uid,index) => (  
                                <option key={index} role="presentation" onClick = {()=>{props.setShowDropdownEdit(!props.showDropdownEdit);dispatch({type:actionTypes.UPDATE_USERIDNAME,payload:uid[1]+';'+uid[0]});dispatch({type:actionTypes.UPDATE_ALL_USER_FILTER,payload:uid[0]});props.getUserData({user_idName:uid[1]+';'+uid[0]});}} value={uid[1] +";"+uid[0]} className="user-select__option"> {uid[0]}</option> 
                            ))}
                            </ScrollBar>
                        </div>
                        :null
                    }
                </div>

                {(userConf.type !== "inhouse"  && userConf.userIdName!=='')?
                    <div className="adminControl-edit" >
                        <select onChange={(event)=>{props.clearForm();dispatch({type:actionTypes.UPDATE_SERVER,payload:event.target.value});}} className={props.confServerAddClass?'adminSelect-edit  form-control__conv-edit selectErrorBorder':'adminSelect-edit  form-control__conv-edit'} id="confServer" style={{marginLeft:"0",width:"100%"}}>
                            {userConf.confServerList.map((srv,index) => (      
                                <option key={index} value={srv.name} selected={srv.name===userConf.server} disabled={userConf.confExpired===srv.name}>{srv.name}</option>
                            ))}
                        </select>
                    </div>
                    : null
                }

                {( userConf.userIdName!=='' && userConf.type === "ldap")?
                    
                    <div className="userForm-edit" style={{display:"inline-flex"}}>
                        <input type="text" autoComplete="off" id="ldapDirectory" name="ldapDirectory" value={userConf.ldap.user} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_LDAP_USER,payload:event.target.value})}}  className={props.ldapDirectoryAddClass?((props.ldapDirectoryAddClass==="selectErrorBorder")?"middle__input__border-edit form-control__conv-edit form-control-custom-edit create selectErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit create inputErrorBorder"):"middle__input__border-edit form-control__conv-edit form-control-custom-edit create"}  placeholder="User Domain Name"/>
                        <button title="Fetch" disabled={userConf.server === ''} onClick={()=>{props.ldapGetUser();}} className=" a__btn pull-right  Create-User__btn_edit btn-disabled" >Fetch</button>
                    </div>
                    :null
                }
                <div className='leftControl-edit adminControl-edit'>
                    <input data-test="firstName-input__edit" type="text" autoComplete="First-name" name="firstname" id="firstname" value={userConf.firstname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:event.target.value})}} maxLength="100" className={props.firstnameAddClass?"middle__input__border-edit form-control__conv-edit form-control-custom-edit  inputErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit "} placeholder="First Name"/>
                </div>
                <div className='rightControl-edit adminControl-edit'>
                    <input data-test="lastName-input__edit" type="text" autoComplete="Last-name" name="lastname" id="lastname" value={userConf.lastname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:event.target.value})}} maxLength="100" className={props.lastnameAddClass?"middle__input__border-edit form-control__conv-edit form-control-custom-edit inputErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit   "} placeholder="Last Name"/>
                </div>
            </div>
            {showDeleteModal?
                <ModalContainer title="Delete User" footer={submitModalButtons(props.manage, setshowDeleteModal)} close={()=>{setshowDeleteModal(false);}} content= "Are you sure you want to delete ? All task assignment information and ICE provisions will be deleted for this user." modalClass=" modal-sm" />
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