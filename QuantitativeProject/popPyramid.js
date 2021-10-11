function pyramidBuilder(data, target, options) {
    var w = typeof options.width === 'undefined' ? 400  : options.width,
        h = typeof options.height === 'undefined' ? 400  : options.height,
        w_full = w,
        h_full = h;

    if (w > $( window ).width()) {
      w = $( window ).width();
    }

    //margins
    var margin = {
            top: 50,
            right: 10,
            bottom: 50,
            left: 10,
            middle: 25
        },
        sectorWidth = (w / 2) - margin.middle,
        leftBegin = sectorWidth - margin.left,
        rightBegin = w - margin.right - sectorWidth;

    w = (w- (margin.left + margin.right) );
    h = (h - (margin.top + margin.bottom));

    //styles
    if (typeof options.style === 'undefined') {
      var style = {
        leftBarColor: '#6c9dc6',
        rightBarColor: '#f15152',
        tooltipBG: '#fefefe',
        tooltipColor: 'black'
      };
    } else {
      var style = {
        leftBarColor: typeof options.style.leftBarColor === 'undefined'  ? '#6c9dc6' : options.style.leftBarColor,
        rightBarColor: typeof options.style.rightBarColor === 'undefined' ? '#de5454' : options.style.rightBarColor,
        tooltipBG: typeof options.style.tooltipBG === 'undefined' ? '#fefefe' : options.style.tooltipBG,
        tooltipColor: typeof options.style.tooltipColor === 'undefined' ? 'black' : options.style.tooltipColor
    };
  }

    //cumulates the total number in order to create the population
    //function percentage returns the percentage of the material from the whole data set
    var totalPopulation = d3.sum(data, function(d) {
            return d.natural + d.synthetic;
        }),
        percentage = function(d) {
            return d/ totalPopulation;
        };
    

    var styleSection = d3.select(target).append('style')
    .text('svg {max-width:100%} \
    .axis line,axis path {shape-rendering: crispEdges;fill: transparent;stroke: #555;} \
    .axis text {font-size: 13px;} \
    .bar {fill-opacity: .9;} \
    .bar.left {fill: ' + style.leftBarColor + ';} \
    .bar.left:hover {fill: ' + colorTransform(style.leftBarColor, '333333') + ';} \
    .bar.right {fill: ' + style.rightBarColor + ';} \
    .bar.right:hover {fill: ' + colorTransform(style.rightBarColor, '333333') + ';} \
    .tooltip {position: absolute;line-height: 1.1em;padding: 7px; margin: 3px;background: ' + style.tooltipBG + '; color: ' + style.tooltipColor + '; pointer-events: none;border-radius: 6px;}')

    var region = d3.select(target).append('svg')
        .attr('width', w_full)
        .attr('height', h_full);

    //creates the legend
    var legend = region.append('g')
        .attr('class', 'legend');

    //appends a key for a square of color with the corresponding label
    legend.append('rect')
        .attr('class', 'bar left')
        .attr('x', 80)
        .attr('y', 60)
        .attr('width', 17)
        .attr('height', 17);

    legend.append('text')
        .attr('fill', '#000')
        .attr('x', 105)
        .attr('y', 70)
        .attr('dy', '0.32em')
        .text('naturals');

    legend.append('rect')
        .attr('class', 'bar right')
        .attr('x', 80)
        .attr('y', 90)
        .attr('width', 17)
        .attr('height', 17);

    legend.append('text')
        .attr('fill', '#000')
        .attr('x', 105)
        .attr('y', 98)
        .attr('dy', '0.32em')
        .text('synthetics');
        
    //create the tooltip[]
    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var pyramid = region.append('g')
        .attr('class', 'inner-region')
        .attr('transform', translation(margin.left, margin.top));

    // find the maximum data value for whole dataset
    // and rounds up to nearest 5%
    var maxValue = Math.ceil(Math.max(
        d3.max(data, function(d) {
            return percentage(d.natural);
        }),
        d3.max(data, function(d) {
            return percentage(d.synthetic);
        })
    )/0.05)*0.033;

    // SET UP SCALES

    // the xScale goes from 0 to the width of a region and reversed for x axis
    var xScale = d3.scaleLinear()
        .domain([0, .29])
        .range([0, (sectorWidth-margin.middle)])
        .nice();

    var xScaleLeft = d3.scaleLinear()
        .domain([0, maxValue])
        .range([sectorWidth, 0]);

    var xScaleRight = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, sectorWidth]);

    var yScale = d3.scaleBand()
        .domain(data.map(function(d) {
            return d.year;
        }))
        .range([h, 0], 0.1);


    // SET UP AXES
    var yAxisLeft = d3.axisRight()
        .scale(yScale)
        .tickSize(2, 0)
        .tickPadding(margin.middle - 2);

    var yAxisRight = d3.axisLeft()
        .scale(yScale)
        .tickSize(2, 0)
        .tickFormat('');

    var xAxisRight = d3.axisBottom()
        .scale(xScale)
        .tickFormat(d3.format('.0%'));

    var xAxisLeft = d3.axisBottom()
        // REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
        .scale(xScale.copy().range([leftBegin, 0]))
        .tickFormat(d3.format('.0%'));

    // MAKE GROUPS FOR EACH SIDE OF CHART
    // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    var leftBarGroup = pyramid.append('g')
        .attr('transform', translation(leftBegin, 0) + 'scale(-1,1)');
    var rightBarGroup = pyramid.append('g')
        .attr('transform', translation(rightBegin, 0));

    // DRAW AXES
    pyramid.append('g')
        .attr('class', 'axis y left')
        .attr('transform', translation(leftBegin, 0))
        .call(yAxisLeft)
        .selectAll('text')
        .style('text-anchor', 'middle');

    pyramid.append('g')
        .attr('class', 'axis y right')
        .attr('transform', translation(rightBegin, 0))
        .call(yAxisRight);

    pyramid.append('g')
        .attr('class', 'axis x left')
        .attr('transform', translation(0, h))
        .call(xAxisLeft);

    pyramid.append('g')
        .attr('class', 'axis x right')
        .attr('transform', translation(rightBegin, h))
        .call(xAxisRight);

    // DRAW BARS
    leftBarGroup.selectAll('.bar.left')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar left')
        .attr('x', .5)
        .attr('y', function(d) {
            return yScale(d.year) + margin.middle / 4;
        })
        .attr('width', function(d) {
            console.log(d, d.synthetic, xScale)
            return xScale(percentage(d.natural));
        
        })
        .attr('height', 20)
        .on("mouseover", function(d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltipDiv.html("<strong>What Materials Used in year: " + d.year + "</strong>" +
                    "<br />  <br><strong>Tortoiseshell: </strong>" + prettyFormat(d.tortoiseshell) +
                    "<br /> <strong>Leather:</strong> " + prettyFormat(d.leather) +
                    "<br /> <strong>Ivory:</strong> " + prettyFormat(d.ivory)+
                    "<br /><br>" + (Math.round(percentage(d.natural) * 1000) / 10) + "% of Total")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });

    rightBarGroup.selectAll('.bar.right')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar right')
        .attr('x', 0.5)
        .attr('y', function(d) {
            return yScale(d.year) + margin.middle / 4;
        })
        .attr('width', function(d) {
            return xScale(percentage(d.synthetic)*2);
        })
        .attr('height', 20)
        .on("mouseover", function(d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltipDiv.html("<strong>What Materials Used in year: " + d.year + "</strong>" +
                    "<br />  <br><strong>Plastic: </strong>" + prettyFormat(d.plastic) +
                    "<br /> <strong>Nylon:</strong> " + prettyFormat(d.nylon) +
                    "<br /> <strong>Polyester:</strong> " + prettyFormat(d.polyester)+
                    "<br />" + (Math.round(percentage(d.synthetic) * 1000) / 10) + "% of Total")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // string concat for translate
    function translation(x, y) {
        return 'translate(' + x + ',' + y + ')';
    }

    // numbers with commas
    function prettyFormat(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // lighten colors
    function colorTransform(c1, c2) {
        var c1 = c1.replace('#','')
            origHex = {
                r: c1.substring(0, 2),
                g: c1.substring(2, 4),
                b: c1.substring(4, 6)
            },
            transVec = {
                r: c2.substring(0, 2),
                g: c2.substring(2, 4),
                b: c2.substring(4, 6)
            },
            newHex = {};

        function transform(d, e) {
            var f = parseInt(d, 16) + parseInt(e, 16);
            if (f > 255) {
                f = 255;
            }
            return f.toString(16);
        }
        newHex.r = transform(origHex.r, transVec.r);
        newHex.g = transform(origHex.g, transVec.g);
        newHex.b = transform(origHex.b, transVec.b);
        return '#' + newHex.r + newHex.g + newHex.b;
    }

    
}
//reference: https://doylek.github.io/D3-Population-Pyramid/