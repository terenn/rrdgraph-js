RRDGraph.get.data = function (src) {
  return {
    "rrd1" : [
      {t:1340474100000,v:-5},
      {t:1340474400000,v:-4},
      {t:1340474700000,v:-3},
      {t:1340475000000,v:-2},
      {t:1340475300000,v:-1},
      {t:1340475600000,v:0},
      {t:1340475900000,v:1},
      {t:1340476200000,v:2},
      {t:1340476500000,v:3},
      {t:1340476800000,v:4},
      {t:1340477100000,v:5},
    ],
    "rrd2" : [
      {t:1340474100000,v:5},
      {t:1340474400000,v:4},
      {t:1340474700000,v:3},
      {t:1340475000000,v:2},
      {t:1340475300000,v:1},
      {t:1340475600000,v:0},
      {t:1340475900000,v:-1},
      {t:1340476200000,v:-2},
      {t:1340476500000,v:-3},
      {t:1340476800000,v:-4},
      {t:1340477100000,v:-5},
    ],
    "rrd3" : [
      {t:1340474100000,v:5},
      {t:1340474400000,v:Number.NEGATIVE_INFINITY},
      {t:1340474700000,v:3},
      {t:1340475000000,v:NaN},
      {t:1340475300000,v:1},
      {t:1340475600000,v:0},
      {t:1340475900000,v:NaN},
      {t:1340476200000,v:-2},
      {t:1340476500000,v:-3},
      {t:1340476800000,v:Number.POSITIVE_INFINITY},
      {t:1340477100000,v:-5},
    ],
    "rrd4" : [
      {t:1340474100000,v:-5},
      {t:1340474400000,v:-4},
      {t:1340474700000,v:-3},
      {t:1340475000000,v:-2},
      {t:1340475300000,v:-1},
      {t:1340475600000,v:0},
      {t:1340475900000,v:NaN},
      {t:1340476200000,v:2},
      {t:1340476500000,v:3},
      {t:1340476800000,v:4},
      {t:1340477100000,v:5},
    ],
    "rrd5" : [
      {t:1340474100000,v:-5.32323},
      {t:1340474400000,v:-4.34262},
      {t:1340474700000,v:-3.6545},
      {t:1340475000000,v:-2.453},
      {t:1340475300000,v:-1},
      {t:1340475600000,v:0.44},
      {t:1340475900000,v:1.3453},
      {t:1340476200000,v:2.472},
      {t:1340476500000,v:3.985},
      {t:1340476800000,v:4.65},
      {t:1340477100000,v:5.456},
    ],
  };
};

function createDataFromConfig(config_string) {
  var config = new RRDGraph.Config(null, config_string);
  var data = new RRDGraph.Data({}, config);

  return data;
}

test('Copy', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:copy=rrd1 \\\n"
  );

  var data = createDataFromConfig(config_string);

  deepEqual(data.data.arrays.copy, data.data.arrays.rrd1, 'Simple copy of a DEF');
});

test('Single DEF, basic boolean operations', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=0,rrd1,GE,0,EQ \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:0},
    {t:1340474400000,v:0},
    {t:1340474700000,v:0},
    {t:1340475000000,v:0},
    {t:1340475300000,v:0},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:1},
    {t:1340476500000,v:1},
    {t:1340476800000,v:1},
    {t:1340477100000,v:1},
  ];

  deepEqual(data.data.arrays.result, expected, 'Different basic boolean operations (GE,EQ) on a single DEF');
});

test('Multiple DEFs, basic boolean operations', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "DEF:rrd2=\"rrd2\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,rrd2,LT,rrd1,NE \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:1},
    {t:1340474400000,v:1},
    {t:1340474700000,v:1},
    {t:1340475000000,v:1},
    {t:1340475300000,v:1},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:1},
    {t:1340476500000,v:1},
    {t:1340476800000,v:1},
    {t:1340477100000,v:1},
  ];

  deepEqual(data.data.arrays.result, expected, 'Different basic boolean operations (LT,NE) on multiple DEFs');
});

test('Single DEF, UN operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd3=\"rrd3\":long:AVERAGE \\\n" +
    "CDEF:result=rrd3,UN \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:0},
    {t:1340474400000,v:0},
    {t:1340474700000,v:0},
    {t:1340475000000,v:1},
    {t:1340475300000,v:0},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:0},
    {t:1340476500000,v:0},
    {t:1340476800000,v:0},
    {t:1340477100000,v:0},
  ];

  deepEqual(data.data.arrays.result, expected, 'Searches for unknowns in a single DEF');
});

