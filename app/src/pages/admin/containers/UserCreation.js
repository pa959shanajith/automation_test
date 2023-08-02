import React, { useState, useRef, useEffect } from 'react';
import UserList from '../components/UserList';
import CreateUser from '../components/CreateUser';

const UserCreation = (props) => {
    return (<>
        <div>
            <UserList/>
           <CreateUser createUserDialog={props.createUserDialog}  setCreateUserDialog={props.setCreateUserDialog}/>
        </div>
    </>)
}
export default UserCreation;