$(function () {
  var setupGraph = function (options) {
    var data = options.data;

    var time_in_period;
    if (options.period === 'day') {
      time_in_period = 86400;
    } else if (options.period === 'week') {
      time_in_period = 86400 * 7;
    } else if (options.period === 'month') {
      time_in_period = 86400 * 30;
    } else if (options.period === 'year') {
      time_in_period = 86400 * 365;
    }
    time_in_period *= 1000;

    var maxDate = new Date(data[data.length - 1].date),
        minDate = new Date(data[data.length - 1].date - time_in_period);

    var minTemp = 50,
        maxTemp = 0,
        avgTemp = 0;
    for (var d in data) {
      var temp = data[d].temp;
      if (temp < minTemp) minTemp = temp;
      if (temp > maxTemp) maxTemp = temp;
      avgTemp += temp;
    }
    avgTemp /= data.length;

    var w = 860,
        h = 92,
        p = 32,
        y = d3.scale.linear().domain([Math.floor(minTemp / 5.0) * 5, Math.ceil(maxTemp / 5.0) * 5 + 0.01]).range([h, 0]),
        x = d3.time.scale().domain([minDate, maxDate]).range([0, w]);

    var graph = d3.select(options.element)
      .data([data])
      .append('svg:svg')
      .attr("width", w + p * 3)
      .attr("height", h + p * 2 + 10)
      .attr("shape-rendering", "crispEdges");

    var vis = graph
      .append("svg:g")
      .attr("transform", "translate(" + (2 * p) + ", " + (p + 0.5) + ")");
    
    var filler = vis.append("svg:rect")
      .attr("width", w)
      .attr("height", h)
      .attr("fill", "#fff");

    var hgrid_minor = vis.selectAll("g.rule")
      .data(y.ticks(12))
      .enter().append("svg:g")
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "1 1");

    hgrid_minor.append("svg:line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", y)
      .attr("y2", y);

    var hgrid_major = vis.selectAll("g.rule")
      .data(y.ticks(6))
      .enter().append("svg:g")
      .attr("stroke", "#f00")
      .attr("stroke-opacity", "0.2")
      .attr("stroke-dasharray", "1 1");

    hgrid_major.append("svg:line")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", y)
      .attr("y2", y);

    var tick = {};
    if (options.period === 'day') {
      tick.min_type = d3.time.minutes;
      tick.min_count = 30;
      tick.maj_type = d3.time.hours;
      tick.maj_count = 2;
    } else if (options.period === 'week') {
      tick.min_type = d3.time.hours;
      tick.min_count = 6;
      tick.maj_type = d3.time.days;
      tick.maj_count = 1;
    } else if (options.period === 'month') {
      tick.min_type = d3.time.hours;
      tick.min_count = 12;
      tick.maj_type = d3.time.days;
      tick.maj_count = 1;
    } else if (options.period === 'year') {
      tick.min_type = d3.time.months;
      tick.min_count = 1;
      tick.maj_type = d3.time.months;
      tick.maj_count = 1;
    }

    var vgrid_minor = vis.selectAll("g.rule")
      .data(x.ticks(tick.min_type, tick.min_count))
      .enter().append("svg:g")
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "1 1");

    vgrid_minor.append("svg:line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", 0)
      .attr("y2", h);

    var vgrid_major = vis.selectAll("g.rule")
      .data(x.ticks(tick.maj_type, tick.maj_count))
      .enter().append("svg:g")
      .attr("stroke", "#f00")
      .attr("stroke-opacity", "0.2")
      .attr("stroke-dasharray", "1 1");

    vgrid_major.append("svg:line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", 0)
      .attr("y2", h);
    
    var yAxis = d3.svg.axis().scale(y).orient('left').ticks(6).tickSize(2);
    vis.append("svg:g")
      .attr("class", "y axis")
      .call(yAxis);
    
    tick = {};
    if (options.period === 'day') {
      tick.type = d3.time.hours;
      tick.count = 6;
      tick.sub = 3;
      tick.format = d3.time.format('%a %H:%M');
    } else if (options.period === 'week') {
      tick.type = d3.time.days;
      tick.count = 1;
      tick.sub = 4;
      tick.format = d3.time.format('%a');
    } else if (options.period === 'month') {
      tick.type = d3.time.days;
      tick.count = 2;
      tick.sub = 2;
      tick.format = d3.time.format('%a');
    } else if (options.period === 'year') {
      tick.type = d3.time.months;
      tick.count = 1;
      tick.sub = 0;
      tick.format = d3.time.format('%b');
    }

    var xAxis = d3.svg.axis().scale(x).orient('bottom')
      .ticks(tick.type, tick.count).tickSubdivide(tick.sub)
      .tickSize(2, 1, 1).tickFormat(tick.format);
    vis.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

    vis.append("svg:path")
      .attr("d", d3.svg.line()
        .x(function(d) { return x(new Date(d.date)) })
        .y(function(d) { return y(d.temp) })
      )
      .attr("fill", "none")
      .attr("stroke", "#00f")
      .attr('stroke-width', 1)
      .attr('shape-rendering', 'auto');

    graph.append('svg:text')
      .attr("x", -(h / 2 + 322))
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(270)")
      .text("degrees C");
    
    graph.append('svg:text')
      .attr('class', 'graph-header')
      .attr('x', w / 2 + 1.5 * p)
      .attr('y', 20)
      .attr("text-anchor", "middle")
      .text(options.name + ' :: last ' + options.period);

    graph.append('svg:rect')
      .attr('x', 7)
      .attr('y', p + 27 + h)
      .attr('width', 8)
      .attr('height', 8)
      .attr('stroke', '#000')
      .attr('fill', '#00f');

    graph.append('svg:text')
      .attr('x', 25)
      .attr('y', p + 35 + h)
      .text(options.shortname + ':' +
        ' Max: ' + maxTemp.toFixed(1) +
        ' Avg: ' + avgTemp.toFixed(1) +
        ' Current: ' + data[data.length - 1].temp.toFixed(1));

    graph.append('svg:text')
      .attr('x', 5)
      .attr('y', -(2.5 * p + 5 + w))
      .attr('fill', '#aaa')
      .style('font', '10px monospace')
      .attr("transform", "rotate(90)")
      .text("RRDTOOL / D3.JS");
  };

  var graph = function (options) {
    // Remove this if actually receiving data
    var data = [{date: +new Date() - 86400000, temp: Math.random() * 3 + 19}];
    for (var d = 1; d < 288; ++d) {
      var new_temp = data[d - 1].temp + (Math.random() - 0.5);
      if (new_temp > 25) new_temp = 25;
      else if (new_temp < 17) new_temp = 17;
      data[d] = {date: data[d - 1].date + 300000, temp: new_temp};
    }
    options.data = data;
    setupGraph(options);
    // End remove

    /* Uncomment this if actually receiving data
    d3.json(options.data_source, function (data) {
      options.data = data;
      setupGraph(options);
    });
    */
  };

  if (typeof d3 !== 'undefined') {
    // get it from document.location (if you need)
    var period = 'day';
    graph({
      name: 'tv (sensor 0)',
      shortname: 'TV',
      period: period,
      data_source: 'rrd/tv/' + period,
      element: '#tv-graph'
    });
    graph({
      name: 'kitchen (sensor 1)',
      shortname: 'Kitchen',
      period: period,
      data_source: 'rrd/kitchen/' + period,
      element: '#kitchen-graph'
    });
    graph({
      name: 'bathroom (sensor 2)',
      shortname: 'Bathroom',
      period: period,
      data_source: 'rrd/bathroom/' + period,
      element: '#bath-graph'
    });
  }
});