test('Single DEF, ISINF operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd3=\"rrd3\":long:AVERAGE \\\n" +
    "CDEF:result=rrd3,ISINF \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:0},
    {t:1340474400000,v:1},
    {t:1340474700000,v:0},
    {t:1340475000000,v:0},
    {t:1340475300000,v:0},
    {t:1340475600000,v:0},
    {t:1340475900000,v:0},
    {t:1340476200000,v:0},
    {t:1340476500000,v:0},
    {t:1340476800000,v:1},
    {t:1340477100000,v:0},
  ];

  deepEqual(data.data.arrays.result, expected, 'Searches for positive and negative infinities in a single DEF');
});

test('Single DEF, IF operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=1,rrd1,0,IF,1,0,IF \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:1},
    {t:1340474400000,v:1},
    {t:1340474700000,v:1},
    {t:1340475000000,v:1},
    {t:1340475300000,v:1},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:1},
    {t:1340476500000,v:1},
    {t:1340476800000,v:1},
    {t:1340477100000,v:1},
  ];

  deepEqual(data.data.arrays.result, expected, 'Conditional operator');
});

test('Single DEF, MIN operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd3=\"rrd3\":long:AVERAGE \\\n" +
    "CDEF:result=rrd3,0,MIN \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:0},
    {t:1340474400000,v:Number.NEGATIVE_INFINITY},
    {t:1340474700000,v:0},
    {t:1340475000000,v:NaN},
    {t:1340475300000,v:0},
    {t:1340475600000,v:0},
    {t:1340475900000,v:NaN},
    {t:1340476200000,v:-2},
    {t:1340476500000,v:-3},
    {t:1340476800000,v:0},
    {t:1340477100000,v:-5},
  ];

  deepEqual(data.data.arrays.result, expected, 'Return the smaller element');
});

test('Single DEF, LIMIT operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,-2,2,LIMIT \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:NaN},
    {t:1340474400000,v:NaN},
    {t:1340474700000,v:NaN},
    {t:1340475000000,v:-2},
    {t:1340475300000,v:-1},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:2},
    {t:1340476500000,v:NaN},
    {t:1340476800000,v:NaN},
    {t:1340477100000,v:NaN},
  ];

  deepEqual(data.data.arrays.result, expected, 'Only values in the range -2 to 2 should be used');
});

test('Single DEF, basic arithmetic operations', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,10,+,5,-,2,*,2,/,2,% \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:0},
    {t:1340474400000,v:1},
    {t:1340474700000,v:0},
    {t:1340475000000,v:1},
    {t:1340475300000,v:0},
    {t:1340475600000,v:1},
    {t:1340475900000,v:0},
    {t:1340476200000,v:1},
    {t:1340476500000,v:0},
    {t:1340476800000,v:1},
    {t:1340477100000,v:0},
  ];

  deepEqual(data.data.arrays.result, expected, 'Different basic arithmetic operations (+,-,*,/,%) on a single DEF');
});

test('Multiple DEFs, basic arithmetic operations', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "DEF:rrd2=\"rrd2\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,rrd2,+,rrd2,- \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:-5},
    {t:1340474400000,v:-4},
    {t:1340474700000,v:-3},
    {t:1340475000000,v:-2},
    {t:1340475300000,v:-1},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:2},
    {t:1340476500000,v:3},
    {t:1340476800000,v:4},
    {t:1340477100000,v:5},
  ];

  deepEqual(data.data.arrays.result, expected, 'Different basic arithmetic operations (+,-) on multiple DEFs');
});

test('Multiple DEFs, ADDNAN operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd4=\"rrd4\":long:AVERAGE \\\n" +
    "DEF:rrd3=\"rrd3\":long:AVERAGE \\\n" +
    "CDEF:result=rrd4,rrd3,ADDNAN \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:0},
    {t:1340474400000,v:Number.NEGATIVE_INFINITY},
    {t:1340474700000,v:0},
    {t:1340475000000,v:-2},
    {t:1340475300000,v:0},
    {t:1340475600000,v:0},
    {t:1340475900000,v:NaN},
    {t:1340476200000,v:0},
    {t:1340476500000,v:0},
    {t:1340476800000,v:Number.POSITIVE_INFINITY},
    {t:1340477100000,v:0},
  ];

  deepEqual(data.data.arrays.result, expected, 'Add two DEFs, treating a single NaN as 0 (two NaNs give a NaN)');
});

test('Single DEF, SIN & COS operators', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,SIN,rrd1,COS,+ \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:Math.sin(-5) + Math.cos(-5)},
    {t:1340474400000,v:Math.sin(-4) + Math.cos(-4)},
    {t:1340474700000,v:Math.sin(-3) + Math.cos(-3)},
    {t:1340475000000,v:Math.sin(-2) + Math.cos(-2)},
    {t:1340475300000,v:Math.sin(-1) + Math.cos(-1)},
    {t:1340475600000,v:Math.sin(0) + Math.cos(0)},
    {t:1340475900000,v:Math.sin(1) + Math.cos(1)},
    {t:1340476200000,v:Math.sin(2) + Math.cos(2)},
    {t:1340476500000,v:Math.sin(3) + Math.cos(3)},
    {t:1340476800000,v:Math.sin(4) + Math.cos(4)},
    {t:1340477100000,v:Math.sin(5) + Math.cos(5)},
  ];

  deepEqual(data.data.arrays.result, expected, 'Sine and cosine operators on a single DEF');
});

