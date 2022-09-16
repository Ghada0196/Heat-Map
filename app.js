let baseTemp

const req = new XMLHttpRequest();
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json',true);
req.send();
req.onload = function(){
  const json = JSON.parse(req.responseText);
   baseTemp = json["baseTemperature"]
  const dataset = json["monthlyVariance"]

//dataset ready
   
   const w = 1500
   const h = 600
   const padding = 100

   const svg = d3.select("body")
   .append('svg')
   .style("width", w)
   .style("height", h)
   .style("background-color", "#F9F9F9")
   .attr("class", "map")

//Axes:
    //X-Axis
   const arrYears = dataset.map(d => d["year"])

   const xScale = d3.scaleLinear()
           .domain(d3.extent(arrYears)) //d3.extent returns an array containing min and max
          .range([padding, w - padding])
          
 
   const xAxis = d3.axisBottom(xScale)
                .tickFormat(d => parseInt(d))
                    
   svg.append("g")
       .attr("id", "x-axis")
       .attr("transform", "translate(0, " + (h-padding) + ")")
       .call(xAxis)  

       //Y-Axis
    const arrMonths = dataset.map(d => d["month"])

    const yScale = d3.scaleLinear()
       .domain([d3.extent(arrMonths)[0] - 0.5, d3.extent(arrMonths)[1] + 0.5] )
       .range([padding, h - padding])


   const yAxis = d3.axisLeft(yScale)
                    .tickFormat(d => (d3.timeFormat("%B")(d3.timeParse("%m")(d))) )

   svg.append("g")
       .attr("id", "y-axis")
       .attr("transform", "translate(" + padding + ", 0)")
       .call(yAxis)


//rect
svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("data-date", d => d[0])
    .attr("data-gdp", d => d[1])
    .attr("x", d => xScale(d["year"]))
    .attr("y", d => (yScale(d["month"])  - Math.trunc((h - padding) / 26)))
    .attr("width", 6)
    .attr("height",  Math.trunc((h - padding) / 13) )
    .attr("class", "cell")
    .attr("data-month", d => d["month"] - 1)
    .attr("data-year", d => d["year"])
    .attr("data-temp", d => Math.round(baseTemp + d["variance"]))
    .style("fill", d => colorRect(Math.round(baseTemp + d["variance"])))


//tooltip
const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .attr("id", "tooltip")
                    .style("opacity", "0")
    svg.selectAll("rect")
        .on("mouseover", (e, d) => {
            d3.select("#tooltip")
                .style("opacity", 0.8)
                .style("left", ((xScale(d["year"])+20)+"px"))
                .style("top", ((yScale(d["month"])+55)+"px"))
                .text(formulate((d)))
                .attr("data-year", d["year"])    
            
        })
        .on("mouseout", () => {
            d3.select("#tooltip")
                .style("opacity", 0)

        })

//Legend
const w2 = 440
const h2 = 50

const svgLegend = d3.select("body")
    .append('svg')
    .attr("id", "legend")
    .style("width", w2)
    .style("height", h2)
const scaleLegend = d3.scaleLinear()
                    .domain([2, 13.8])
                    .range([0, w2])

let ticksArr = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8]
const axisLegend = d3.axisBottom(scaleLegend)
                    .tickValues(ticksArr)
                    .tickFormat(t => parseFloat(t))
svgLegend.append("g")
        .attr("transform", "translate(0, 30)")
        .call(axisLegend)
svgLegend.selectAll("rect")
        .data(ticksArr)
        .enter()
        .append("rect")
        .attr("height", 25)
        .attr("width", (w2/11))
        .attr("x", d => scaleLegend(d) )
        .attr("y", 5)
        .style("fill", d => colorLegend(d))

// function to find the right color for rect

function colorRect(n) {
    let arr = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8].filter(t => parseFloat(n) <= t)
    return colorLegend(arr[0])
}

}

//function to find the right color for legend

function colorLegend(d) {
    switch(d){
        case 2.8: return "#6F38C5"          
        case 3.9 : return "#87A2FB"
        case 5.0 : return "#D2DAFF"
        case 6.1 : return "#EEF1FF"
        case 7.2 : return "#FFF6BF"
        case 8.3 : return "#FFEBAD"
        case 9.5 : return "#FFAE6D"
        case 10.6: return "#FF9551"
        case 11.7: return "#FF4A4A"
        default: return "transparent"
    }
}

//formulate function       

function formulate(d) {

    let s = (d["year"] + " - " + d3.timeFormat("%B")(d3.timeParse("%m")(d["month"])) + "\n" )
        s+= (baseTemp + parseFloat(d["variance"])).toFixed(1) + "°C" + "\n" + d["variance"].toFixed(1) + "°C"

    return s 
}    

