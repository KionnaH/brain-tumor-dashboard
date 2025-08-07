d3.csv("BrainTumor_Cleaned.csv").then(function (data) {
    // Parsing data
    data.forEach(d => {
        d.Age = +d.Age;
        d["Survival Time (months)"] = +d["Survival Time (months)"];
        d.Gender = +d.Gender;
    });

    const svgWidth = 700;
    const svgHeight = 500;
    const margin = { top: 60, right: 30, bottom: 80, left: 100 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    // Append SVG containers for all charts
    const charts = {
        tumorTypeAvg: d3.select("#tumor-type-avg").append("svg").attr("width", svgWidth).attr("height", svgHeight),
        tumorGradeAvg: d3.select("#tumor-grade-avg").append("svg").attr("width", svgWidth).attr("height", svgHeight),
        ageSurvival: d3.select("#age-survival").append("svg").attr("width", svgWidth).attr("height", svgHeight),
        tumorLocation: d3.select("#tumor-location").append("svg").attr("width", svgWidth).attr("height", svgHeight),
        treatmentOutcome: d3.select("#treatment-outcome").append("svg").attr("width", svgWidth).attr("height", svgHeight),
        tumorTypeDistribution: d3.select("#tumor-type-distribution").append("svg").attr("width", svgWidth).attr("height", svgHeight)
    };

    // Helper function: Create bar charts with axis labels
    function createBarChart(data, key, value, chart, xLabel, yLabel) {
        chart.selectAll("*").remove();
        const counts = d3.rollup(data, v => value ? d3.mean(v, d => d[value]) : v.length, d => d[key]);
        const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

        const xScale = d3.scaleLinear().domain([0, d3.max(sorted, d => d[1])]).range([0, width]);
        const yScale = d3.scaleBand().domain(sorted.map(d => d[0])).range([0, height]).padding(0.1);

        const g = chart.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        g.selectAll("rect")
            .data(sorted)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", d => yScale(d[0]))
            .attr("width", d => xScale(d[1]))
            .attr("height", yScale.bandwidth())
            .attr("fill", "steelblue")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "orange");
                tooltip.style("visibility", "visible").html(`${key}: ${d[0]}<br>Value: ${d[1].toFixed(2)}`);
            })
            .on("mousemove", event => tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
            .on("mouseout", function () {
                d3.select(this).attr("fill", "steelblue");
                tooltip.style("visibility", "hidden");
            });

        g.append("g").call(d3.axisLeft(yScale));
        g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));

        // Add axis labels
        chart.append("text")
            .attr("x", margin.left + width / 2)
            .attr("y", svgHeight - 10)
            .attr("text-anchor", "middle")
            .text(xLabel);

        chart.append("text")
            .attr("transform", `rotate(-90)`)
            .attr("x", -svgHeight / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text(yLabel);
    }

    // Helper function: Create scatter plot with axis labels
    function createScatterPlot(data, xField, yField, chart) {
        chart.selectAll("*").remove();
        const xScale = d3.scaleLinear().domain([0, d3.max(data, d => d[xField])]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d[yField])]).range([height, 0]);

        const g = chart.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        g.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => xScale(d[xField]))
            .attr("cy", d => yScale(d[yField]))
            .attr("r", 5)
            .attr("fill", "steelblue")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "orange").attr("r", 8);
                tooltip.style("visibility", "visible").html(`${xField}: ${d[xField]}<br>${yField}: ${d[yField]}`);
            })
            .on("mousemove", event => tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
            .on("mouseout", function () {
                d3.select(this).attr("fill", "steelblue").attr("r", 5);
                tooltip.style("visibility", "hidden");
            });

        g.append("g").call(d3.axisLeft(yScale));
        g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));

        // Add axis labels
        chart.append("text")
            .attr("x", margin.left + width / 2)
            .attr("y", svgHeight - 10)
            .attr("text-anchor", "middle")
            .text(xField);

        chart.append("text")
            .attr("transform", `rotate(-90)`)
            .attr("x", -svgHeight / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text(yField);
    }

    // Helper function: Create pie chart
    function createPieChart(data, key, chart) {
        chart.selectAll("*").remove();
        const counts = d3.rollup(data, v => v.length, d => d[key]);
        const total = d3.sum(Array.from(counts.values()));
        const pieData = Array.from(counts.entries()).map(d => [d[0], (d[1] / total * 100).toFixed(2), d[1]]); // Include count for tooltip
    
        const radius = Math.min(width, height) / 2;
        const color = d3.scaleOrdinal(d3.schemeCategory10);
    
        const pie = d3.pie().value(d => d[1]);
        const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
        const labelArc = d3.arc().outerRadius(radius + 20).innerRadius(radius + 20); // Position labels outside the pie
    
        const g = chart.append("g").attr("transform", `translate(${svgWidth / 2},${svgHeight / 2})`);
    
        const arcs = g.selectAll("arc")
            .data(pie(pieData))
            .enter().append("g");
    
        // Draw pie chart slices
        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data[0]))
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "orange");
                tooltip.style("visibility", "visible")
                    .html(`${key}: ${d.data[0]}<br>Count: ${d.data[2]}<br>Percentage: ${d.data[1]}%`);
            })
            .on("mousemove", event => tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`))
            .on("mouseout", function () {
                d3.select(this).attr("fill", d => color(d.data[0]));
                tooltip.style("visibility", "hidden");
            });
    
        // Add percentage and category name as labels
        arcs.append("text")
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("text-anchor", d => (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start") // Adjust alignment
            .style("font-size", "12px")
            .style("fill", "black")
            .text(d => `${d.data[0]} (${d.data[1]}%)`);
    
        // Add connector lines for labels
        arcs.append("polyline")
            .attr("points", d => {
                const posA = arc.centroid(d); // Starting point at slice
                const posB = labelArc.centroid(d); // End point at label
                const posC = [posB[0] + (posB[0] > 0 ? 10 : -10), posB[1]]; // Adjust label position horizontally
                return [posA, posB, posC];
            })
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", "1px");
    }      

    // Update charts based on gender filter
    function updateCharts(selectedGender) {
        const filteredData = selectedGender === "all" ? data : data.filter(d => d.Gender === +selectedGender);

        createBarChart(filteredData, "Tumor Type", "Survival Time (months)", charts.tumorTypeAvg, "Avg Survival Time (months)", "Tumor Type");
        createBarChart(filteredData, "Tumor Grade", "Survival Time (months)", charts.tumorGradeAvg, "Avg Survival Time (months)", "Tumor Grade");
        createScatterPlot(filteredData, "Age", "Survival Time (months)", charts.ageSurvival);
        createBarChart(filteredData, "Tumor Location", null, charts.tumorLocation, "Frequency", "Tumor Location");
        createBarChart(filteredData, "Tumor Type", null, charts.tumorTypeDistribution, "Frequency", "Tumor Type");
        createPieChart(filteredData, "Treatment Outcome", charts.treatmentOutcome);
    }

    // Initial rendering
    updateCharts("all");

    // Event listener for gender filter
    d3.select("#gender-filter").on("change", function () {
        updateCharts(this.value);
    });
});

