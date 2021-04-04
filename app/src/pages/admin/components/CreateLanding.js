import React ,  { Fragment,  useRef, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {ScrollBar} from '../../global' 
import * as actionTypes from '../state/action';
import '../styles/CreateLanding.scss';
import useOnClickOutside from './UseOnClickOutside'
import ValidationExpression from '../../global/components/ValidationExpression';

/*Component CreateLanding
  use: renders create New User Landing page
  todo: 
*/
    
const CreateLanding = (props) => {
    const dispatch = useDispatch()
    const userConf = useSelector(state=>state.admin.userConf)
    const node = useRef();

    useEffect(()=>{
        if(document.getElementById("confServer") !== null)
            document.getElementById("confServer").selectedIndex = "0";  
    },[userConf.confServerList])

    useOnClickOutside(node, () => {props.setShowDropdown(!props.showDropdown);props.click({query:'retaintype'});});

    const userNameChange = (value) => {
        value = ValidationExpression(value.toLowerCase(),"userName")
        dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload:value})
    }

    return (
        <Fragment>
            <div className="adminActionBtn">
                <button data-test="editButton" className=" a__btn pull-right " onClick={()=>{props.setShowEditUser(true);props.edit();}}  title="Edit User">Edit</button>
                <button data-test="createButton" className=" a__btn pull-right Create-User__btn btn-create-cust"  onClick={()=>{props.manage({action:"create"})}} disabled={userConf.nocreate} title="Create User" >Create</button>
                <button data-test="clearButton" className=" a__btn pull-right Create-User__btn btn-create-cust" title="Clear" onClick={()=>{props.click();dispatch({type:actionTypes.UPDATE_TYPE,payload:"inhouse"})}}  >Clear</button>               
            </div>

            <div className="Create-outer form-group__conv-create" >
                <div className="selectRole-create adminControl-create">
					<label data-test="userTypeLabel" className="leftControl-create primaryRole-create">User Type</label>
					<select data-test="userTypeDropdown" value={userConf.type} onChange={(event)=>{props.click(); props.selectUserType({type:event.target.value});dispatch({type:actionTypes.UPDATE_TYPE,payload:event.target.value});}} className='adminSelect-create form-control__conv-create ' id="userTypes-create"   >
						<option value="inhouse" >Default</option>
						<option value="ldap">LDAP</option>
						<option value="saml">SAML</option>
						<option value="oidc">OpenID</option>
					</select>
                </div>

                {(userConf.type !== "inhouse")?
                        <div className="adminControl-create" >
                            <select data-test="confServer" defaultValue={""} onChange={(event)=>{props.clearForm();dispatch({type:actionTypes.UPDATE_SERVER,payload:event.target.value});}} className={props.confServerAddClass?'adminSelect-create  form-control__conv-create selectErrorBorder confServer-cust':'adminSelect-create  form-control__conv-create confServer-cust'} id="confServer">
                                <option key="0" disabled={true} value="" >Select Server</option>                                
                                {userConf.confServerList.map((srv,index) => (      
                                    <option key={index} value={srv.name} disabled={userConf.confExpired===srv.name}>{srv.name}</option>
                                ))}
                            </select>
                        </div>
                    : null
                }

                {(userConf.type === "ldap")?
                    <Fragment>
                        <div data-test="userLDAPFetch" className="userLDAPFetch adminControl-create">
                            <div className="Create-outer Create-outer-cust">
                                <label className="adminFormRadio">
                                    <input data-test="ldapRadioMap" checked={userConf.ldap.fetch==="map"} type="radio"  value="map" onChange={()=>{dispatch({type:actionTypes.UPDATE_LDAP_FETCH,payload:"map"});props.ldapSwitchFetch({userConf_ldap_fetch:"map"});}} name="ldapFetch" disabled={userConf.server === ''} />
                                    <span >Map New User</span>
                                </label>
                                <label className="adminFormRadio">
                                    <input data-test="ldapRadioImport" checked={userConf.ldap.fetch==="import"} type="radio" value="import" onChange={()=>{dispatch({type:actionTypes.UPDATE_LDAP_FETCH,payload:"import"});props.ldapSwitchFetch({userConf_ldap_fetch:"import"});}} name="ldapFetch" disabled={userConf.server === ''}/>
                                    <span >Import User</span>
                                </label>
                            </div>
                            {(userConf.ldap.fetch !== 'import')?
                                <div className="userForm-create">
                                    <button data-test="fetchButtonLdap" title="Fetch" disabled={userConf.server === ''} onClick={()=>{props.ldapGetUser();}} className=" a__btn pull-right  Create-User__btn btn-disabled" >Fetch</button>
                                    <input data-test="userDomainName" type="text" autoComplete="off" id="ldapDirectory" name="ldapDirectory" value={userConf.ldap.user} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_LDAP_USER,payload:event.target.value})}}  className={props.ldapDirectoryAddClass?((props.ldapDirectoryAddClass==="selectErrorBorder")?"middle__input__border-create form-control__conv-create form-control-custom-create create selectErrorBorder":"middle__input__border-create form-control__conv-create form-control-custom-create create inputErrorBorder"):"middle__input__border-create form-control__conv-create form-control-custom-create create"}  placeholder="User Domain Name"/>
                                </div>
                                :null
                            }
                            {(userConf.ldap.fetch === 'import')?
                                <div className="dropdown dropdown-scroll userForm-create" >
                                    <input data-test="userListInput" value={userConf.ldapUserFilter} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_LDAP_USER_FILTER,payload:event.target.value});props.searchFunctionLdap(event.target.value);}} onClick={()=>{props.click({query:'retaintype'});props.setShowDropdown(!props.showDropdown);}}  className={props.ldapDirectoryAddClass?((props.ldapDirectoryAddClass==="selectErrorBorder")?"btn btn-users dropdown-toggle selectErrorBorder search-cust c__search-dropdown":"btn btn-users dropdown-toggle inputErrorBorder  search-cust c__search-dropdown"):"btn btn-users dropdown-toggle search-cust c__search-dropdown"}    type="text" autoComplete="off" id="ldapDirectory" data-toggle="dropdown" placeholder="Search User.."></input>
                                    {(props.showDropdown && userConf.ldapAllUserList!==[])?
                                    <ul ref={node} className=" dropdown-menu-edit dropdown-menu-users-ldap create-user__dropdown ldapDirectory-cust" role="menu" aria-labelledby="ldapDirectory" >
                                    <ScrollBar scrollId='ldap' thumbColor="#929397" >
                                        {props.ldapUserList.map((luser,index) => (      
                                            <li index={index} role="presentation" onClick={()=>{props.setShowDropdown(!props.showDropdown);dispatch({type:actionTypes.UPDATE_LDAP_USER,payload:luser.value});dispatch({type:actionTypes.UPDATE_LDAP_USER_FILTER,payload:luser.html});props.ldapGetUser({luser:luser.value});}} value={luser.value} className="ldap-user__li">{luser.html}</li>
                                        ))}
                                    </ScrollBar>
                                    </ul>
                                    :null}
                                </div>
                            :null}
                        </div> 
                    </Fragment>
                    : null
                }

                <div className='userForm-create adminControl-create'>
                    <input data-test="userName-input__create" type="text" autoComplete="User-name" id="userName" value={userConf.userName} onChange={(event)=>{userNameChange(event.target.value)}} name="userName" maxLength="100" className={props.userNameAddClass?((props.userNameAddClass==="selectErrorBorder")?"middle__input__border-create form-control-custom-create form-control__conv-create  selectErrorBorder username-cust":"middle__input__border-create form-control-custom-create form-control__conv-create username-cust inputErrorBorder"):"username-cust middle__input__border-create form-control-custom-create form-control__conv-create   "} placeholder="User Name"/>
                </div>

                <div className='leftControl-create adminControl-create'>
                    <input data-test="firstName-input__create" type="text" autoComplete="First-name" name="firstname" id="firstname" value={userConf.firstname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:event.target.value})}} maxLength="100" className={props.firstnameAddClass?"middle__input__border-create form-control__conv-create form-control-custom-create inputErrorBorder":"middle__input__border-create form-control__conv-create form-control-custom-create "} placeholder="First Name"/>
                </div>
                <div className='rightControl-create adminControl-create'>
                    <input data-test="lastName-input__create" type="text" autoComplete="Last-name" name="lastname" id="lastname" value={userConf.lastname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:event.target.value})}} maxLength="100" className={props.lastnameAddClass?"middle__input__border-create form-control__conv-create form-control-custom-create inputErrorBorder":"middle__input__border-create form-control__conv-create form-control-custom-create  "} placeholder="Last Name"/>
                </div>
            </div>
        </Fragment>
    )
}  

export default CreateLanding;