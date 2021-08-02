import React from "react";
import "../../styles/WebserviceScrape.scss";

const Tag = (props) => {
  return (
    <div
      className="ws__tag"
      style={{
        backgroundColor: props.backgroundColor || 'transparent',
        color: props.color || 'black',
        fontWeight: props.bold ? "bold" : "normal",
      }}
    >
      {props.text}
    </div>
  );
};

export default Tag;
