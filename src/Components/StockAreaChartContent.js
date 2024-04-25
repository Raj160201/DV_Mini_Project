import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { sliderBottom } from 'd3-simple-slider';
import '../App.css';

const StockAreaChartContent = ({ stockCode, chartData, colorData, loading }) => {
    useEffect(() => {

        const renderChart = async () => {
            const margin = { top: 40, right: 68, bottom: 40, left: 10 };
            const width = 1080 - margin.left - margin.right;
            const height = 720 - margin.top - margin.bottom;

            const x = d3.scaleTime().range([0, width]);
            const y = d3.scaleLinear().range([height, 0]);

            const svg = d3.select("#chart-container")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const tooltipValues = d3.select("#chart-container")
                .append("div")
                .attr("class", "tooltip-values")
                .style("position", "absolute")
                .style("top", `${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--chart-ohlc'), 10)}px`)
                .style("left", "38px");

            const additionalDataContainer = d3.select("#chart-container")
                .append("div")
                .attr("class", "additional-data-container");

            const openValue = additionalDataContainer.append("div").attr("class", "data-item");
            const closeValue = additionalDataContainer.append("div").attr("class", "data-item");
            const lowValue = additionalDataContainer.append("div").attr("class", "data-item");
            const highValue = additionalDataContainer.append("div").attr("class", "data-item");

            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip");

            const tooltipRawDate = d3.select("body")
                .append("div")
                .attr("class", "tooltip");

            const gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "gradient")
                .attr("x1", "0%")
                .attr("x2", "0%")
                .attr("y1", "0%")
                .attr("y2", "100%")
                .attr("spreadMethod", "pad");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", colorData)
                .attr("stop-opacity", 1);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", colorData)
                .attr("stop-opacity", 0);

            // const chartData = await chartData();
            if (!chartData) return;

            x.domain(d3.extent(chartData, d => d.Date));
            y.domain([0, d3.max(chartData, d => d.Close + (0.05 * d.Close))]);

            // svg.append("g")
            //     .attr("class", "grid")
            //     .call(d3.axisLeft(y)
            //         .tickSize(-width)
            //         .tickFormat("")
            //     )
            //     .selectAll("line")
            //     .style("stroke", "#ddd")
            //     .style("stroke-opacity", 0.07);

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .style("font-size", "14px")
                .call(d3.axisBottom(x)
                    .tickValues(x.ticks(d3.timeYear.every(1)))
                    .tickFormat(d3.timeFormat("%Y")))
                .selectAll(".tick text")
                .style("stroke-opacity", 1)
            svg.selectAll(".tick text")
                .attr("fill", "#777");

            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${width},0)`)
                .style("font-size", "14px")
                .call(d3.axisRight(y)
                    .ticks(10)
                    .tickFormat(d => {
                        if (isNaN(d)) return "";
                        return `₹${d.toFixed(2)}`;
                    }))
                .selectAll(".tick text")
                .attr("fill", "#777");

            const line = d3.line()
                .x(d => x(d.Date))
                .y(d => y(d.Close));

            const area = d3.area()
                .x(d => x(d.Date))
                .y0(height)
                .y1(d => y(d.Close));

            svg.append("path")
                .datum(chartData)
                .attr("class", "area")
                .attr("d", area)
                .style("fill", "url(#gradient)")
                .style("opacity", .5);

            const path = svg.append("path")
                .datum(chartData)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", colorData)
                .attr("stroke-width", 2)
                .attr("d", line);

            const circle = svg.append("circle")
                .attr("r", 0)
                .attr("fill", "white")
                .style("stroke", "white")
                .attr("opacity", 0.7)
                .style("pointer-events", "none");

            const tooltipLineX = svg.append("line")
                .attr("class", "tooltip-line")
                .attr("id", "tooltip-line-x")
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "2,2");

            const tooltipLineY = svg.append("line")
                .attr("class", "tooltip-line")
                .attr("id", "tooltip-line-y")
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "2,2");

            const listeningRect = svg.append("rect")
                .attr("width", width)
                .attr("height", height);

            listeningRect.on("mousemove", function (event) {
                chartData.sort((a, b) => a.Date - b.Date)
                const [xCoord] = d3.pointer(event, this);
                const bisectDate = d3.bisector(d => d.Date).left;
                const x0 = x.invert(xCoord);
                const i = bisectDate(chartData, x0, 1);
                if (i >= chartData.length) return;
                const d0 = chartData[i - 1 < 0 ? 0 : i - 1];
                const d1 = chartData[i];
                const d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
                const xPos = x(d.Date);
                const yPos = y(d.Close);

                circle.attr("cx", xPos).attr("cy", yPos);

                circle.transition()
                    .duration(50)
                    .attr("r", 5);

                tooltipLineX.style("display", "block").attr("x1", xPos).attr("x2", xPos).attr("y1", 0).attr("y2", height);
                tooltipLineY.style("display", "block").attr("y1", yPos).attr("y2", yPos).attr("x1", 0).attr("x2", width);

                tooltip
                    .style("display", "block")
                    .style("left", `${width + 22}px`)
                    .style("top", `${yPos + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--chart-price'), 10)}px`)
                    .html(`₹${d.Close !== undefined ? d.Close.toFixed(2) : 'N/A'}`);

                tooltipRawDate
                    .style("display", "block")
                    .style("left", `${xPos - 19}px`)
                    .style("top", `${height + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--chart-date'), 10)}px`)
                    .html(`${d.Date !== undefined ? d.Date.toISOString().slice(0, 10) : 'N/A'}`);

                tooltipValues.html('');

                tooltipValues.html(`
                        <p style="display: inline-block; margin-right: 20px; color: ${d.Open > d.Close ? 'red' : 'green'};">Open: ₹${d.Open !== undefined ? d.Open.toFixed(2) : 'N/A'}</p>
                        <p style="display: inline-block; margin-right: 20px; color: ${d.Open > d.Close ? 'red' : 'green'};">High: ₹${d.High !== undefined ? d.High.toFixed(2) : 'N/A'}</p>
                        <p style="display: inline-block; margin-right: 20px; color: ${d.Open > d.Close ? 'red' : 'green'};">Low: ₹${d.Low !== undefined ? d.Low.toFixed(2) : 'N/A'}</p>
                        <p style="display: inline-block; color: ${d.Open > d.Close ? 'red' : 'green'};">Close: ₹${d.Close !== undefined ? d.Close.toFixed(2) : 'N/A'}</p>
                    `);
            });

            listeningRect.on("mouseleave", function () {
                circle.transition().duration(50).attr("r", 0);
                tooltip.style("display", "none");
                tooltipRawDate.style("display", "none");
                tooltipLineX.attr("x1", 0).attr("x2", 0);
                tooltipLineY.attr("y1", 0).attr("y2", 0);
                tooltipLineX.style("display", "none");
                tooltipLineY.style("display", "none");
                tooltipValues.html('');
            });

            const sliderRange = sliderBottom()
                .min(d3.min(chartData, d => d.Date))
                .max(d3.max(chartData, d => d.Date))
                .width(300)
                .tickFormat(d3.timeFormat('%Y-%m-%d'))
                .ticks(3)
                .default([d3.min(chartData, d => d.Date), d3.max(chartData, d => d.Date)])
                .fill('#85bb65');

            sliderRange.on('onchange', val => {
                const filteredData = chartData.filter(d => d.Date >= val[0] && d.Date <= val[1]);
                x.domain(d3.extent(filteredData, d => d.Date));
                y.domain([d3.min(filteredData, d => d.Low - (0.05 * d.Low)), d3.max(filteredData, d => d.High + (0.05 * d.High))]);

                svg.select(".line").attr("d", line(filteredData));
                svg.select(".area").attr("d", area(filteredData));

                svg.select(".x-axis")
                    .transition()
                    .duration(300)
                    .call(d3.axisBottom(x)
                        .tickValues(x.ticks(d3.timeYear.every(1)))
                        .tickFormat(d3.timeFormat("%Y")));

                svg.select(".y-axis")
                    .transition()
                    .duration(300)
                    .call(d3.axisRight(y)
                        .ticks(10)
                        .tickFormat(d => {
                            if (d <= 0) return "";
                            return `₹${d.toFixed(2)}`;
                        }));
            });

            const gRange = d3
                .select('#slider-range')
                .append('svg')
                .attr('width', 500)
                .attr('height', 70)
                .append('g')
                .style("fill", "#ccc")
                .attr('transform', 'translate(90,30)');

            gRange.call(sliderRange);

            svg.append("text")
                .attr("class", "source-credit")
                .attr("x", width - 100)
                .attr("y", height + margin.bottom - 0)
                .style("font-size", "12")
                .style("fill", "#ccc")
                .style("font-family", "sans-serif")
                .text("Source: Upstox API");
        };

        renderChart();

        return () => {
            d3.select("#chart-container").select("svg").remove();
            d3.select("#slider-range").select("svg").remove();
            d3.select("#slider-range").select("svg").remove();
        };
    }, [stockCode, chartData]);
    return (
        <>
            <div id="chart-container"></div>
            <div id="slider-range"></div>
        </>
    );
};

export default StockAreaChartContent;
