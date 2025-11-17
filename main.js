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

// Function to display data point details in a table
function showDetails(data) {
  // Remove existing table if any
  d3.select("#details-table").remove();

  // Create table container
  const table = d3.select("body")
    .append("div")
    .attr("id", "details-table")
    .style("margin", "20px 80px")
    .style("font-family", "monospace")
    .style("border", "1px solid #333")
    .style("display", "inline-block")
    .style("background", "white");

  // Table title
  table.append("div")
    .style("padding", "10px")
    .style("background", "#f0f0f0")
    .style("font-weight", "bold")
    .style("border-bottom", "1px solid #333")
    .text("Selected Data Point Details");

  // Create rows for each field
  const fields = [
    { label: "Name", value: data.name },
    { label: "Type", value: data.type },
    { label: "AWD", value: data.awd },
    { label: "RWD", value: data.rwd },
    { label: "Retail Price", value: data.retailPrice },
    { label: "Dealer Cost", value: data.dealerCost },
    { label: "Engine Size", value: data.engineSize },
    { label: "Cylinders", value: data.cylinders },
    { label: "Horsepower", value: data.horsepower },
    { label: "City MPG", value: data.cityMPG },
    { label: "Highway MPG", value: data.highwayMPG },
    { label: "Weight", value: data.weight },
    { label: "Wheel Base", value: data.wheelBase },
    { label: "Length", value: data.length },
    { label: "Width", value: data.width }
  ];

  fields.forEach(field => {
    const row = table.append("div")
      .style("display", "flex")
      .style("border-bottom", "1px solid #ddd");

    row.append("div")
      .style("padding", "8px 12px")
      .style("width", "150px")
      .style("background", "#f8f8f8")
      .style("font-weight", "bold")
      .text(field.label);

    row.append("div")
      .style("padding", "8px 12px")
      .style("flex", "1")
      .text(field.value !== undefined ? field.value : "N/A");
  });
}

