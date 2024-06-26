import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { sliderBottom } from 'd3-simple-slider';
import '../App.css';

const StockAreaChartContent = ({ stockCode, chartData, selectedIndicator, colorData, loading }) => {
    useEffect(() => {
        let movingAverageData, expoMovingAverageData, volWeightedAvgData;
        let movingAverageValue, expoMovingAverageValue, volWeightedAvgValue;

        function formatVolume(volume) {
            if (volume === undefined) return 'N/A';
            if (volume >= 1e6) {
                return (volume / 1e6).toFixed(3) + 'M';
            } else {
                return volume;
            }
        }

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

            const xMin = d3.min(chartData, d => {
                return d['Date'];
            });
            const xMax = d3.max(chartData, d => {
                return d['Date'];
            });

            const xScale = d3
                .scaleTime()
                .domain([xMin, xMax])
                .range([0, width]);


            const yMin = d3.min(chartData, d => {
                return d['Close'];
            });

            const yMax = d3.max(chartData, d => {
                return d['Close'];
            });

            const yScale = d3
                .scaleLinear()
                .domain([yMin - 5, yMax])
                .range([height, 0]);

            const movingAverage = (data, numberOfPricePoints) => {
                data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
                return data.map((row, index, total) => {
                    const start = Math.max(0, index - numberOfPricePoints);
                    const end = index;
                    const subset = total.slice(start, end + 1);
                    const sum = subset.reduce((a, b) => {
                        return a + b['Close'];
                    }, 0);
                    return {
                        Date: row['Date'],
                        average: sum / subset.length
                    };
                });
            };

            const movingAverageLine = d3.line()
                .x(d => x(d.Date))
                .y(d => y(d.average))
                .defined(d => d !== null)
                .curve(d3.curveBasis);

            const expoMovingAverage = (data, numberOfPricePoints) => {
                const alpha = 2 / (numberOfPricePoints + 1);
                const ema = [];
                data.sort((a, b) => new Date(a.Date) - new Date(b.Date));

                let sum = 0;
                for (let i = 0; i < Math.min(numberOfPricePoints, data.length); i++) {
                    sum += data[i].Close;
                }
                ema.push({ Date: data[Math.min(numberOfPricePoints - 1, data.length - 1)].Date, expoAverage: sum / Math.min(numberOfPricePoints, data.length) });

                for (let i = numberOfPricePoints; i < data.length; i++) {
                    if (ema[i - numberOfPricePoints] === undefined) break; // Stop loop if ema[i - numberOfPricePoints] is undefined
                    const prevEma = ema[i - numberOfPricePoints].expoAverage;
                    const currentEma = (data[i].Close - prevEma) * alpha + prevEma;
                    ema.push({ Date: data[i].Date, expoAverage: currentEma });
                }
                return ema;
            };

            const expoMovingAverageLine = d3.line()
                .x(d => x(d.Date))
                .y(d => y(d.expoAverage))
                .curve(d3.curveBasis);

            const volWeightedAvg = (data) => {
                let cumulativeTypicalPriceVolume = 0;
                let cumulativeVolume = 0;
                data.sort((a, b) => new Date(a.Date) - new Date(b.Date));

                return data.map((row, index) => {
                    const typicalPrice = (row.High + row.Low + row.Close) / 3;
                    cumulativeTypicalPriceVolume += typicalPrice * row.Volume;
                    cumulativeVolume += row.Volume;

                    let vwap = null;

                    if (cumulativeVolume !== 0) {
                        vwap = cumulativeTypicalPriceVolume / cumulativeVolume;
                    }

                    return {
                        Date: row.Date,
                        VWAP: vwap
                    };
                });
            };

            const volWeightedAvgLine = d3.line()
                .x(d => x(d.Date))
                .y(d => y(d.VWAP))
                .curve(d3.curveBasis);


            // Simple Moving Average
            if (selectedIndicator.some(indicator => indicator.indicator === 'SMA')) {
                const movingAveragePeriod = Number(selectedIndicator.find(indicator => indicator.indicator === 'SMA').period);
                const colorpath = selectedIndicator.find(indicator => indicator.indicator === 'SMA').color;
                movingAverageData = movingAverage(chartData, movingAveragePeriod);

                svg.append('path')
                    .data([movingAverageData])
                    .style('fill', 'none')
                    .attr('id', 'movingAverageLine')
                    .attr('stroke', colorpath)
                    .attr('d', movingAverageLine);
            }

            // Exponential Moving Average
            if (selectedIndicator.some(indicator => indicator.indicator === 'EMA')) {
                const expoMovingAveragePeriod = Number(selectedIndicator.find(indicator => indicator.indicator === 'EMA').period);
                const colorpath = selectedIndicator.find(indicator => indicator.indicator === 'EMA').color;
                expoMovingAverageData = expoMovingAverage(chartData, expoMovingAveragePeriod);

                svg.append('path')
                    .data([expoMovingAverageData])
                    .style('fill', 'none')
                    .attr('id', 'expoMovingAverageLine')
                    .attr('stroke', colorpath)
                    .attr('d', expoMovingAverageLine);
            }

            // Volume-Weighted Average Price
            if (selectedIndicator.some(indicator => indicator.indicator === 'VWAP')) {
                const colorpath = selectedIndicator.find(indicator => indicator.indicator === 'VWAP').color;
                volWeightedAvgData = volWeightedAvg(chartData);

                svg.append('path')
                    .data([volWeightedAvgData])
                    .style('fill', 'none')
                    .attr('id', 'volWeightedAvgLine')
                    .attr('stroke', colorpath)
                    .attr('d', volWeightedAvgLine);
            }

            // VOLUME BAR CHART

            const createVolumeBars = (svg, volData, xScale, yVolumeScale) => {
                svg
                    .selectAll('.volume-bar')
                    .data(volData)
                    .enter()
                    .append('rect')
                    .attr('class', 'volume-bar')
                    .attr('x', d => xScale(d.Date))
                    .attr('y', d => yVolumeScale(d.Volume))
                    .attr('fill', (d, i) => {
                        if (i === 0) {
                            return '#03a678';
                        } else {
                            return volData[i - 1].Close > d.Close ? '#e87f2a' : '#03a678';
                        }
                    })
                    .attr('width', 3)
                    .attr('height', d => Math.abs(yVolumeScale(d.Volume) - yVolumeScale(0)));
            };

            if (selectedIndicator.some(indicator => indicator.indicator === 'Volume')) {
                const sortedChartData = [...chartData].sort((a, b) => a.Date - b.Date);
                const volData = sortedChartData.filter(d => d['Volume'] !== null && d['Volume'] !== 0);
                const yVolumeScale = d3
                    .scaleLinear()
                    .domain([0, 7 * d3.max(volData, d => d['Volume'])])
                    .range([height, 0]);
                createVolumeBars(svg, volData, xScale, yVolumeScale);
            }
            
            // MAIN CHART COMPONENT
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
                const sortedChartData = [...chartData].sort((a, b) => a.Date - b.Date);
                const [xCoord] = d3.pointer(event, this);
                const bisectDate = d3.bisector(d => d.Date).left;
                const x0 = x.invert(xCoord);
                const i = bisectDate(sortedChartData, x0, 1);
                if (i >= sortedChartData.length) return;
                const d0 = sortedChartData[i - 1 < 0 ? 0 : i - 1];
                const d1 = sortedChartData[i];
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

                let movingAverageValue, expoMovingAverageValue, volWeightedAvgValue;

                if (selectedIndicator.some(indicator => indicator.indicator === 'SMA')) {
                    movingAverageValue = movingAverageData.find(entry => entry.Date.getTime() === d.Date.getTime());
                }
                if (selectedIndicator.some(indicator => indicator.indicator === 'EMA')) {
                    expoMovingAverageValue = expoMovingAverageData.find(entry => entry.Date.getTime() === d.Date.getTime());
                }
                if (selectedIndicator.some(indicator => indicator.indicator === 'VWAP')) {
                    volWeightedAvgValue = volWeightedAvgData.find(entry => entry.Date.getTime() === d.Date.getTime());
                }

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
                    <p style="text-align: left; margin-top: -15px; color: ${d.Open > d.Close ? 'red' : 'green'};">
                        Volume: ${formatVolume(d.Volume)}
                    </p>
                    <p style="text-align: left; margin-top: -15px; color: ${selectedIndicator.find(indicator => indicator.indicator === 'SMA')?.color || '#FFFFFF'};">
                        ${selectedIndicator.some(indicator => indicator.indicator === 'SMA') ?
                        `SMA: ₹${movingAverageValue !== undefined ? movingAverageValue.average.toFixed(2) : 'N/A'}` : ''}
                    </p>
                    <p style="text-align: left; margin-top: -15px; color: ${selectedIndicator.find(indicator => indicator.indicator === 'EMA')?.color || '#FFFFFF'};">
                        ${selectedIndicator.some(indicator => indicator.indicator === 'EMA') ?
                        `EMA: ₹${expoMovingAverageValue !== undefined ? expoMovingAverageValue.expoAverage.toFixed(2) : 'N/A'}` : ''}
                    </p>
                    <p style="text-align: left; margin-top: -15px; color: ${selectedIndicator.find(indicator => indicator.indicator === 'VWAP')?.color || '#FFFFFF'};">
                        ${selectedIndicator.some(indicator => indicator.indicator === 'VWAP') ?
                        `VWAP: ₹${volWeightedAvgValue !== undefined ? volWeightedAvgValue.VWAP.toFixed(2) : 'N/A'}` : ''}
                    </p>
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
                svg.selectAll('.volume-bar').remove();
                svg.select('#movingAverageLine').remove();
                svg.select('#expoMovingAverageLine').remove();
                svg.select('#volWeightedAvgLine').remove();

                const filteredData = chartData.filter(d => d.Date >= val[0] && d.Date <= val[1]);
                x.domain(d3.extent(filteredData, d => d.Date));
                y.domain([d3.min(filteredData, d => d.Low - (0.05 * d.Low)), d3.max(filteredData, d => d.High + (0.05 * d.High))]);

                svg.select(".line").attr("d", line(filteredData));
                svg.select(".area").attr("d", area(filteredData));

                const xMin = d3.min(filteredData, d => d['Date']);
                const xMax = d3.max(filteredData, d => d['Date']);
                const yMin = d3.min(filteredData, d => d['Close']);
                const yMax = d3.max(filteredData, d => d['Close']);

                xScale.domain([xMin, xMax]);
                yScale.domain([yMin - 5, yMax]);

                const updatedMovingAverageData = selectedIndicator.some(indicator => indicator.indicator === 'SMA') ? movingAverage(filteredData, Number(selectedIndicator.find(indicator => indicator.indicator === 'SMA').period)) : [];
                const updatedExpoMovingAverageData = selectedIndicator.some(indicator => indicator.indicator === 'EMA') ? expoMovingAverage(filteredData, Number(selectedIndicator.find(indicator => indicator.indicator === 'EMA').period)) : [];
                const updatedVolWeightedAvgData = selectedIndicator.some(indicator => indicator.indicator === 'VWAP') ? volWeightedAvg(filteredData) : [];

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

                const movingAveragePath = selectedIndicator.some(indicator => indicator.indicator === 'SMA') ? svg.append('path').data([updatedMovingAverageData]).style('fill', 'none').attr('id', 'movingAverageLine').attr('stroke', selectedIndicator.find(indicator => indicator.indicator === 'SMA').color).attr('d', movingAverageLine) : null;

                const expoMovingAveragePath = selectedIndicator.some(indicator => indicator.indicator === 'EMA') ? svg.append('path').data([updatedExpoMovingAverageData]).style('fill', 'none').attr('id', 'expoMovingAverageLine').attr('stroke', selectedIndicator.find(indicator => indicator.indicator === 'EMA').color).attr('d', expoMovingAverageLine) : null;

                const volWeightedAvgPath = selectedIndicator.some(indicator => indicator.indicator === 'VWAP') ? svg.append('path').data([updatedVolWeightedAvgData]).style('fill', 'none').attr('id', 'volWeightedAvgLine').attr('stroke', selectedIndicator.find(indicator => indicator.indicator === 'VWAP').color).attr('d', volWeightedAvgLine) : null;

                if (selectedIndicator.some(indicator => indicator.indicator === 'Volume')) {
                    const volData = filteredData.filter(d => d['Volume'] !== null && d['Volume'] !== 0);
                    const yVolumeScale = d3
                        .scaleLinear()
                        .domain([0, 7 * d3.max(volData, d => d['Volume'])])
                        .range([height, 0]);
                    createVolumeBars(svg, volData, xScale, yVolumeScale);
                }
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
    }, [stockCode, chartData, selectedIndicator, colorData]);
    return (
        <>
            <div id="chart-container"></div>
            <div id="slider-range"></div>
        </>
    );
};

export default StockAreaChartContent;
