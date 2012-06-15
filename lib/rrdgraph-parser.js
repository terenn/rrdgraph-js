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
 *******************************************************************************/

/*******************************************************************************
 * TODO: all unspecified options should be added with reasonable defaults
 ******************************************************************************/

if (typeof RRDGraph === 'undefined') {
  RRDGraph = {};
}

(function () {
  var parser = RRDGraph.parser = {};

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

  parser.parse = function (def_str) {
    var result = {
      options: {},
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

        if (option === 'font') {
          if (!(option in result.options)) {
            result.options[option] = {};
          }
          var font = value.split(':');
          result.options[option][font[0].toLowerCase()] = {
            size: parseInt(font[1]) || 'default',
            family: font[2] || 'default'
          };

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


    return result;
  };
})();

