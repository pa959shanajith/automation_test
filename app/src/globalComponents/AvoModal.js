import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./AvoModal.scss";

const AvoModal = ({
  visible,
  setVisible,
  content,
  headerClass = null,
  footerType = null,
  headerTxt,
  modalSytle,
  onModalBtnClick = () => {},
  isDisabled = false
}) => {

  const footerValues = {
    CancelSave: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Save", autoFocus: false, btnType: null, key: "save", disabled: isDisabled },
    ],
    CancelUpdate: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Update", autoFocus: false, btnType: null, key: "save", disabled: isDisabled },
    ],
    Execute: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Execute", autoFocus: false, btnType: null, key: "save", disabled: isDisabled },

    ],
    Schedule: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Schedule", autoFocus: false, btnType: null, key: "save", disabled: isDisabled },
    ],
  };
  const footerContent = footerValues[footerType]?.map((el) => (
    <div>
      <Button
        className={`${el?.key}_button`}
        label={el?.btnTxt}
        {...(el?.btnType && { [el?.btnType]: true })}
        onClick={() => onModalBtnClick(el?.btnTxt)}
        autoFocus={el?.autoFocus}
        disabled={el.disabled}
      />
    </div>
  ));

  return (
    <Dialog
      header={headerTxt}
      visible={visible}
      className="modalClass"
      style={modalSytle}
      onHide={() => onModalBtnClick('Cancel')}
      {...(headerClass ? { headerClassName: headerClass } : {})}
      {...(footerContent ? { footer: footerContent } : {})}
    >
      {content}
    </Dialog>
  );
};

export default AvoModal;
