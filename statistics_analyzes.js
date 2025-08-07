d3.csv("BrainTumor_Cleaned.csv").then(function (data) {
    // Data Parsing
    data.forEach(d => {
        d.Age = +d.Age;
        d["Survival Time (months)"] = +d["Survival Time (months)"];
    });

    const svgWidth = 700;
    const svgHeight = 500;
    const margin = { top: 60, right: 30, bottom: 80, left: 100 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Function to create bar charts
    function createBarChart(data, key, chartID, xLabel, yLabel) {
        const chart = d3.select(chartID).select("svg");
        chart.selectAll("*").remove();

        const counts = d3.rollup(data, v => v.length, d => d[key]);
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
            .attr("fill", "steelblue");

        g.append("g").call(d3.axisLeft(yScale));
        g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));

        // Add axis labels
        chart.append("text")
            .attr("x", margin.left + width / 2)
            .attr("y", svgHeight - 10)
            .attr("text-anchor", "middle")
            .text(xLabel);

        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -svgHeight / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text(yLabel);
    }

    // Function to create scatter plots
    function createScatterPlot(data, xKey, yKey, chartID, xLabel, yLabel) {
        const chart = d3.select(chartID).select("svg");
        chart.selectAll("*").remove();

        const xScale = d3.scaleLinear().domain([0, d3.max(data, d => d[xKey])]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d[yKey])]).range([height, 0]);

        const g = chart.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        g.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => xScale(d[xKey]))
            .attr("cy", d => yScale(d[yKey]))
            .attr("r", 5)
            .attr("fill", "steelblue");

        g.append("g").call(d3.axisLeft(yScale));
        g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));

        // Add axis labels
        chart.append("text")
            .attr("x", margin.left + width / 2)
            .attr("y", svgHeight - 10)
            .attr("text-anchor", "middle")
            .text(xLabel);

        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -svgHeight / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text(yLabel);
    }

    // Generate graphs
    createBarChart(data, "Tumor Type", "#tumor-type-survival", "Tumor Type", "Count");
    createBarChart(data, "Age", "#age-distribution", "Age", "Count");
    createScatterPlot(data, "Age", "Treatment Outcome", "#age-treatment-outcome", "Age", "Treatment Outcome");
    createScatterPlot(data, "Age", "Survival Time (months)", "#age-survival-time", "Age", "Survival Time (months)");
    createBarChart(data, "Tumor Type", "#age-tumor-type", "Tumor Type", "Age");
});
