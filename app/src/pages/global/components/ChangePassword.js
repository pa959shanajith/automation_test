import React, { useState } from 'react';
import {Modal} from 'react-bootstrap';
import '../styles/ChangePassword.scss'

const ChangePassword = ({show, setShow}) => {

    
    const handleClose = () => setShow(false);
    const handleOpen = () => setShow(true);

    return (
        <Modal show = {show} onHide = {handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    Change Password
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Body
            </Modal.Body>            
            <Modal.Footer>
                Footer
            </Modal.Footer>
        </Modal>
    );
}

export default ChangePassword;