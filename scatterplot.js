function drawScatterplot(data) {

    // Set dimensions and margins
    const margin = { top: 50, right: 40, bottom: 60, left: 70 },
        width = 1400 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    // Remove old SVG container if exists
    d3.select("#scatterplot").select("svg").remove();

    // Create SVG container
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const dataPoints = data.filter(d => d.Retail_Price != null && d.City_Miles != null);

    const maxPrice = d3.max(dataPoints, d => d.Retail_Price);
    const maxPriceRounded = Math.ceil(maxPrice / 20000) * 20000;

    console.log("Max Price:", maxPrice, "Rounded:", maxPriceRounded);

    const maxCity = d3.max(dataPoints, d => d.City_Miles);
    const maxCityRounded = Math.ceil(maxCity / 10) * 10;

    console.log("Max City Miles:", maxCity, "Rounded:", maxCityRounded);

    const minEngineSize = d3.min(dataPoints, d => d.Engine_Size);
    const maxEngineSize = d3.max(dataPoints, d => d.Engine_Size);

    console.log("Engine Size - Min:", minEngineSize, "Max:", maxEngineSize);

    // X axis: Retail Price (0 to max rounded to 10k)
    const x_axis = d3.scaleLinear()
        .domain([0, maxPriceRounded])
        .range([0, width]);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x_axis).ticks(10).tickFormat(d3.format(".2s")));

    // Y axis: City Miles (0 to max rounded to 10)
    const y_axis = d3.scaleLinear()
        .domain([0, maxCityRounded])
        .range([height, 0]);
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y_axis).ticks(10));

    // Size scale for Engine Size (liters)
    const sizeScale = d3.scaleSqrt()
        .domain(d3.extent(dataPoints, d => d.Engine_Size))
        .range([minEngineSize, maxEngineSize].map(d => d * 2));

    const types = Array.from(new Set(dataPoints.map(d => d.Type).filter(Boolean)));
    const colorScale = d3.scaleOrdinal()
        .domain(types)
        .range(d3.schemeCategory10);

    // Labels
    svg.append("text")
        .attr("class", "x axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Retail Price (USD)");

    svg.append("text")
        .attr("class", "y axis-label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text("City Miles Per Gallon (MPG)");

    // Clip path
    const clip = svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    const scatter = svg.append("g")
        .attr("clip-path", "url(#clip)");

    scatter.selectAll("circle")
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("cx", d => x_axis(d.Retail_Price))
        .attr("cy", d => y_axis(d.City_Miles))
        .attr("r", d => sizeScale(d.Engine_Size))
        .attr("fill", d => colorScale(d.Type))
        .attr("fill-opacity", 0.5)
        .attr("stroke", "black")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 1);


    const zoom = d3.zoom()
        .scaleExtent([0.5, 50])
        .extent([[0, 0], [width, height]])
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", updateChart);
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

    function updateChart() {
        const newX = d3.event.transform.rescaleX(x_axis);
        const newY = d3.event.transform.rescaleY(y_axis);

        x_axis.call(d3.axisBottom(newX).ticks(10).tickFormat(d3.format(".2s")));
        y_axis.call(d3.axisLeft(newY).ticks(10));

        scatter.selectAll("circle")
            .attr("cx", d => newX(d.Retail_Price))
            .attr("cy", d => newY(d.City_Miles));
    }
}
