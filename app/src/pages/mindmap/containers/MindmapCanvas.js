import React, { useRef, useEffect, useState, Fragment } from 'react';
import * as d3 from 'd3';

/*Component Canvas
  use: defines components for each url
*/

const Canvas = () => {
    const CanvasRef = useRef();
    const child = useRef();
    const [count,setCount] = useState(1)
    useEffect(() => {
        if (!CanvasRef.current) return;
        const selection = d3.select(CanvasRef.current);
        const zoom = d3.zoom().scaleExtent([0.1, 3]).on("zoom", function(e) {
            let { x, y, k } = d3.event.transform;
            d3.select('#ct-mindmap').attr("transform", "translate(" + x+','+y + ")scale(" + k + ")");
        });
        selection.call(zoom);
        return () => selection.on(".zoom", null);
    }, []);

    useEffect(()=>{
        main(child) 
    },[child])
    return (
        <Fragment>
            <div onClick = {()=>setCount(count+1)}>lol</div>
            <svg style={{width:'100%',height:'100%'}} ref={CanvasRef}>
                <g id="ct-mindmap" transform="translate(0,0) scale(1)">
                    {(new Array(count).fill(0)).map((e,i)=><circle key={i} cx={150*i} cy="90" r="50" fill="red"></circle>)}
                </g>
            </svg>
        </Fragment>
    );
}

const main = (CanvasRef) => {
    const mainSvg= d3.select(CanvasRef.current)
    //Logic to change the layout               
    mainSvg.append("circle")
    .attr("cx",150)
    .attr("cy",70)
    .attr("r",50)
    .attr("fill",'red')
    .on('click',(d)=>{
        d3.event.preventDefault();
        d3.event.stopPropagation();
    })
}
export default Canvas;