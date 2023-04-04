import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

function TreeGraph({ nodes, links, dNodes }) {
    const canvasRef = useRef(null);
  
    useEffect(() => {
      const canvas = d3.select(canvasRef.current);
  
      const linkGenerator = d3.linkVertical()
        .x(links => links.x)
        .y(links => links.y);
  
      canvas.selectAll('.ct-link')
        .data(Object.entries(links))
        .join('path')
          .attr('id', d => d[0])
          .attr('stroke', 'black')
          .attr('fill', 'none')
          .attr('opacity', 1)
          .classed('ct-link', true)
          .classed('no-disp', d => d[1].hidden)
          .attr('d', d => d[1].d);
  
      const nodeGroups = canvas.selectAll('.ct-node')
        .data(Object.entries(nodes))
        .join('g')
          .attr('id', d => `node_${d[0]}`)
          .attr('class', 'ct-nodeBubble')
          .classed('ct-node', true)
          .classed('no-disp', d => d[1].hidden)
          .attr('data-nodetype', d => d[1].type)
          .attr('transform', d => d[1].transform);
  
      nodeGroups.append('image')
        .attr('class', 'ct-nodeIcon')
        .attr('xlink:href', d => d[1].img_src)
        .attr('opacity', d => d[1].state === 'created' ? 0.5 : 1)
        .attr('height', '45px')
        .attr('width', '45px')
        .on('click', nodeClick);
  
      nodeGroups.append('text')
        .attr('class', 'ct-nodeLabel')
        .attr('text-anchor', 'middle')
        .attr('x', '20')
        .attr('y', '50')
        .attr('title', d => d[1].title)
        .text(d => d[1].name);
  
      nodeGroups.filter(d => d[1].type !== 'testcases')
        .append('circle')
          .attr('class', d => `ct-${d[1].type} ct-cRight${!dNodes[d[0]]._children ? ' ct-nodeBubble' : ''}`)
          .attr('cx', '20')
          .attr('cy', '55')
          .attr('r', '4')
          .on('click', clickCollapse);
  
          nodeGroups.filter(d => d[1].type !== 'modules')
          .append('circle')
          .attr('class', d => `ct-${d[1].type} ct-nodeBubble`)
          .attr('cx', '20')
          .attr('cy', '-4')
          .attr('r', '4')
          .call(d3.drag()
              .on('start', dragStart)
              .on('drag', drag)
              .on('end', dragEnd)
          );
  }, [nodes, links, dNodes]);

  const nodeClick = (event, d) => {
      // Handle node click event
  };

  const clickCollapse = (event, d) => {
      // Handle collapse/expand click event
  };

  const dragStart = (event, d) => {
      // Handle drag start event
      d.fx = d.x;
      d.fy = d.y;
  };

  const drag = (event, d) => {
      // Handle drag event
      d.fx = event.x;
      d.fy = event.y;
  };

  const dragEnd = (event, d) => {
      // Handle drag end event
      d.fx = null;
      d.fy = null;
  };

  return (
      <svg id="mp__canvas_svg" className="mp__canvas_svg" ref={canvasRef}>
          <g className="ct-container" />
      </svg>
  )
}

export default TreeGraph;