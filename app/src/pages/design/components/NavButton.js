import React, { useEffect , useState} from 'react';
import * as d3 from "d3"
import '../styles/NavButton.scss'

/*Component NavButton
  use: returns floating NavButton with 4 directional movement and zoom +/-
*/

var interval;
const NavButton = (props) => {
    const [move,setMove] = useState(false)
    useEffect(()=>{
        if(move === false){
            if(interval)clearInterval(interval);
            return;
        }else{
        interval = setInterval(()=>{
            var offset = -20
            var factor = 0.2
            var extent = [0.1, 3]
            var s = d3.select('.mp__canvas_svg');
            var center = [parseFloat(s.style("width"))/4, parseFloat(s.style("height"))/4];
            var mptf =  d3.select('.ct-container').attr('transform')
            var x = parseInt(mptf.split(/[()]/)[1].split(',')[0]) 
            var y = parseInt(mptf.split(/[()]/)[1].split(',')[1]);
            var k = mptf.split(/[()]/)[3]
            var t = [(center[0] - x) / k, (center[1] - y) / k];
            switch (move) {
                case "left":
                    x -= offset;
                    break;
                case "up":
                    y -= offset;
                    break;
                case "right":
                    x += offset;
                    break;
                case "down":
                    y += offset;
                    break;
                case "zoom-up":
                    k =  k * (1 + factor);
                    x += center[0] - (t[0] * k + x);
                    y += center[1] - (t[1] * k + y);
                    break;
                case "zoom-down":
                    k =  k * (1 - factor);
                    x += center[0] - (t[0] * k + x);
                    y += center[1] - (t[1] * k + y);
                    break;
                default:
                    return;
            }
            if (k < extent[0] || k > extent[1]){
                setMove(false)
            }else{
                props.setCtScale({x:x,y:y,k:k})
                interpolateZoom([props.ctScale.x, props.ctScale.y], props.ctScale.k,props.zoom);
            }
        },40)}
   },[move, props, props.zoom])

    return(                                                                     
       <></>
    )
}

function interpolateZoom(translate, scale, zoom) {
    return d3.transition().duration(350).tween("zoom", function() {
        var iTranslate = d3.interpolate(zoom.translateTo(), translate),
            iScale = d3.interpolate(zoom.scaleTo(), scale);
        return function(t) {
            zoom
                .scaleTo(iScale(t))
                .translateTo(iTranslate(t));
                d3.select('.ct-container').attr("transform", "translate(" +translate[0]+','+translate[1]+ ")scale(" + scale + ")");
        };
    });
}

export default NavButton;