test('Single DEF, LOG, EXP, SQRT & ATAN', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,LOG,EXP,SQRT,ATAN \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:Math.atan(Math.sqrt(Math.exp(Math.log(-5))))},
    {t:1340474400000,v:Math.atan(Math.sqrt(Math.exp(Math.log(-4))))},
    {t:1340474700000,v:Math.atan(Math.sqrt(Math.exp(Math.log(-3))))},
    {t:1340475000000,v:Math.atan(Math.sqrt(Math.exp(Math.log(-2))))},
    {t:1340475300000,v:Math.atan(Math.sqrt(Math.exp(Math.log(-1))))},
    {t:1340475600000,v:Math.atan(Math.sqrt(Math.exp(Math.log(0))))},
    {t:1340475900000,v:Math.atan(Math.sqrt(Math.exp(Math.log(1))))},
    {t:1340476200000,v:Math.atan(Math.sqrt(Math.exp(Math.log(2))))},
    {t:1340476500000,v:Math.atan(Math.sqrt(Math.exp(Math.log(3))))},
    {t:1340476800000,v:Math.atan(Math.sqrt(Math.exp(Math.log(4))))},
    {t:1340477100000,v:Math.atan(Math.sqrt(Math.exp(Math.log(5))))},
  ];

  deepEqual(data.data.arrays.result, expected, 'log, exp, sqrt and atan operators on a single DEF');
});

test('Single DEF, ATAN2 operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=2,rrd1,ATAN2 \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:Math.atan2(2,-5)},
    {t:1340474400000,v:Math.atan2(2,-4)},
    {t:1340474700000,v:Math.atan2(2,-3)},
    {t:1340475000000,v:Math.atan2(2,-2)},
    {t:1340475300000,v:Math.atan2(2,-1)},
    {t:1340475600000,v:Math.atan2(2,0)},
    {t:1340475900000,v:Math.atan2(2,1)},
    {t:1340476200000,v:Math.atan2(2,2)},
    {t:1340476500000,v:Math.atan2(2,3)},
    {t:1340476800000,v:Math.atan2(2,4)},
    {t:1340477100000,v:Math.atan2(2,5)},
  ];

  deepEqual(data.data.arrays.result, expected, 'atan2 on a single DEF');
});

test('Single DEF, FLOOR & CEIL operators', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd5=\"rrd5\":long:AVERAGE \\\n" +
    "CDEF:result=rrd5,FLOOR,rrd5,CEIL,+ \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:-11},
    {t:1340474400000,v:-9},
    {t:1340474700000,v:-7},
    {t:1340475000000,v:-5},
    {t:1340475300000,v:-2},
    {t:1340475600000,v:1},
    {t:1340475900000,v:3},
    {t:1340476200000,v:5},
    {t:1340476500000,v:7},
    {t:1340476800000,v:9},
    {t:1340477100000,v:11},
  ];

  deepEqual(data.data.arrays.result, expected, 'Rounding operations on a single DEF');
});

test('Single DEF, DEG2RAD & RAD2DEG operators', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,DEG2RAD,RAD2DEG \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:-5},
    {t:1340474400000,v:-4},
    {t:1340474700000,v:-3},
    {t:1340475000000,v:-2},
    {t:1340475300000,v:-1},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:2},
    {t:1340476500000,v:3},
    {t:1340476800000,v:4},
    {t:1340477100000,v:5},
  ];

  deepEqual(data.data.arrays.result, expected, 'Angle conversions on a single DEF');
});

test('Single DEF, ABS operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,ABS \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:5},
    {t:1340474400000,v:4},
    {t:1340474700000,v:3},
    {t:1340475000000,v:2},
    {t:1340475300000,v:1},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:2},
    {t:1340476500000,v:3},
    {t:1340476800000,v:4},
    {t:1340477100000,v:5},
  ];

  deepEqual(data.data.arrays.result, expected, 'Absolute values from a single DEF');
});

test('Single DEF, UNKN operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,UNKN,+ \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:NaN},
    {t:1340474400000,v:NaN},
    {t:1340474700000,v:NaN},
    {t:1340475000000,v:NaN},
    {t:1340475300000,v:NaN},
    {t:1340475600000,v:NaN},
    {t:1340475900000,v:NaN},
    {t:1340476200000,v:NaN},
    {t:1340476500000,v:NaN},
    {t:1340476800000,v:NaN},
    {t:1340477100000,v:NaN},
  ];

  deepEqual(data.data.arrays.result, expected, 'Add an unknown value to a single DEF');
});

