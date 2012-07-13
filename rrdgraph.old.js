/*******************************************************************************
 * This file is part of OpenNMS(R).
 *
 * Copyright (C) 2007-2011 The OpenNMS Group, Inc.
 * OpenNMS(R) is Copyright (C) 1999-2011 The OpenNMS Group, Inc.
 *
 * OpenNMS(R) is a registered trademark of The OpenNMS Group, Inc.
 *
 * OpenNMS(R) is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * OpenNMS(R) is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenNMS(R).  If not, see:
 *      http://www.gnu.org/licenses/
 *
 * For more information contact:
 *     OpenNMS(R) Licensing <license@opennms.org>
 *     http://www.opennms.org/
 *     http://www.opennms.com/
 ******************************************************************************/

RRDGraph = {};

/*******************************************************************************
 * Data/config grabber
 ******************************************************************************/
(function () {
  var get = RRDGraph.get = {};

  get.config = function (src) { // {resourceId, report}
    // TODO: decide how to get this from the server
    return '';
  };

  get.data = function () { // {resourceId, report, start, end}
    // TODO: decide how to get this from the server
    return {};
  };
})();

/*******************************************************************************
 * The config
 ******************************************************************************/

(function () {
  var parser = {};

  var tokenize = function (str) {
    var delined = str.replace(/\\\n/g, ' ');

    var regex = /[^\s"]*["]+?[^"]+?["]+?[^\s"']*|[^\s"]+/g;
    var tokens = [];
    var match;
    while (match = regex.exec(delined)) {
      tokens.push(match[0].replace(/"/g, ''));
    }

    return tokens;
  };

  var regex = {
    def: /^[CV]?DEF:/,
    graph: /^PRINT|^GPRINT|^COMMENT|^VRULE|^HRULE|^LINE|^AREA|^TICK|^SHIFT|^TEXTALIGN/,
    print: /^[G]?PRINT/,
    line: /^LINE/,
    split: /\\%%SPLIT%%/g,
    colon: /:/g
  };

  var short_tags = {
    's': 'start', 'e': 'end', 'S': 'step', 't': 'title', 'v': 'vertical-label',
    'w': 'width', 'h': 'height', 'j': 'only-graph', 'D': 'full-size-mode',
    'u': 'upper-limit', 'l': 'lower-limit', 'r': 'rigid', 'A': 'alt-autoscale',
    'J': 'alt-autoscale-min', 'M': 'alt-autoscale-max', 'N': 'no-gridfit',
    'x': 'x-grid', 'y': 'y-grid', 'Y': 'alt-y-grid', 'o': 'logarithmic',
    'X': 'units-exponent', 'L': 'units-length', 'g': 'no-legend',
    'F': 'force-rules-legend', 'c': 'color', 'm': 'zoom', 'n': 'font',
    'P': 'pango-markup', 'G': 'graph-render-mode', 'E': 'slope-mode',
    'T': 'tabwidth', 'b': 'base', 'W': 'watermark'
  };

  var cast_options = function (options, cast, option_names) {
    for (var o in option_names) {
      var option = option_names[o];
      options[option] = cast(options[option]);
    }
  };


  parser.parse = function (def_str) {
    var result = {
      options: {
        'start'             : '-86400', // 1 day before
        'end'               : 0,
        'step'              : 1,
        'title'             : '',
        'vertical-label'    : '',
        'width'             : 400,
        'height'            : 100,
        'full-size-mode'    : false,
        'only-graph'        : false,
        'upper-limit'       : null,
        'lower-limit'       : null,
        'rigid'             : false,
        'alt-autoscale'     : false,
        'alt-autoscale-min' : false,
        'alt-autoscale-max' : false,
        'no-gridfit'        : true,
        'x-grid'            : '', // TODO: reasonable default
        'y-grid'            : '', // TODO: reasonable default
        'alt-y-grid'        : false,
        'logarithmic'       : false,
        'units-exponent'    : 0, // TODO: reasonable default
        'units-length'      : 0,
        'units'             : 'si',
        'right-axis'        : '1:1', // scale:shift
        'right-axis-label'  : '',
        'right-axis-format' : '',
        'no-legend'         : false,
        'force-rules-legend': false,
        'legend-position'   : 'south',
        'legend-direction'  : 'topdown',
        'color'             : '', // TODO: reasonable default
        'grid-dash'         : '1:1',
        'border'            : 2,
        'dynamic-labels'    : false,
        'zoom'              : 1,
        'font'              : {
          'title' : {
            'family': 'monospace',
            'size': 13
          },
          'axis' : {
            'family': 'monospace',
            'size': 10
          },
          'unit' : {
            'family': 'monospace',
            'size': 12
          },
          'legend' : {
            'family': 'monospace',
            'size': 10
          },
          'watermark' : {
            'family': 'monospace',
            'size': 8
          },
        },
        'pango-markup'      : false,
        'graph-render-mode' : 'normal',
        'slope-mode'        : false,
        'tabwidth'          : 40,
        'base'              : 1000,
        'watermark'         : ''
      },
      defs: {
        data: {},
        value: {},
        calc: {}
      },
      graphs: {
        textalign: 'justified',
        elements: []
      }
    };

    var tokens = tokenize(def_str);

    for (var t = 0, l = tokens.length; t < l; ++t) {
      var token = tokens[t];

      if (regex.def.test(token)) {
        var subtokens = token.split(':');
        
        var name;
        var value;
        var type;

        if (token.charAt(0) === 'D') { // DEF
          type = 'data';
          value = {};

          var name_rrd = subtokens[1].split('=');
          name = name_rrd[0];
          value.rrd = name_rrd[1];
          value.ds_name = subtokens[2];
          value.cf = subtokens[3];

          for (var st = 4, sl = subtokens.length; st < sl; ++st) {
            var st_kv = subtokens[st].split('=');
            value[st_kv[0]] = st_kv[1];
          }
        } else {
          type = (token.charAt(0) === 'C') ? 'calc' : 'value';

          var split_at = token.indexOf('=');
          name = token.slice(5, split_at);
          value = token.slice(split_at + 1);
        }

        result.defs[type][name] = value;
      } else if (token.charAt(0) === '-' && token.length > 1) {
        var n_dashes = (token.charAt(1) === '-') ? 2 : 1;
        var option = token.slice(n_dashes);
        
        var value = true;
        var key_value = option.split('=');

        if (key_value.length > 1) {
          option = key_value[0];
          value = key_value[1];
        } else if (tokens[t + 1].charAt(0) !== '-' && !regex.def.test(tokens[t + 1])) {
          value = tokens[++t];
        }

        if (option in short_tags) option = short_tags[option];

        if (option === 'font') {
          var font = value.split(':');

          var size = parseInt(font[1]);
          if (size) {
            result.options[option][font[0].toLowerCase()].size = size;
          }
          
          if (font[2]) {
            result.options[option][font[0].toLowerCase()].family = font[2];
          }
        } else {
          result.options[option] = value;
        }
      } else if (regex.graph.test(token)) {
        token = token.replace(regex.colon, '%%SPLIT%%');
        token = token.replace(regex.split, ':');

        var subtokens = token.split('%%SPLIT%%');
        var element = {
          type: null
        };

        if (regex.print.test(subtokens[0])) {
          element.type = subtokens[0].toLowerCase();

          element.vname = subtokens[1];
          if (subtokens.length === 3) { // newer
            element.format = subtokens[2];
          } else { // deprecated type
            element.format = subtokens[3];
            element.cf = subtokens[2];
          }
        } else if (subtokens[0] === 'COMMENT') {
          element.type = 'comment';

          element.text = subtokens[1];
        } else if (subtokens[0] === 'SHIFT') {
          element.type = 'shift';

          element.vname = subtokens[1];
          element.offset = subtokens[2];
        } else if (subtokens[0] === 'TEXTALIGN') {
          result.graphs.textalign = subtokens[1];
        } else if (subtokens[0] === 'TICK') {
          element.type = 'tick';

          var vname_color = subtokens[1].split('#');
          element.vname = vname_color[0];
          element.color = vname_color[1];
          
          if (subtokens.length > 3) {
            element.legend = subtokens[3];
          }

          element.fraction = 0.1;

          if (subtokens.length >= 3) {
            element.fraction = subtokens[2];
          }
        } else { // vrule, hrule, line or area

          if (regex.line.test(subtokens[0])) {
            element.type = 'line';

            if (subtokens[0].length > 4) {
              element.width = parseFloat(subtokens[0].slice(4));
            } else {
              element.width = 1;
            }
          } else {
            element.type = subtokens[0].toLowerCase();
          }

          var key_color = subtokens[1].split('#');
          if (element.type === 'vrule') {
            element.time = key_color[0];
          } else { // hrule, line, area
            element.value = key_color[0];
          }

          if (key_color.length === 2) {
            element.color = key_color[1];
          } else {
            element.color = '000000';
          }

          if (subtokens.length >= 3) { // legend
            element.legend = subtokens[2];

            for (var st = 3, sl = subtokens.length; st < sl; ++st) {
              if (subtokens[st] === 'STACK') {
                element.stack = true;
              } else { // dashes or dash-offset
                var key_value = subtokens[st].split('=');
                if (key_value[0] === 'dashes') {
                  if (key_value.length === 2) {
                    element.dashes = key_value[1];
                  } else {
                    element.dashes = '5,5';
                  }
                } else { // dash-offset
                  element.dash_offset = subtokens[st].split('=')[1];
                }
              }
            }
          }
        }

        if ('color' in element) { // extract opacity
          if (element.color.length === 6) { // just color, default opacity
            element.color = '#' + element.color;
            element.opacity = 1.0;
          } else {
            var opacity_hex = parseInt(element.color.slice(6), 16);
            element.color = '#' + element.color.slice(0, 6);
            element.opacity = opacity_hex / 255.0;
          }
        }

        if (element.type !== null) {
          result.graphs.elements.push(element);
        }
      }
    }

    cast_options(result.options, parseInt, [
      'step', 'width', 'height', 'units-exponent', 'units-length', 'border',
      'tabwidth', 'base', 
    ]);

    cast_options(result.options, parseFloat, ['upper-limit', 'lower-limit', 'zoom']);

    return result;
  };

  RRDGraph.Config = function (src) {
    var config_string = RRDGraph.get.config(src);
    var config = parser.parse(config_str);

    this.src = src;
    this.options = config.options;
    this.defs = config.defs;
    this.graphs = config.graphs;
  };
})();

/*******************************************************************************
 * The data class
 ******************************************************************************/

(function () {
  var Data = RRDGraph.Data = function (config) {
  };

  Data.prototype.loadInitialData = function (
})();

/*******************************************************************************
 * The graph class
 ******************************************************************************/

(function () {
  var Graph = RRDGraph.Graph = function (element, config) {
    var c = this.config = config;
    this.element = d3.select(element);

    // The SVG, TODO: color from config
    var svg = this.svg = this.element.append('svg:svg').
      attr('width', c.options.width + (c.options['full-size-mode'] ? 0 : 100)).
      attr('height', c.options.height + (c.options['full-size-mode'] ? 0 : 75)).
      attr('shape-rendering', 'crispEdges').
      style('background-color', '#f3f3f3').
      style('border-right', c.options.border + 'px solid #999').
      style('border-bottom', c.options.border + 'px solid #999').
      style('border-top', c.options.border + 'px solid #ccc').
      style('border-left', c.options.border + 'px solid #ccc');

    // Add the clip path, TODO: full-size-mode
    svg.append('svg:clipPath').attr('id', 'clip').
      append('svg:rect').
      attr('width', c.options.width).
      attr('height', c.options.height);

    var canvas = this.canvas = svg.append('svg:g').
      attr('transform', 'translate(65, 30)');


    // Canvas Background, TODO: color from config, full-size-mode
    var canvas_bg = this.canvas_bg = canvas.append('svg:rect').
      attr('width', c.options.width).
      attr('height', c.options.height).
      attr('fill', '#fff');

    // Title, TODO: color
    svg.append('svg:text').
      attr('x', svg.attr('width') / 2).
      attr('y', 20).
      attr("text-anchor", "middle").
      text(c.options.title).
      style('font-size', c.options.font.title.size + 'px').
      style('font-family', c.options.font.title.family);
    
    // Vertical Label, TODO: color
    svg.append('svg:text').
      attr('x', -canvas_bg.attr('height') / 2 - 30).
      attr('y', c.options.font.unit.size + 2).
      style('font-size', c.options.font.unit.size + 'px').
      style('font-family', c.options.font.unit.family).
      attr("transform", "rotate(270)").
      text(c.options['vertical-label']);

    // Logo
    svg.append('svg:text').
      attr('x', 2).
      attr('y', 9 - svg.attr('width')).
      attr('fill', '#aaa').
      style('font', '9px monospace').
      attr("transform", "rotate(90)").
      text("RRDGRAPH-JS / D3.JS");

  };

  // TODO: all other functions
  var RPN = {
    '+' : function (s) { s.push(s.pop() + s.pop()) },
    '*' : function (s) { s.push(s.pop() * s.pop()) },
    '-' : function (s) { var m = s.pop(); s.push(s.pop() - m) },
    '/' : function (s) { var m = s.pop(); s.push(s.pop() / m) },
    '%' : function (s) { var m = s.pop(); s.push(s.pop() % m) }
  };

  Graph.prototype.updateDefs = function (data) {
    this.data = {};
    var c = this.config;
    var e = this.extremes = {
      x: {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY},
      y: {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY}
    };
    
    // DEFS
    for (var d in c.defs.data) {
      this.data[d] = data[c.defs.data[d].rrd];
      for (var p in this.data[d]) {
        var time = this.data[d][p].t;
        var value = this.data[d][p].v;
        if (value > e.y.max) e.y.max = value;
        if (value < e.y.min) e.y.min = value;
        if (time > e.x.max) e.x.max = time;
        if (time < e.x.min) e.x.min = time;
      }
    }

    // CDEFS, TODO: allow DEFS with different # of points
    for (var d in c.defs.calc) {
      this.data[d] = [];
      var expr = c.defs.calc[d].split(',');
      var stack = [];
      // TODO: calculate
    }

    return this;
  };

  Graph.prototype.draw = function (data) {
    this.updateDefs(data);

    var config = this.config;

    var canvas = this.canvas;
    var canvas_bg = this.canvas_bg;

    var width = canvas_bg.attr('width');
    var height = canvas_bg.attr('height');


    var scales = {
      y: d3.scale.linear().
        domain([Math.floor(this.extremes.y.min), Math.ceil(this.extremes.y.max)]).
        range([height, 0]),
      x: d3.time.scale().
        domain([this.extremes.x.min, this.extremes.x.max]).
        range([0, width])
    };
    
    var dashes = config.options['grid-dash'].replace(':', ' ');

    // Horizontal Grid, TODO: color
    var hgrid_minor = canvas.selectAll("g.rule").
      data(scales.y.ticks(30)).
      enter().append("svg:g").
      attr("stroke", "#ddd").
      attr("stroke-dasharray", dashes);

    hgrid_minor.append("svg:line").
      attr("x1", 0).
      attr("x2", width).
      attr("y1", scales.y).
      attr("y2", scales.y);

    var hgrid_major = canvas.selectAll("g.rule").
      data(scales.y.ticks(6)).
      enter().append("svg:g").
      attr("stroke", "#f00").
      attr("stroke-opacity", "0.2").
      attr("stroke-dasharray", dashes);

    hgrid_major.append("svg:line").
      attr("x1", 0).
      attr("x2", width).
      attr("y1", scales.y).
      attr("y2", scales.y);

    // Vertical Grid, TODO: color
    var tick = {vgrid: {}, xaxis: {}};
    var timespan = this.extremes.x.max - this.extremes.x.min;
    if (timespan > 2419200000) { // > month, year view
      tick.vgrid.min_type = d3.time.months;
      tick.vgrid.min_count = 1;
      tick.vgrid.maj_type = d3.time.months;
      tick.vgrid.maj_count = 1;
      tick.xaxis.type = d3.time.months;
      tick.xaxis.count = 1;
      tick.xaxis.sub = 0;
      tick.xaxis.format = d3.time.format('%b');
    } else if (timespan > 604800000) { // > week, month view
      tick.vgrid.min_type = d3.time.hours;
      tick.vgrid.min_count = 12;
      tick.vgrid.maj_type = d3.time.days;
      tick.vgrid.maj_count = 1;
      tick.xaxis.type = d3.time.days;
      tick.xaxis.count = 2;
      tick.xaxis.sub = 2;
      tick.xaxis.format = d3.time.format('%a');
    } else if (timespan > 86400000) { // > day, week view
      tick.vgrid.min_type = d3.time.hours;
      tick.vgrid.min_count = 6;
      tick.vgrid.maj_type = d3.time.days;
      tick.vgrid.maj_count = 1;
      tick.xaxis.type = d3.time.days;
      tick.xaxis.count = 1;
      tick.xaxis.sub = 4;
      tick.xaxis.format = d3.time.format('%a');
    } else { // <= day view
      tick.vgrid.min_type = d3.time.minutes;
      tick.vgrid.min_count = 30;
      tick.vgrid.maj_type = d3.time.hours;
      tick.vgrid.maj_count = 2;
      tick.xaxis.type = d3.time.hours;
      tick.xaxis.count = 6;
      tick.xaxis.sub = 3;
      tick.xaxis.format = d3.time.format('%a %H:%M');
    }

    var vgrid_minor = canvas.selectAll("g.rule").
      data(scales.x.ticks(tick.vgrid.min_type, tick.vgrid.min_count)).
      enter().append("svg:g").
      attr("stroke", "#ddd").
      attr("stroke-dasharray", dashes);

    vgrid_minor.append("svg:line").
      attr("x1", scales.x).
      attr("x2", scales.x).
      attr("y1", 0).
      attr("y2", height);

    var vgrid_major = canvas.selectAll("g.rule").
      data(scales.x.ticks(tick.vgrid.maj_type, tick.vgrid.maj_count)).
      enter().append("svg:g").
      attr("stroke", "#f00").
      attr("stroke-opacity", "0.2").
      attr("stroke-dasharray", dashes);

    vgrid_major.append("svg:line").
      attr("x1", scales.x).
      attr("x2", scales.x).
      attr("y1", 0).
      attr("y2", height);

    // Axes, TODO: color
    var yAxis = d3.svg.axis().scale(scales.y).orient('left').ticks(6).tickSize(2);
    canvas.append("svg:g").
      attr('class', 'y axis').
      call(yAxis);

    var xAxis = d3.svg.axis().scale(scales.x).orient('bottom').
      ticks(tick.xaxis.type, tick.xaxis.count).tickSubdivide(tick.xaxis.sub).
      tickSize(2, 1, 1).tickFormat(tick.xaxis.format);

    canvas.append('svg:g').
      attr('class', 'x axis').
      attr('transform', 'translate(0,' + height + ')').
      call(xAxis);
    
    canvas.selectAll('.axis line, .axis path').
      style('fill', 'none').
      style('stroke', '#000');

    canvas.selectAll('.axis text').
      style('font-size', config.options.font.axis.size + 'px').
      style('font-family', config.options.font.axis.family);


    // Lines, TODO: legend
    for (var g in config.graphs.elements) {
      var e = config.graphs.elements[g];
      if (e.type === 'line') {
        canvas.selectAll('path.line').
          data([this.data[e.value]]).enter().
          append('svg:g').append('svg:path').
          attr('d', d3.svg.line().
            x(function(d) { return scales.x(new Date(d.t)) }).
            y(function(d) { return scales.y(d.v) })
          ).
          attr('class', 'line').
          attr("fill", "none").
          attr("stroke", e.color).
          attr('stroke-width', e.width).
          attr('clip-path', 'url(#clip)').
          attr('shape-rendering', 'auto');

      }
    }

    /*

    for (var d in this.data) {
      this.canvas.data(this.data[d]).append("svg:path").
        attr("d", d3.svg.line()
          .x(function(d) { return x(new Date(d.date)) })
          .y(function(d) { return y(d.temp) })
        ).
        attr("fill", "none").
        attr("stroke", "#00f").
        attr('stroke-width', 1).
        attr('shape-rendering', 'auto');
    }

    */
  }

})();


/*******************************************************************************
 * Main functions
 ******************************************************************************/

(function () {
  var parseSrc = function (src) {
    var parts = src.split('&');
    var kv = {};
    for (var p in parts) {
      var key_value = parts[p].split('=');
      kv[key_value[0]] = key_value[1];
    }
    return kv;
  };

  RRDGraph.init = function (selector) {
    d3.selectAll(selector).each(function () {
      var src = parseSrc(this.dataset.src);
      var element = this;

      var config = new RRDGraph.Config(src);
      var graph = new RRDGraph.Graph(element, config);
      var data = new RRDGraph.Data(config);

      graph.bind(data);

      /*
      var data = RRDGraph.get.data(options);
      graph.draw(data);
      */
    });
  };

})();
