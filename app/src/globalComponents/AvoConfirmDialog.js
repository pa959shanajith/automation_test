import { ConfirmDialog } from 'primereact/confirmdialog';
import { Button } from "primereact/button";
import "./AvoConfirmDialog.scss";

const AvoConfirmDialog = ({
  className,
  visible,
  setVisible,
  message,
  icon,
  accept,
  onHide,
  showHeader
}) => {

  return (
    <div className='Logout_modal'>
    <ConfirmDialog
      className="Logout_modal"
      visible={visible}
      onHide={() => onHide(false)} 
      showHeader={showHeader}
      message={message} 
      icon={icon} 
      accept={accept} />
      </div>
  );
};

export default AvoConfirmDialog;
