RRDGraph-JS — RRDGraph implementation in client-side JavaScript
===============================================================

RRDGraph-JS is an implementation of RRDGraph, which allows one to use RRDTool
graph commands to draw graphs in the browser. In addition to static graphs,
realtime graphs are also supported.

Installation / Usage
--------------------

1. Download [`d3.js`](http://d3js.org)

2. Download the [`rrdgraph.js`](https://github.com/vladbarinov/rrdgraph-js/blob/master/rrdgraph.js) script.

3. Add a div where you want the graph to be on the page.

4. Add this code to an .onload event (pure JS, jQuery, d3; it does not matter):
    ``` javascript
    // selector - selects the div(s) you added earlier
    // rrd_command - the RRD command, which defines the graph
    //
    // selector can be omitted, the script will then use the data-src parameter of the div
    // if data-src is used, RRDGraph.get.config and RRDGraph.get.data must be defined somewhere
    var graphs = RRDGraph.init(selector, rrd_command);
    ```

5. To add data to the graph, there are two methods:

5.1. Preconsolidated data
    ``` javascript
    var graph = graphs[i];
    graph.data.push([
      {
        def: 'defname',
        points: [
          {
            t: timestamp,
            v: value
          }
        ]
      }
    ]);
    ```
    This data will be immediately added to the graph.
5.2. Realtime metrics
    ``` javascript
    // metricId to rrd:ds_name mappings
    var mappings = {
      'metricId1' : 'rrd_name:ds_name'
    };
    var graph = graphs[i];
    var dc = new RRDGraph.DataCollector(graph.config, graph.data, mappings);
    dc.push([
      {
        metricId: 'metricId1',
        timeStamp: timestamp,
        value: value
      }
    ]);
    ```

    The metrics will be consolidated according to the RRD command and pushed when enough metrics
    have been collected to create data points.

More usage
----------

See test/renderer-test.html and test/realtime-test.html for more information on how to use RRDGraph-JS.

Authors
-------

This project was created for OpenNMS and Google Summer of Code 2012 by Vladislav Barinov under the
mentorship of Matt Brozowski and with the help of Markus Neuman.

Licence
-------

This project is part of OpenNMS and is licenced under the GNU General Public Licence (version 3).
For more information see the header in rrdgraph.js.

Acknowledgements
----------------

Tobias Oetiker - original rrdtool and rrdgraph implementation and documentation.

d3.js - http://d3js.org
