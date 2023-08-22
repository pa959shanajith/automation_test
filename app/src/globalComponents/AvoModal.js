import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./AvoModal.scss";

const AvoModal = ({
  visible,
  content,
  headerClass = null,
  footerType = null,
  headerTxt,
  modalSytle,
  onModalBtnClick = () => {},
  isDisabled = false,
  customClass = ""
}) => {

  const footerValues = {
    CancelSave: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "Cancel" },
      { btnTxt: "Save", autoFocus: false, btnType: null, key: "Save", disabled: isDisabled },
    ],
    CancelUpdate: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "Cancel" },
      { btnTxt: "Update", autoFocus: false, btnType: null, key: "Update", disabled: isDisabled },
    ],
    Execute: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "Cancel" },
      { btnTxt: "Execute", autoFocus: false, btnType: null, key: "Execute", disabled: isDisabled },

    ],
    Schedule: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "Cancel" }
    ],
    ScheduleIce: [
      { btnTxt: "Schedule", autoFocus: false, btnType: null, key: "ScheduleIce", disabled: isDisabled },
    ],
    Launch: [
      { btnTxt: "Launch", autoFocus: false, btnType: null, key: "Launch", disabled: isDisabled },
    ],
    Connect: [
      { btnTxt: "Connect", autoFocus: false, btnType: null, key: "Connect", disabled: isDisabled },
    ],
    Proceed: [
      { btnTxt: "Proceed", autoFocus: false, btnType: null, key: "Proceed", disabled: isDisabled },
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "Cancel" }
    ]
  };
  const footerContent = footerValues[footerType]?.map((el) => (
    <div>
      <Button
        className={`${el?.key}_button`}
        label={el?.btnTxt}
        {...(el?.btnType && { [el?.btnType]: true })}
        onClick={() => onModalBtnClick(el?.key)}
        autoFocus={el?.autoFocus}
        disabled={el.disabled}
      />
    </div>
  ));

  return (
    <Dialog
      header={headerTxt}
      visible={visible}
      className={`modalClass ${customClass}`}
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
