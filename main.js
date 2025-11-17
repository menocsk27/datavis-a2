// Simple data loader for the assignment dataset(s)
class DataLoader {
  constructor(csvPath) {
    this.csvPath = csvPath;
  }

  // Loads the CSV and returns a Promise resolving to an array of objects
  load() {
    return d3.csv(this.csvPath, this._rowConverter);
  }

  // Convert and clean a single row from the CSV file
  _rowConverter(d) {
    // Defensive parsing – some rows in cars.csv contain errors
    const toNumber = (value) => {
      const n = +value;
      return Number.isFinite(n) ? n : undefined;
    };

    return {
      name: d.Name,
      type: d.Type,
      awd: d.AWD,
      rwd: d.RWD,
      retailPrice: toNumber(d['Retail Price']),
      dealerCost: toNumber(d['Dealer Cost']),
      engineSize: toNumber(d['Engine Size (l)']),
      cylinders: toNumber(d.Cyl),
      horsepower: toNumber(d['Horsepower(HP)']),
      cityMPG: toNumber(d['City Miles Per Gallon']),
      highwayMPG: toNumber(d['Highway Miles Per Gallon']),
      weight: toNumber(d.Weight),
      wheelBase: toNumber(d['Wheel Base']),
      length: toNumber(d.Len),
      width: toNumber(d.Width)
    };
  }
}

// Draw scatter plot: Retail Price (x) vs Weight (y)
function drawScatterplot(data) {
  // Filter out rows with missing retailPrice or weight
  const cleanData = data.filter(d => d.retailPrice && d.weight);

  console.log(`Drawing scatter plot with ${cleanData.length} points`);

  // Prepare color scale based on Highway MPG
  // Separate valid values (>= 0) from invalid ones (< 0 or undefined)
  const validMPG = cleanData
    .filter(d => d.highwayMPG !== undefined && d.highwayMPG >= 0)
    .map(d => d.highwayMPG);
  
  const minMPG = d3.min(validMPG);
  const maxMPG = d3.max(validMPG);

  // Color scale: 8-level discrete scale from low to high MPG
  const colors = [
     "rgb(103,0,13)",
     //"rgb(165,15,21)",
    "rgb(203,24,29)",
    //"rgb(239,59,44)",
     "rgb(251,106,74)",
    "rgb(252,146,114)",
    "rgb(252,187,161)",
    "rgb(254,224,210)",
    "rgb(255,245,240)"
  ];
  
  const colorScale = d3.scaleQuantize()
    .domain([minMPG, maxMPG])
    .range(colors);

  // Function to get color for a data point
  const getColor = (d) => {
    if (d.highwayMPG === undefined || d.highwayMPG < 0) {
      return "gray"; // Outlier color
    }
    return colorScale(d.highwayMPG);
  };

  // Chart dimensions
  const margin = { top: 40, right: 180, bottom: 60, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(cleanData, d => d.retailPrice)])
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(cleanData, d => d.weight)])
    .range([height, 0])
    .nice();

  // X axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .style("font-family", "monospace")
    .append("text")
    .attr("x", width / 2)
    .attr("y", 45)
    .attr("fill", "black")
    .style("font-size", "14px")
    .style("font-family", "monospace")
    .style("text-anchor", "middle")
    .text("Retail Price ($)");

  // Y axis
  svg.append("g")
    .call(d3.axisLeft(yScale))
    .style("font-family", "monospace")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -55)
    .attr("fill", "black")
    .style("font-size", "14px")
    .style("font-family", "monospace")
    .style("text-anchor", "middle")
    .text("Weight (lbs)");

  // Draw circles
  svg.selectAll("circle")
    .data(cleanData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.retailPrice))
    .attr("cy", d => yScale(d.weight))
    .attr("r", 4)
    .attr("fill", "none")
    .attr("stroke", d => getColor(d))
    .attr("stroke-width", 3)
    .attr("stroke-opacity", 0.8);

  // Chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("font-family", "monospace")
    .text("Retail Price vs Weight");

  // Legend
  const legendWidth = 20;
  const legendHeight = 200;
  const legendX = width + 40;
  const legendY = 50;

  // Draw discrete color blocks for legend
  const blockHeight = legendHeight / colors.length;
  
  colors.forEach((color, i) => {
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", legendY + (colors.length - 1 - i) * blockHeight)
      .attr("width", legendWidth)
      .attr("height", blockHeight)
      .style("fill", color)
      .style("stroke", "#333")
      .style("stroke-width", 0.5);
  });

  // Legend scale - showing thresholds
  const thresholds = colorScale.thresholds();
  const legendScale = d3.scaleLinear()
    .domain([minMPG, maxMPG])
    .range([legendY + legendHeight, legendY]);

  const legendAxis = d3.axisRight(legendScale)
    .tickValues([minMPG, ...thresholds, maxMPG])
    .tickFormat(d3.format(".1f"));

  svg.append("g")
    .attr("transform", `translate(${legendX + legendWidth}, 0)`)
    .call(legendAxis)
    .style("font-family", "monospace");

  // Legend title
  svg.append("text")
    .attr("x", legendX + legendWidth / 2)
    .attr("y", legendY - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-family", "monospace")
    .style("font-weight", "bold")
    .text("Highway MPG");

  // Legend for outliers (gray)
  const outlierY = legendY + legendHeight + 30;
  svg.append("circle")
    .attr("cx", legendX + legendWidth / 2)
    .attr("cy", outlierY)
    .attr("r", 4)
    .attr("fill", "gray")
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5);

  svg.append("text")
    .attr("x", legendX + legendWidth + 10)
    .attr("y", outlierY + 4)
    .style("font-size", "11px")
    .style("font-family", "monospace")
    .text("Invalid/Outlier");
}

// Waiting until document has loaded
window.onload = () => {
  const loader = new DataLoader("cars.csv");

  loader
    .load()
    .then((data) => {
      console.log("Loaded cars data:", data);
      drawScatterplot(data);
    })
    .catch((error) => {
      console.error("Error loading cars.csv", error);
    });
};