// Draw scatter plot: Retail Price (x) vs Weight (y)
function drawScatterplot(data) {
  // Configuration: border and axis line width
  const borderWidth = 3.5;
  // Configuration: axis tick font size
  const axisFontSize = "15px";
  // Configuration: axis title and legend font size
  const titleFontSize = "16px";

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
  const xAxis = svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).tickSizeInner(-5).tickSizeOuter(0).tickPadding(10).tickFormat(d => `${d/1000}K`))
    .style("font-family", "monospace");
  
  xAxis.select(".domain").attr("stroke-width", borderWidth);
  xAxis.selectAll(".tick line").attr("stroke-width", borderWidth);
  xAxis.selectAll(".tick text")
    .style("font-size", axisFontSize)
    .style("font-weight", "bold");
  
  xAxis.append("text")
    .attr("x", width / 2)
    .attr("y", 45)
    .attr("fill", "black")
    .style("font-size", titleFontSize)
    .style("font-family", "monospace")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .text("Retail Price ($)");

  // Y axis
  const yAxis = svg.append("g")
    .call(d3.axisLeft(yScale).tickSizeInner(-5).tickSizeOuter(0).tickPadding(10))
    .style("font-family", "monospace");
  
  yAxis.select(".domain").attr("stroke-width", borderWidth);
  yAxis.selectAll(".tick line").attr("stroke-width", borderWidth);
  yAxis.selectAll(".tick text")
    .style("font-size", axisFontSize)
    .style("font-weight", "bold");
  
  yAxis.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -55)
    .attr("fill", "black")
    .style("font-size", titleFontSize)
    .style("font-family", "monospace")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .text("Weight (lbs)");

  // Add top border
  svg.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", width)
    .attr("y2", 0)
    .attr("stroke", "black")
    .attr("stroke-width", borderWidth);

  // Add right border
  svg.append("line")
    .attr("x1", width)
    .attr("y1", 0)
    .attr("x2", width)
    .attr("y2", height)
    .attr("stroke", "black")
    .attr("stroke-width", borderWidth);

  // Zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", zoomed);

  // Create a clipping path to restrict data points to the plot area
  svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(zoom);

  function zoomed() {
    const transform = d3.event.transform;
    
    // Update scales with zoom transform
    const newXScale = transform.rescaleX(xScale);
    const newYScale = transform.rescaleY(yScale);

    // Update axes
    xAxis.call(d3.axisBottom(newXScale).tickSizeInner(-5).tickSizeOuter(0).tickPadding(10).tickFormat(d => `${d/1000}K`));
    xAxis.select(".domain").attr("stroke-width", borderWidth);
    xAxis.selectAll(".tick line").attr("stroke-width", borderWidth);
    xAxis.selectAll(".tick text")
      .style("font-size", axisFontSize)
      .style("font-weight", "bold");

    yAxis.call(d3.axisLeft(newYScale).tickSizeInner(-5).tickSizeOuter(0).tickPadding(10));
    yAxis.select(".domain").attr("stroke-width", borderWidth);
    yAxis.selectAll(".tick line").attr("stroke-width", borderWidth);
    yAxis.selectAll(".tick text")
      .style("font-size", axisFontSize)
      .style("font-weight", "bold");

    // Update data points positions
    svg.selectAll("path.datapoint")
      .attr("transform", d => `translate(${newXScale(d.retailPrice)}, ${newYScale(d.weight)})`);
  }

  // Shape mapping function
  const getShape = (type) => {
    const shapeMap = {
      'Sedan': 'circle',
      'SUV': 'square',
      'Sports': 'star',
      'Wagon': 'hexagon',
      'Minivan': 'triangle_down'
    };
    return shapeMap[type] || 'circle';
  };

  // Symbol generator for d3
  const symbolGenerator = d3.symbol().size(60);
  const symbolGeneratorLarge = d3.symbol().size(120);

  // Create a group for data points with clipping
  const dataGroup = svg.append("g")
    .attr("clip-path", "url(#clip)");

  // Draw shapes based on type
  dataGroup.selectAll("path.datapoint")
    .data(cleanData)
    .enter()
    .append("path")
    .attr("class", "datapoint")
    .attr("transform", d => `translate(${xScale(d.retailPrice)}, ${yScale(d.weight)})`)
    .attr("d", d => {
      const shapeType = getShape(d.type);
      if (shapeType === 'circle') {
        symbolGenerator.type(d3.symbolCircle);
      } else if (shapeType === 'square') {
        symbolGenerator.type(d3.symbolSquare);
      } else if (shapeType === 'star') {
        symbolGenerator.type(d3.symbolStar);
      } else if (shapeType === 'hexagon') {
        symbolGenerator.type(d3.symbolDiamond);
      } else if (shapeType === 'triangle_down') {
        symbolGenerator.type(d3.symbolTriangle);
      }
      return symbolGenerator();
    })
    .attr("fill", "none")
    .attr("stroke", d => getColor(d))
    .attr("stroke-width", 3.5)
    .attr("stroke-opacity", 0.8)
    .style("cursor", "pointer")
    .style("pointer-events", "all")
    .on("click", function(d) {
      // Remove previous selection highlight - reset all points
      svg.selectAll("path.datapoint")
        .attr("stroke-width", 3.5)
        .attr("stroke", d => getColor(d))
        .attr("stroke-opacity", 0.8)
        .attr("d", d => {
          const shapeType = getShape(d.type);
          if (shapeType === 'circle') {
            symbolGenerator.type(d3.symbolCircle);
          } else if (shapeType === 'square') {
            symbolGenerator.type(d3.symbolSquare);
          } else if (shapeType === 'star') {
            symbolGenerator.type(d3.symbolStar);
          } else if (shapeType === 'hexagon') {
            symbolGenerator.type(d3.symbolDiamond);
          } else if (shapeType === 'triangle_down') {
            symbolGenerator.type(d3.symbolTriangle);
          }
          return symbolGenerator();
        });
      
      // Highlight selected point - thick black border and larger size
      const shapeType = getShape(d.type);
      if (shapeType === 'circle') {
        symbolGeneratorLarge.type(d3.symbolCircle);
      } else if (shapeType === 'square') {
        symbolGeneratorLarge.type(d3.symbolSquare);
      } else if (shapeType === 'star') {
        symbolGeneratorLarge.type(d3.symbolStar);
      } else if (shapeType === 'hexagon') {
        symbolGeneratorLarge.type(d3.symbolDiamond);
      } else if (shapeType === 'triangle_down') {
        symbolGeneratorLarge.type(d3.symbolTriangle);
      }
      
      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 5)
        .attr("stroke-opacity", 1)
        .attr("d", symbolGeneratorLarge());
      
      // Show details
      showDetails(d);
    });

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
    .style("font-size", titleFontSize)
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

  // Shape legend
  const shapeLegendY = outlierY + 50;
  const shapeTypes = [
    { type: 'Sedan', shape: d3.symbolCircle, label: 'Sedan' },
    { type: 'SUV', shape: d3.symbolSquare, label: 'SUV' },
    { type: 'Sports', shape: d3.symbolStar, label: 'Sports' },
    { type: 'Wagon', shape: d3.symbolDiamond, label: 'Wagon' },
    { type: 'Minivan', shape: d3.symbolTriangle, label: 'Minivan' }
  ];

  svg.append("text")
    .attr("x", legendX + legendWidth / 2)
    .attr("y", shapeLegendY - 10)
    .attr("text-anchor", "middle")
    .style("font-size", titleFontSize)
    .style("font-family", "monospace")
    .style("font-weight", "bold")
    .text("Type");

  const shapeSymbol = d3.symbol().size(80);

  shapeTypes.forEach((item, i) => {
    const y = shapeLegendY + i * 25;
    
    svg.append("path")
      .attr("transform", `translate(${legendX + legendWidth / 2}, ${y})`)
      .attr("d", shapeSymbol.type(item.shape))
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    svg.append("text")
      .attr("x", legendX + legendWidth + 10)
      .attr("y", y + 4)
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .text(item.label);
  });
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
