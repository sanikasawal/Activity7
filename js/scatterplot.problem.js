
function scatter_plot(data,
    ax,
    title="",
    xCol="",
    yCol="",
    rCol="",
    legend=[],
    colorCol="",
    margin = 50)
{
    const X = data.map(d => d[xCol]);
    const Y = data.map(d => d[yCol]);
    const R = data.map(d => d[rCol]);
    const colorCategories = [...new Set(data.map(d => d[colorCol]))]; // unique values for the categorical data
    const color = d3.scaleOrdinal()
        .domain(colorCategories)
        .range(d3.schemeTableau10); // color scheme of tableau10

    const xExtent = d3.extent(X, d => +d);
    const yExtent = d3.extent(Y, d => +d);

    const xMargin = (xExtent[1] - xExtent[0]) * 0.05; // 5% margin
    const yMargin = (yExtent[1] - yExtent[0]) * 0.05; // 5% margin

    const xScale = d3.scaleLinear()
        .domain([xExtent[0] - xMargin, xExtent[1] + xMargin])
        .range([margin, 1000 - margin]);

    const yScale = d3.scaleLinear()
        .domain([yExtent[0] - yMargin, yExtent[1] + yMargin])
        .range([1000 - margin, margin]);

    const rScale = d3.scaleSqrt().domain(d3.extent(R, d => +d))
        .range([4, 12]);

    const svg = d3.select(`${ax}`);

    svg.selectAll('.markers')
        .data(data)
        .join('g')
        .attr('transform', d => `translate(${xScale(d[xCol])}, ${yScale(d[yCol])})`)
        .append('circle')
        .attr("class", (d, i) => `cls_${i} ${d[colorCol]}`)
        .attr("id", (d, i) => `id_${i}`)
        .attr("r", d => rScale(d[rCol]))
        .attr("fill", d => color(d[colorCol]));

    // x and y Axis function
    const x_axis = d3.axisBottom(xScale).ticks(4);
    const y_axis = d3.axisLeft(yScale).ticks(4);

    // X Axis
    svg.append("g").attr("class", "axis")
        .attr("transform", `translate(${0}, ${1000 - margin})`)
        .call(x_axis);

    // Y Axis
    svg.append("g").attr("class", "axis")
        .attr("transform", `translate(${margin}, ${0})`)
        .call(y_axis);

    // Labels
    svg.append("g").attr("class", "label")
        .attr("transform", `translate(${500}, ${1000 - 10})`)
        .append("text")
        .attr("class", "label")
        .text(xCol)
        .attr("fill", "black");

    svg.append("g")
        .attr("transform", `translate(${35}, ${500}) rotate(270)`)
        .append("text")
        .attr("class", "label")
        .text(yCol)
        .attr("fill", "black");

    // Title
    svg.append('text')
        .attr('x', 500)
        .attr('y', 80)
        .attr("text-anchor", "middle")
        .text(title)
        .attr("class", "title")
        .attr("fill", "black");

    // Declare brush
    const brush = d3.brush()
        .on("start", brushStart)
        .on("brush end", brushed)
        .extent([
            [margin, margin],
            [1000 - margin, 1000 - margin]
        ]);

    svg.call(brush);

    function brushStart() {
        d3.selectAll(".selected").classed("selected", false); // Clear previous selections
        d3.select("#selected-list").selectAll("li").remove(); // Clear the list
    }

    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        // Highlight selected points
        d3.selectAll("circle").classed("selected", d => {
            const cx = xScale(d[xCol]);
            const cy = yScale(d[yCol]);
            return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });

        // Filter selected data
        const selectedData = data.filter(d => {
        const cx = xScale(d[xCol]);
        const cy = yScale(d[yCol]);
        return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });

        updateList(selectedData);
    }

    // Update List Function
    function updateList(selectedData) {
        const listContainer = d3.select("#selected-list");
        listContainer.selectAll("li").remove(); // Clear previous list

        listContainer.selectAll("li")
            .data(selectedData)
            .enter()
            .append("li")
            .attr("class", "listVals")
            .text(d => `Model: ${d.Model}, MPG: ${d.MPG}, Price: ${d.Price}`);
    }

    const legendContainer = svg
        .append("g")
        .attr("transform", `translate(${800}, ${margin})`)
        .attr("class", "marginContainer");

    if (legend.length === 0) {
        legend = colorCategories;
    }

    const legends_items = legendContainer.selectAll("legends")
        .data(legend)
        .join("g")
        .attr("transform", (d, i) => `translate(${0}, ${i * 45})`);

    legends_items.append("rect")
        .attr("fill", d => color(d))
        .attr("width", "40")
        .attr("height", "40")
        .attr("class", d => d);

    legends_items.append("text")
        .text(d => d)
        .attr("dx", 45)
        .attr("dy", 25)
        .attr("class", "legend")
        .attr("fill", "black");

    legends_items
    .on("click", (event, d) => {
        const isHidden = d3.select(event.target).classed("hidden");
        if (isHidden) {
            // Show points
            d3.selectAll(`circle.${d}`).style("opacity", 1);
            d3.select(event.target).classed("hidden", false);
        } else {
        // Hide points
        d3.selectAll(`circle.${d}`).style("opacity", 0.1); // Reduce opacity to hide
        d3.select(event.target).classed("hidden", true);
        }
    });
}
