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
  onModalBtnClick = () => {}
}) => {

  const footerValues = {
    CancelNext: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Next", autoFocus: false, btnType: null, key: "next"},
    ],
    CancelSave: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Save", autoFocus: false, btnType: null, key: "save"},
    ],
    CancelUpdate: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Update", autoFocus: false, btnType: null, key: "save"},
    ],
    Execute: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Execute", autoFocus: false, btnType: null, key: "save"},

    ],
    Schedule: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "cancel" },
      { btnTxt: "Schedule", autoFocus: false, btnType: null, key: "save"},
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
      />
    </div>
  ));

  return (
    <Dialog
      header={headerTxt}
      visible={visible}
      className="modalClass"
      style={modalSytle}
      onHide={() => setVisible(false)}
      {...(headerClass ? { headerClassName: headerClass } : {})}
      {...(footerContent ? { footer: footerContent } : {})}
    >
      {content}
    </Dialog>
  );
};

export default AvoModal;
