RRDGraph.get.data = function (src) {
  return {
    "rrd1" : [
      {t:1340474100000,v:-5},
      {t:1340474400000,v:-4},
      {t:1340474700000,v:-3},
      {t:1340475000000,v:-2},
      {t:1340475300000,v:-1},
      {t:1340475600000,v:5},
      {t:1340475900000,v:0},
      {t:1340476200000,v:-5},
      {t:1340476500000,v:1},
      {t:1340476800000,v:2},
      {t:1340477100000,v:3},
      {t:1340477400000,v:3.5},
      {t:1340477700000,v:4},
      {t:1340478000000,v:5},
    ],
    "rrd2" : [
      {t:1340474100000,v:5},
      {t:1340474400000,v:Number.NEGATIVE_INFINITY},
      {t:1340474700000,v:3},
      {t:1340475000000,v:NaN},
      {t:1340475300000,v:1},
      {t:1340475600000,v:0},
      {t:1340475900000,v:-1},
      {t:1340476200000,v:-2},
      {t:1340476500000,v:-3},
      {t:1340476800000,v:Number.POSITIVE_INFINITY},
      {t:1340477100000,v:-5},
    ]
  };
};

function createDataFromConfig(config_string) {
  var config = new RRDGraph.Config(null, config_string);
  var data = new RRDGraph.Data({}, config);

  return data;
}

test('MAXIMUM', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "VDEF:result=rrd1,MAXIMUM \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = {t:1340475600000,v:5};

  deepEqual(data.data.values.result, expected, 'The maximum value in a DEF');
});

test('MINIMUM', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "VDEF:result=rrd1,MINIMUM \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = {t:1340474100000,v:-5};

  deepEqual(data.data.values.result, expected, 'The minimum value in a DEF');
});

test('AVERAGE', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "VDEF:result=rrd1,AVERAGE \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = {t:0,v:0.25};

  deepEqual(data.data.values.result, expected, 'The average of all values in a DEF');
});

test('STDEV', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "VDEF:result=rrd1,STDEV \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = 3.630798;
  var result = Math.round(data.data.values.result.v * 1000000) / 1000000;

  equal(result, expected, 'The standard deviation of the values in a DEF');
});

test('LAST', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "VDEF:result=rrd1,LAST \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = {t:1340478000000,v:5};

  deepEqual(data.data.values.result, expected, 'The last value in a DEF');
});

test('FIRST', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "VDEF:result=rrd1,FIRST \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = {t:1340474100000,v:-5};

  deepEqual(data.data.values.result, expected, 'The first value in a DEF');
});

test('TOTAL', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "VDEF:result=rrd1,TOTAL \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = {t:3900,v:3.5};

  deepEqual(data.data.values.result, expected, 'The sum of all values in a DEF');
});