test('Single DEF, INF operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,INF,+ \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:Number.POSITIVE_INFINITY},
    {t:1340474400000,v:Number.POSITIVE_INFINITY},
    {t:1340474700000,v:Number.POSITIVE_INFINITY},
    {t:1340475000000,v:Number.POSITIVE_INFINITY},
    {t:1340475300000,v:Number.POSITIVE_INFINITY},
    {t:1340475600000,v:Number.POSITIVE_INFINITY},
    {t:1340475900000,v:Number.POSITIVE_INFINITY},
    {t:1340476200000,v:Number.POSITIVE_INFINITY},
    {t:1340476500000,v:Number.POSITIVE_INFINITY},
    {t:1340476800000,v:Number.POSITIVE_INFINITY},
    {t:1340477100000,v:Number.POSITIVE_INFINITY},
  ];

  deepEqual(data.data.arrays.result, expected, 'Add positive infinity to a single DEF');
});

test('Single DEF, NEGINF operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,NEGINF,+ \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:Number.NEGATIVE_INFINITY},
    {t:1340474400000,v:Number.NEGATIVE_INFINITY},
    {t:1340474700000,v:Number.NEGATIVE_INFINITY},
    {t:1340475000000,v:Number.NEGATIVE_INFINITY},
    {t:1340475300000,v:Number.NEGATIVE_INFINITY},
    {t:1340475600000,v:Number.NEGATIVE_INFINITY},
    {t:1340475900000,v:Number.NEGATIVE_INFINITY},
    {t:1340476200000,v:Number.NEGATIVE_INFINITY},
    {t:1340476500000,v:Number.NEGATIVE_INFINITY},
    {t:1340476800000,v:Number.NEGATIVE_INFINITY},
    {t:1340477100000,v:Number.NEGATIVE_INFINITY},
  ];

  deepEqual(data.data.arrays.result, expected, 'Add negative infinity to a single DEF');
});

test('Single DEF, COUNT operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,COUNT \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:1},
    {t:1340474400000,v:2},
    {t:1340474700000,v:3},
    {t:1340475000000,v:4},
    {t:1340475300000,v:5},
    {t:1340475600000,v:6},
    {t:1340475900000,v:7},
    {t:1340476200000,v:8},
    {t:1340476500000,v:9},
    {t:1340476800000,v:10},
    {t:1340477100000,v:11},
  ];

  deepEqual(data.data.arrays.result, expected, 'Count values in a single DEF');
});

test('Single DEF, DUP operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,DUP,+ \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:-10},
    {t:1340474400000,v:-8},
    {t:1340474700000,v:-6},
    {t:1340475000000,v:-4},
    {t:1340475300000,v:-2},
    {t:1340475600000,v:0},
    {t:1340475900000,v:2},
    {t:1340476200000,v:4},
    {t:1340476500000,v:6},
    {t:1340476800000,v:8},
    {t:1340477100000,v:10},
  ];

  deepEqual(data.data.arrays.result, expected, 'Duplicate the top value on the stack');
});

test('Single DEF, POP operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,rrd1,rrd1,+,POP \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:-5},
    {t:1340474400000,v:-4},
    {t:1340474700000,v:-3},
    {t:1340475000000,v:-2},
    {t:1340475300000,v:-1},
    {t:1340475600000,v:0},
    {t:1340475900000,v:1},
    {t:1340476200000,v:2},
    {t:1340476500000,v:3},
    {t:1340476800000,v:4},
    {t:1340477100000,v:5},
  ];

  deepEqual(data.data.arrays.result, expected, 'Pop the top value on the stack');
});

test('Single DEF, EXC operator', function () {
  var config_string = (
    "/usr/bin/rrdtool graph example.png \\\n" +
    "DEF:rrd1=\"rrd1\":long:AVERAGE \\\n" +
    "CDEF:result=rrd1,1,EXC,+ \\\n"
  );

  var data = createDataFromConfig(config_string);

  var expected = [
    {t:1340474100000,v:-4},
    {t:1340474400000,v:-3},
    {t:1340474700000,v:-2},
    {t:1340475000000,v:-1},
    {t:1340475300000,v:0},
    {t:1340475600000,v:1},
    {t:1340475900000,v:2},
    {t:1340476200000,v:3},
    {t:1340476500000,v:4},
    {t:1340476800000,v:5},
    {t:1340477100000,v:6},
  ];

  deepEqual(data.data.arrays.result, expected, 'Switch the top values on the stack');
});
