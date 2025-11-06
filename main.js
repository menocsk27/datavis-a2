window.onload = () => {
  //Preprocessing data before visualization and Scatterplot - dictionary mapping car brands to continents
  const brandContinent = {
    "Acura": "Japan", "Audi": "Europe", "BMW": "Europe", "Buick": "USA", "Cadillac": "USA", "Chevrolet": "USA","Chrysler": "USA",
    "Dodge": "USA", "Ford": "USA", "GMC": "USA", "Honda": "Japan", "Hummer": "USA", "Hyundai": "Korea", "Infiniti": "Japan", "Isuzu": "Japan",
    "Jaguar": "Europe", "Jeep": "USA", "Kia": "Korea", "Land Rover": "Europe", "Lexus": "Japan", "Lincoln": "USA", "Mazda": "Japan", "Mercedes-Benz": "Europe",
    "Mercury": "USA", "Mini": "Europe", "Mitsubishi": "Japan", "Nissan": "Japan", "Oldsmobile": "USA", "Peugeot": "Europe", "Pontiac": "USA","Porsche": "Europe",
    "Saab": "Europe", "Saturn": "USA", "Subaru": "Japan", "Suzuki": "Japan", "Toyota": "Japan", "Volkswagen": "Europe", "Volvo": "Europe"
  };

  function drawScatterplot(data) { // I wish I could use seaplot with python :))) That was painful but fun to do in d3 
    const width = 700;
    const height = 500;
    const margin = { top: 40, right: 100, bottom: 60, left: 80 };

    //Create main container with flex layout
    const container = d3.select("body")
      .append("div")
      .style("display", "flex")
      .style("gap", "20px")
      .style("align-items", "flex-start");

  //SVG goes in left side
    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Create detail view container on right side (initially hidden)
  const detailContainer = container
      .append("div")
      .attr("id", "detail-view")
      .style("display", "none")
      .style("flex-direction", "column")
      .style("gap", "20px");

    //Scales
    const x = d3.scaleLinear()
      .domain([0,500]) //([0, d3.max(data, d => d["Horsepower(HP)"])]) Set normal scale x
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 50]) //([0, d3.max(data, d => d["City Miles Per Gallon"])]) And y
      .range([height, 0]);

    //Colors and shapes
    const color = d3.scaleOrdinal()
    .domain(["USA", "Europe", "Japan", "Korea", "Other"])
    .range(["#ff6666", "#66a3ff", "#ffcc00", "#66cc99", "#cccccc"]);

    const shape = d3.scaleOrdinal()
    .domain(["USA", "Europe", "Japan", "Korea", "Other"])
    .range([d3.symbolTriangle, d3.symbolCircle, d3.symbolSquare, d3.symbolStar, d3.symbolDiamond]);

    //Draw scatterplot
    svg.selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "data-point")// Added class for data points
      .attr("d", d => d3.symbol().type(shape(d["Origin"])).size(80)())  
      .attr("transform", d => `translate(${x(d["Horsepower(HP)"])}, ${y(d["City Miles Per Gallon"])})`)
      .attr("fill", d => color(d["Origin"]))
      .attr("opacity", 0.8)
      .attr("stroke", "#333")
      .style("cursor", "pointer")
      .on("click", function(d) { //Adding clickable events to data points
        svg.selectAll(".data-point")
        .attr("stroke", "#333")
        .attr("stroke-width", 1);
      
      //Highlighting selected point
      d3.select(this)
        .attr("stroke", "#000")
        .attr("stroke-width", 2);
      
      //Update detail view
      updateDetailView(d, detailContainer);
    });

    //Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    //Axes labels
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Horsepower");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .text("Miles_per_Gallon");

  // Legend
  const legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${width + 20},${i * 25})`);

  legend.append("path")
    .attr("d", d => d3.symbol().type(shape(d)).size(80)())
    .attr("fill", d => color(d))
    .attr("stroke", "#333")
    .attr("opacity", 0.8);

  legend.append("text")
    .attr("x", 15)
    .attr("y", 5)
    .text(d => d)
    .style("font-size", "12px");
  }

  function updateDetailView(car, container) {
  //Show the container
  container.style("display", "flex");
  
  //Clear previous content
  container.html("");

  //First, let's see what keys are available (debugging)
  console.log("Car data keys:", Object.keys(car));
  console.log("Car data:", car);

  //Creating table
  const table = container
    .append("table")
    .style("border-collapse", "collapse")
    .style("font-family", "Arial, sans-serif")
    .style("margin-bottom", "20px");

  //Exact column names from CSV
  const attributes = [
    { key: "Name", label: "Name" },
    { key: "Type", label: "Type" },
    { key: "AWD", label: "AWD" },
    { key: "RWD", label: "RWD" },
    { key: "Retail Price", label: "Retail Price" },
    { key: "Dealer Cost", label: "Dealer Cost" },
    { key: "Engine Size (l)", label: "Engine Size" }
  ];

  //Adding rows
  attributes.forEach(attr => {
    const row = table.append("tr");
    
    row.append("td")
      .text(attr.label)
      .style("padding", "8px")
      .style("background-color", "#e3f2fd")
      .style("font-weight", "bold")
      .style("border", "1px solid #ddd")
      .style("white-space", "nowrap");
    
    row.append("td")
      .text(car[attr.key] !== undefined ? car[attr.key] : "N/A")
      .style("padding", "8px")
      .style("border", "1px solid #ddd");
  });

  drawStarPlot(container, car); 
}

//Drawing STAR PLOT
function drawStarPlot(container, car) {
  const size = 300;
  const margin = 40;
  const radius = (size - 2 * margin) / 2;

  const starSvg = container.append("svg")
    .attr("width", size)
    .attr("height", size)
    .append("g")
    .attr("transform", `translate(${size / 2}, ${size / 2})`);

  //Define attributes for star plot
  const starData = [
    { label: "MSRP", value: Math.min(+car["Retail Price"] / 100000, 1) },
    { label: "Dealer Cost", value: Math.min(+car["Dealer Cost"] / 100000, 1) },
    { label: "Engine Size", value: Math.min(+car["Engine Size (l)"] / 8, 1) },
    { label: "Horsepower", value: Math.min(+car["Horsepower(HP)"] / 500, 1) },
    { label: "City MPG", value: Math.min(+car["City Miles Per Gallon"] / 50, 1) },
    { label: "Cylinders", value: Math.min(+car["Cyl"] / 12, 1) }
  ];

  const angleSlice = (Math.PI * 2) / starData.length;

  //Draw background circles
  [0.25, 0.5, 0.75, 1].forEach(level => {
    starSvg.append("circle")
      .attr("r", radius * level)
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);
  });

  //Draw axes
  starData.forEach((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    starSvg.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);

    //Add labels
    starSvg.append("text")
      .attr("x", x * 1.15)
      .attr("y", y * 1.15)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "11px")
      .text(d.label);
  });

  //Draw data polygon
  const points = starData.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const value = d.value || 0; 
    return [
      radius * value * Math.cos(angle),
      radius * value * Math.sin(angle)
    ];
  });

  //Draw the filled area
  starSvg.append("polygon")
    .attr("points", points.map(p => p.join(",")).join(" "))
    .attr("fill", "#ff9800")  // Orange fill
    .attr("fill-opacity", 0.6)
    .attr("stroke", "#ff6600")
    .attr("stroke-width", 3);

  //Draw dots at each data point
  starData.forEach((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const value = d.value || 0;
    const x = radius * value * Math.cos(angle);
    const y = radius * value * Math.sin(angle);

    starSvg.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 4)
      .attr("fill", "#ff6600")
      .attr("stroke", "white")
      .attr("stroke-width", 2);
  });

  //Title
  starSvg.append("text")
    .attr("y", -radius - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Vehicle Specs");
}

  //LOADING DATASET from the assets
  d3.csv("cars.csv").then((data) => {
    data.forEach(d => {
      //getting first row data and applying Origin mapping
      const brand = d["Name"].split(" ")[0];
      d["Origin"] = brandContinent[brand] || "Other";

      d["Horsepower(HP)"] = +d["Horsepower(HP)"];
      d["City Miles Per Gallon"] = +d["City Miles Per Gallon"];
    });
    
    drawScatterplot(data);
  });

}

