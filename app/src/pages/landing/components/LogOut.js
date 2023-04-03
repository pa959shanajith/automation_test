import React, { useRef, useState } from 'react';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

export default function DeclarativeDemo() {
    const [visible, setVisible] = useState(false);
    const toast = useRef(null);
    const buttonEl = useRef(null);

    const accept = () => {
        toast.current.show({ severity: 'info', detail: 'User successfully logged out from Avo Assure'});
    };

    const reject = () => {
        toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmPopup target={buttonEl.current} visible={visible} onHide={() => setVisible(false)} 
                message="Are you sure you want to logout?" icon="pi pi-exclamation-triangle" accept={accept} reject={reject} />
            {/* <div className="card flex justify-content-center"> */}
                <Button id="border-0" className='surface-300' ref={buttonEl} onClick={() => setVisible(true)} icon="pi pi-sign-out" />
            {/* </div> */}
        </>
    )
}
        