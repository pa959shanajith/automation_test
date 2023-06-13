import { ConfirmDialog } from 'primereact/confirmdialog';
import { Button } from "primereact/button";
// import "./AvoConfirmDialog.scss";

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
    <ConfirmDialog
      className="Logout_modal"
      visible={visible}
      onHide={() => onHide(false)} 
      showHeader={showHeader}
      message={message} 
      icon={icon} 
      accept={(e) => accept(e)} />
  );
};

export default AvoConfirmDialog;
