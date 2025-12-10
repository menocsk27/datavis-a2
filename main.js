const x_header = "Highway Miles Per Gallon";
const y_header = "Horsepower(HP)";
const binary_header = "AWD";
const scale_header = "Cyl";
const min_size = 2;

const features = [
  //'AWD', 'RWD', 
  //'Engine Size (l)', 
  //'Cyl', 
  'Horsepower(HP)', 
  'City Miles Per Gallon', 
  'Highway Miles Per Gallon', 
  'Wheel Base', 
  'Len', 
  'Width',
  //'Weight', 
  //'Retail Price', 
  //'Dealer Cost', 
]

// Waiting until document has loaded
window.onload = async () => {
  const data = [];

  d3.csv('https://menocsk27.github.io/cars.csv', (d) => data.push(d)).then(() => {
    console.log(data);
    draw_scatterplot_v5(data);
    draw_legend(data);
  });
  
  // const data = await d3.csv(link);
  // draw_scatter_plot_v7(data);
};

function draw_legend(data) {
  const svg = d3.select('#legend')
    .attr("width", 300)
    .attr("height", 300);
  
  const sizes = d3.extent(data.map(d => +d.Cyl))// Array.from(new Set(data.map(d => +d[scale_header]).sort((a, b) => a > b ? 1: -1)));
  
  console.log(
    Array.from(new Set(data.map(d => d.Type)))
  )
  
  console.log(
    d3.extent(data.map(d => +d.Cyl))
  )
  
  const title = svg.append("text")
    .attr("x", 30)
    .attr("y", 25)  
    .text("# of cylinders") 
    
  const circles = svg.append("g");
  
  circles.selectAll('circle')
    .data(sizes)
    .join(enter => enter
      .append("circle")
      .attr("cx", 50)
      .attr("cy", (d, i) => 50 + i * 27)
      .attr("fill", "black")
      .attr("r", d => d+min_size)
    );
  
  circles.selectAll('text')
    .data(sizes)
    .join(enter => enter
      .append("text")
      .attr("x", 70)
      .attr("y", (d, i) => 55 + i * 27)
      .text(d => d)
    );
  
  const colors = ["darkorange", "#61a3a9"] 
  const rects = svg.append("g");
  
  rects.selectAll('rect')
    .data(colors)
    .join(enter => enter
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("x", 150)
      .attr("y", (d, i) => 10 + i * 22)
      .attr("fill", d => d)
      .attr("opacity", 0.5)
      .attr("r", d => d)
    );
  
  rects.selectAll('text')
    .data(colors)
    .join(enter => enter
      .append("text")
      .attr("x", 175)
      .attr("y", (d, i) => 25 + i * 22)
      .text((d, i) =>  i ? "no " + binary_header : binary_header)
    );
          
}

// adapts https://d3-graph-gallery.com/graph/interactivity_zoom.html
function draw_scatterplot_v5(data) {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 50, left: 60 },
    width = 550 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

   // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 20]) // This control how much you can unzoom (x0.5) and zoom (x20)
    .extent([ [0, 0], [width, height] ])
    .on("zoom", updateChart);
  
  // append the SVG object to the body of the page
  const SVG = d3
    .select("#scatterplot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
  // Add X axis
  const minX = d3.min(data, d => +d[x_header]);
  const maxX = d3.max(data, d => +d[x_header]);
  const x = d3.scaleLinear()
    .domain([0, maxX + (maxX/10)])
    .range([0, width]);
  const xAxis = SVG.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  xAxis.append("text")
    .attr("x", width - 50).attr("y", 30)  
    .attr("fill", "black")  
    .text(x_header)

  // Add Y axis
  const minY = d3.min(data, d => +d[y_header]);
  const maxY = d3.max(data, d => +d[y_header]);
  const y = d3.scaleLinear()
    .domain([minY, maxY + (maxY/10)])
    .range([height, 0]);
  const yAxis = SVG.append("g").call(d3.axisLeft(y));
  yAxis.append("text")
    .attr("x", 80).attr("y", 10)  
    .attr("fill", "black")  
    .text(y_header)

  
  // Add a clipPath: everything out of this area won't be drawn.
  const clip = SVG.append("defs")
    .append("SVG:clipPath")
    .attr("id", "clip")
    .append("SVG:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  // Create the scatter variable: where both the circles and the brush take place
  const scatter = SVG.append("g").attr("clip-path", "url(#clip)");
  
  // Add circles
  const circles = scatter
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
  
  circles.on('mouseover', (d, i, e) => {
    document.getElementById('info').innerHTML = Object.keys(d).map(k => `${k}: ${d[k]}`).join('<br>');
    RadarChart('#starplot', [data[i]], {labels:true});
    //e.map(i => i.style.stroke="none");
    e[i].style.stroke="red" 
    e[i].style.strokeWidth="3";
  });
  
  circles.on('mouseout', (_, i, e) => e[i].style.stroke="none");
  
  circles
    .attr("cx", d => x(d[x_header]))
    .attr("cy", d => y(d[y_header]))
    .attr("r", d => +d[scale_header]+min_size)
    .style("fill", d => +d[binary_header] ? "darkorange" : "#61a3a9")
    .style("opacity", 0.5);

  
  // updates the chart on zoom (new boundaries)
  function updateChart() {
    // recover the new scale
    const newX = d3.event.transform.rescaleX(x);
    const newY = d3.event.transform.rescaleY(y);

    // update axes with these new boundaries
    xAxis.call(d3.axisBottom(newX));
    yAxis.call(d3.axisLeft(newY));

    // update circle position
    SVG.selectAll("circle")
      .attr("cx", d => newX(d[x_header]))
      .attr("cy", d => newY(d[y_header]));
  }
}

// adapts https://observablehq.com/@d3/brushable-scatterplot
function draw_scatter_plot_v7(data) {
  // Specify the chart’s dimensions.
  const width = 928;
  const height = 600;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 40;

  // Create the horizontal (x) scale, positioning N/A values on the left margin.
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d[x_header])])
    .nice()
    .range([marginLeft, width - marginRight])
    .unknown(marginLeft);

  // Create the vertical (y) scale, positioning N/A values on the bottom margin.
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d[y_header])])
    .nice()
    .range([height - marginBottom, marginTop])
    .unknown(height - marginBottom);

  // Create the SVG container.
  const svg = d3
    .select("svg#scatterplot")
    .attr("viewBox", [0, 0, width, height])
    .property("value", []);

  // Append the axes.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x))
    .call(g => g.select(".domain").remove())
    .call(g => g
        .append("text")
        .attr("x", width - marginRight)
        .attr("y", -4)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .text(x_header)
    );

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g
      .select(".tick:last-of-type text")
      .clone()
      .attr("x", 4)
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text(y_header)
    );

  // Append the dots.
  const dot = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr(
      "transform",
      (d) => `translate(${x(+d[x_header])},${y(+d[y_header])})`
    )
    .attr("r", 3);

  // Create the brush behavior.
  svg.call(
    d3.brush().on("end", ({ selection }) => {
      console.log(selection);
      let value = [];
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection;
        value = dot
          .style("stroke", "gray")
          .filter(
            (d) =>
              x0 <= x(d[x_header]) &&
              x(d[x_header]) < x1 &&
              y0 <= y(d[y_header]) &&
              y(d[y_header]) < y1
          )
          .style("stroke", "steelblue")
          .data();
      } else {
        dot.style("stroke", "steelblue");
      }

      // Inform downstream cells that the selection has changed.
      //svg.property("value", value).dispatch("input");
    })
  );
}

