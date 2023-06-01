import React, { useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastWrapper = ({ children, toastProps }) => {
    const toastRef = useRef(null);
  
    const showToast = (options) => {
      toastRef.current.show(options);
    };
  
    return (
      <div>
        {children}
        <Toast ref={toastRef} {...toastProps} />
      </div>
    );
  };
  
  export default ToastWrapper;