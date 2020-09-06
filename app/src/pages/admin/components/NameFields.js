import React ,  { Fragment} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../state/action';
import '../styles/CreateLanding.scss';

/*Component NameFields
  use: renders NameFields
  todo: 
*/
    
const NameFields = (props) => {
    const dispatch = useDispatch()
    const userConf = useSelector(state=>state.admin.userConf)

    return (
        <Fragment>
            <div className='leftControl-edit adminControl-edit'>
                <input type="text" autoComplete="First-name" name="firstname" id="firstname" value={userConf.firstname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:event.target.value})}} maxLength="100" className={props.firstnameAddClass?"middle__input__border-edit form-control__conv-edit form-control-custom-edit  inputErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit "} placeholder="First Name"/>
            </div>
            <div className='rightControl-edit adminControl-edit'>
                <input type="text" autoComplete="Last-name" name="lastname" id="lastname" value={userConf.lastname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:event.target.value})}} maxLength="100" className={props.lastnameAddClass?"middle__input__border-edit form-control__conv-edit form-control-custom-edit inputErrorBorder":"middle__input__border-edit form-control__conv-edit form-control-custom-edit   "} placeholder="Last Name"/>
            </div>
        </Fragment>
    )
}

export default NameFields;