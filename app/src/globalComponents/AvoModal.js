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
  modalSytle
}) => {
  const footerValues = {
    CancelNext: [
      { btnTxt: "Cancel", autoFocus: false, btnType: "link", key: "close" },
      { btnTxt: "Next", autoFocus: false, btnType: null, key: "save"},
    ]
  };
  const footerContent = footerValues[footerType]?.map((el) => (
    <div>
      <Button
        className={`${el?.key}_button`}
        label={el?.btnTxt}
        {...(el?.btnType && { [el?.btnType]: true })}
        onClick={() => setVisible(false)}
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
