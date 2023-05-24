import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useState, useRef, useEffect } from "react";


const DesignModal = (props) =>{


return(
    <Dialog className='dailog_box' header='design' position='right' visible={props.visibleDesignStep} style={{ width: '73vw', color: 'grey', height: '95vh' }} onHide={() => props.setVisibleDesignStep(false)}>
<p>Hi Design Test Step............</p>
    </Dialog>
)
}
export default DesignModal;