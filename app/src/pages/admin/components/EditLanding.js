import React ,  { Fragment} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../state/action';
import '../styles/EditLanding.scss';
// import NameFields from './NameFields';

/*Component EditLanding
  use: renders edit New User Landing page
  todo: 
*/
    
const EditLanding = (props) => {
    const dispatch = useDispatch()
    const userConf = useSelector(state=>state.admin.userConf)

    return (
        <Fragment>
            <div className="adminActionBtn">
                <button className=" btn-md-create pull-right adminBtn Create-User__btn_edit" onClick={()=>props.manage({action:'update'})} disabled={userConf.userIdName===''} title="Update User">Update</button>
                <button className=" btn-md-create pull-right adminBtn Create-User__btn_edit" onClick={()=>{props.manage({action:"delete"});props.deleteUser();}} disabled={userConf.userIdName===''} style={{marginRight:"10px"}} title="Delete Configuration">Delete</button>           
            </div>

            <div className="col-xs-9 " style={{paddingTop:"5%"}}>
                <div className='userForm-edit adminControl-edit'>
                    <button title={userConf.fType} className="userTypeBtn_conv-edit " style={{margin:"4px 0",right:"0",cursor:"default"}}>{userConf.fType}</button>
                    <input list="allUsersListauto" className=" btn-users dropdown-toggle-edit edit-user-dropdown-edit" onClick = {()=>{props.click();props.setShowDropdownEdit(!props.showDropdownEdit);}} type="text"  id="userIdName"  onChange={(event)=>{dispatch({type:actionTypes.UPDATE_ALL_USER_FILTER,payload:event.target.value});props.searchFunctionUser(event.target.value);}} data-toggle="dropdown" value={userConf.allUserFilter}  placeholder="Search User.." autoComplete="none"/>
                    {(props.showDropdownEdit && userConf.allUsersList!==[])?
                        <div className=" dropdown-menu-edit dropdown-menu-users-edit create-user__dropdown" role="menu" aria-labelledby="userIdName" style={{padding: "6px",fontSize: "14px",WebkitBoxShadow: "0 6px 12px rgba(0,0,0,.175)",boxShadow: "0 6px 12px rgba(0,0,0,.175)",display: "block", border: "1px solid rgba(0,0,0,.15)"}}>
                            {props.allUserFilList.map((uid,index) => (  
                                <option key={index} role="presentation" onClick = {()=>{props.setShowDropdownEdit(!props.showDropdownEdit);dispatch({type:actionTypes.UPDATE_USERIDNAME,payload:uid[1]+';'+uid[0]});dispatch({type:actionTypes.UPDATE_ALL_USER_FILTER,payload:uid[0]});props.getUserData({user_idName:uid[1]+';'+uid[0]});}} value={uid[1] +";"+uid[0]}> {uid[0]}</option> 
                            ))}
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
                        <button title="Fetch" disabled={userConf.server === ''} onClick={()=>{props.ldapGetUser();}} className=" btn-md-create pull-right adminBtn Create-User__btn_edit btn-disabled" >Fetch</button>
                    </div>
                    :null
                }
                <div className='leftControl-edit adminControl-edit'>
                <input type="text" autoComplete="First-name" name="firstname" id="firstname" value={userConf.firstname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:event.target.value})}} maxLength="100" className={props.firstnameAddClass?"middle__input__border-edit form-control__conv-edit form-control-custom-edit  inputErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit "} placeholder="First Name"/>
            </div>
            <div className='rightControl-edit adminControl-edit'>
                <input type="text" autoComplete="Last-name" name="lastname" id="lastname" value={userConf.lastname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:event.target.value})}} maxLength="100" className={props.lastnameAddClass?"middle__input__border-edit form-control__conv-edit form-control-custom-edit inputErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit   "} placeholder="Last Name"/>
            </div>

            </div>

            

            

            
        </Fragment>
    )
}  


export default EditLanding;