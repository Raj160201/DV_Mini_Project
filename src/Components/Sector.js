import React, { useEffect } from 'react';
import * as d3 from 'd3';
import '../App.css';
import data from '../Utils/data/Sector_DV.csv';
import './Style.css';

const Sector = () => {
    useEffect(() => {
        const renderChart = async () => {
            const margin = { top: 20, right: 60, bottom: 0, left: 50 };
            const svgWidth = 720;
            const svgHeight = 780;

            const totalWidth = svgWidth * 2;
            const height = svgHeight;
            const marginTop = 10;
            const marginRight = 0;
            const marginBottom = 30;
            const marginLeft = 10;
            const sectorWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sector-width'));

            let xRange = [70, sectorWidth - 10 * margin.right];

            const svg = d3.select("#sector-container")
                .append("svg")
                .attr("width", totalWidth)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const tooltip = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("background", "rgba(255, 255, 255, 0.9)")
                .style("color", "black")
                .style("padding", "8px")
                .style("border-radius", "4px")
                .text("");

            d3.csv(data).then((data) => {
                let sectors = Array.from(new Set(data.map((d) => d.Sector)));
                const width = svgWidth * sectors.length;

                d3.select("svg")
                    .attr("width", totalWidth)
                    .attr("height", height);

                let xScale = d3
                    .scaleBand()
                    .domain(sectors)
                    .range(xRange);

                let yScale = d3
                    .scaleLinear()
                    .domain(d3.extent(data.map((d) => +d["Return"])))
                    .range([height - marginBottom, marginTop]);

                let color = d3.scaleOrdinal().domain(sectors).range(d3.schemePaired);

                let marketcapDomain = d3.extent(data.map((d) => +d["Market Cap"]));
                let size = d3.scaleSqrt().domain(marketcapDomain).range([3, 40]);

                // Append circles
                svg.selectAll(".circ")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", "circ")
                    .attr("stroke", "black")
                    .attr("fill", (d) => color(d.Sector))
                    .attr("r", (d) => size(d["Market Cap"]))
                    .attr("cx", (d) => xScale(d.Sector))
                    .attr("cy", (d) => yScale(d.Return))
                    .on("mouseover", (event, d) => {
                        d3.select(event.target).attr("stroke-width", 1).attr("stroke", "white");

                        tooltip.html(`
                            <div>Company: ${d.Name}</div>
                            <div>Market Cap: ₹ ${d["Market Cap"]} Cr.</div>
                            <div>1Y Return: ${d.Return}%</div>
                        `);
                        tooltip.style("visibility", "visible")
                            .style("top", (event.pageY - 10) + "px")
                            .style("left", (event.pageX + 10) + "px")
                            .style("opacity", 0.8);
                    })
                    .on("mouseout", (event) => {
                        d3.select(event.target).attr("stroke-width", 0);
                        tooltip.style("visibility", "hidden");
                    });


                // Append y axis
                svg.append("g")
                    .attr("class", "y-axis")
                    .call(d3.axisLeft(yScale))
                    .selectAll("text")
                    .attr("fill", "white");

                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(-58, 0)`)
                    .call(d3.axisTop(xScale))
                    .selectAll("text")
                    .attr("fill", "white");

                let simulation = d3.forceSimulation(data)
                    .force("x", d3.forceX((d) => xScale(d.Sector)).strength(0.2))
                    .force("y", d3.forceY((d) => yScale(d.Return)).strength(1))
                    .force("collide", d3.forceCollide((d) => size(d["Market Cap"])))
                    .alphaDecay(0)
                    .alpha(0.3)
                    .on("tick", tick);

                function tick() {
                    svg.selectAll(".circ")
                        .attr("cx", (d) => d.x)
                        .attr("cy", (d) => d.y);
                }

                let init_decay = setTimeout(() => {
                    console.log("start alpha decay");
                    simulation.alphaDecay(0.1);
                }, 3000);
            });
        };

        renderChart();

        return () => {
            d3.select("#sector-container").select("svg").remove();
        };
    }, []);

    return (
        <>
            <div class="section-title">
                <p>Sector Analysis: Annual Returns</p>
            </div>
            <div id="sector-container" style={{ overflowX: 'auto', width: '100%' }}></div>
        </>
    );
};

export default Sector;
