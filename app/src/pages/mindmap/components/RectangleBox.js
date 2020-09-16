import React from 'react';
import { Rnd } from "react-rnd";
import '../styles/RectangleBox.scss'

const RectangleBox = () =>{
    const style = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "solid 1px blue",
        background: "rgba(200, 200, 200, 0.3)",
        borderRadius:'5px'
      };
    return(
        <Rnd
        style={style}
        default={{
          x: 150,
          y: 150,
          width: 150,
          height: 150
        }}
      >
      </Rnd>
    )
}

export default RectangleBox;