// adapts https://yangdanny97.github.io/misc/spider_chart/ and https://gist.github.com/nbremer/21746a9668ffdf6d8242
function RadarChart(id, data, options) {
  const cfg = {
    w: 550, //Width of the circle
    h: 550, //Height of the circle
    maxValue: 0, //What is the value that the biggest circle will represent
    _filter: () => true,
    labels: false,
    margin: { top: 10, right: 30, bottom: 30, left: 60 }
  };

  if ("undefined" !== typeof options) {
    for (var i in options) {
      if ("undefined" !== typeof options[i]) {
        cfg[i] = options[i];
      }
    }
  } 

  const width = cfg.w - cfg.margin.left - cfg.margin.right;
  const height = cfg.h - cfg.margin.top - cfg.margin.bottom;
  const radius = width / 2;
  const maxValue = Math.max(cfg.maxValue, d3.max(features.map(f => +data[0][f])));
  const svg = d3.select(id);
  
  svg.selectAll("*").remove();
  svg
    .attr("width", width + cfg.margin.left + cfg.margin.right)
    .attr("height", height + cfg.margin.top + cfg.margin.bottom);

  const radialScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

  // draw grid lines (circles)
  svg.selectAll("circle")
    .data([ maxValue/16, maxValue/4, maxValue/2, maxValue ])
    .join(enter => enter
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "none")
        .attr("stroke", "#e3e3e3")
        .attr("r", d => radialScale(d))
    );

  // draw axis for each feature
  function angleToCoordinate(angle, value) {
    const x = Math.cos(angle) * radialScale(value);
    const y = Math.sin(angle) * radialScale(value);
    return { x: width / 2 + x, y: height / 2 - y };
  }

  const featureData = features.map((f, i) => {
    const angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
    return {
      name: f,
      angle: angle,
      line_coord: angleToCoordinate(angle, maxValue),
      label_coord: angleToCoordinate(angle, maxValue),
    };
  });

  // draw axis line
  svg.selectAll("line")
    .data(featureData)
    .join(enter => enter
      .append("line")
      .attr("x1", width / 2)
      .attr("y1", height / 2)
      .attr("x2", d => d.line_coord.x)
      .attr("y2", d => d.line_coord.y)
      .attr("stroke", "black")
    );

  // draw axis label
  if (cfg.labels) {
    svg.selectAll(".axislabel")
      .data(featureData)
      .join(enter => enter
        .append("text")
        .attr("x", d => d.label_coord.x)
        .attr("y", d => d.label_coord.y)
        .text(d => d.name)
      );
  }
  
  // get coordinates for a data point
  function getPathCoordinates(data_point) {
    const coordinates = [];
    for (var i = 0; i < features.length; i++) {
      const ft_name = features[i];
      const angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
      const value = data_point[ft_name];
      coordinates.push(angleToCoordinate(angle, value));
    }
    return coordinates;
  }
  
  
  // drawing the line for the spider chart
  const line = d3.line().x(d => d.x).y(d => d.y);
  
  // draw the path element
  svg.selectAll("path")
    .data(data)
    .join(enter => enter
      .append("path")
      .datum(d => ({ 
        path: getPathCoordinates(d), 
        color: +d[binary_header] ? "darkorange" : "#61a3a9" 
      }))
      .attr("d", d => line(d.path))
      .attr("stroke-width", 3)
      .attr("stroke", d => d.color)
      .attr("fill", d =>  d.color)
      .attr("stroke-opacity", 1)
      .attr("opacity", 0.5)
    );
}