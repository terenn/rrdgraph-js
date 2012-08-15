/usr/bin/rrdtool graph reference.daily.png \
 --slope-mode \
 --imgformat=PNG \
 --start=1340398800 \
 --end=1340485200 \
 --title="Test (daily)" \
 --rigid \
 --height=200 \
 --width=500 \
 --vertical-label="C" \
 --watermark="This is the watermark" \
 DEF:b="example.rrd":temp:AVERAGE \
 CDEF:b1=b,1,+ \
 CDEF:c=b,FLOOR,b,SIN,- \
 CDEF:d=c,12,GT \
 VDEF:b_avg=b,AVERAGE \
 TEXTALIGN:left \
 AREA:c#000099:"Magic" \
 LINE1:b#009900:"Outdoors "  \
 GPRINT:b:LAST:" Cur\:%8.2lf"  \
 GPRINT:b:AVERAGE:"Avg\:%8.2lf "  \
 GPRINT:b:MIN:"Min\:%8.2lf "  \
 GPRINT:b:MAX:"Max\:%8.2lf \\l" \
 LINE1:b1#990000:"Outdoors + 1" \
 TICK:d#660099:0.1:">12C" \
 HRULE:b_avg#bb4499:"Average":dashes=10,2,5,5

/usr/bin/rrdtool graph reference.weekly.png \
 --slope-mode \
 --imgformat=PNG \
 --start=1339880400 \
 --end=1340485200 \
 --title="Test (weekly)" \
 --rigid \
 --height=200 \
 --width=500 \
 --vertical-label="C" \
 --watermark="This is the watermark" \
 DEF:b="example.rrd":temp:AVERAGE \
 LINE1:b#009900:"Outdoors   "  \
 GPRINT:b:LAST:" Cur\:%8.2lf "  \
 GPRINT:b:AVERAGE:"Avg\:%8.2lf "  \
 GPRINT:b:MIN:"Min\:%8.2lf "  \
 GPRINT:b:MAX:"Max\:%8.2lf \n" \
 CDEF:c=b,FLOOR,b,SIN,- \
 LINE1:c#000099:"Magic" \
 #CDEF:b1=b,1,+ \
 #LINE1:b1#990000:"Outdoors+1"  \

/usr/bin/rrdtool graph reference.monthly.png \
 --slope-mode \
 --imgformat=PNG \
 --start=1337893200 \
 --end=1340485200 \
 --title="Test (monthly)" \
 --rigid \
 --height=200 \
 --width=500 \
 --vertical-label="C" \
 --watermark="This is the watermark" \
 DEF:b="example.rrd":temp:AVERAGE \
 LINE1:b#009900:"Outdoors   "  \
 GPRINT:b:LAST:" Cur\:%8.2lf "  \
 GPRINT:b:AVERAGE:"Avg\:%8.2lf "  \
 GPRINT:b:MIN:"Min\:%8.2lf "  \
 GPRINT:b:MAX:"Max\:%8.2lf \n" \
 CDEF:c=b,FLOOR,b,SIN,- \
 LINE1:c#000099:"Magic" \
 #CDEF:b1=b,1,+ \
 #LINE1:b1#990000:"Outdoors+1"  \

/usr/bin/rrdtool graph reference.yearly.png \
 --slope-mode \
 --imgformat=PNG \
 --start=1308949200 \
 --end=1340485200 \
 --title="Test (yearly)" \
 --rigid \
 --height=200 \
 --width=500 \
 --vertical-label="C" \
 --watermark="This is the watermark" \
 DEF:b="example.rrd":temp:AVERAGE \
 LINE1:b#009900:"Outdoors   "  \
 GPRINT:b:LAST:" Cur\:%8.2lf "  \
 GPRINT:b:AVERAGE:"Avg\:%8.2lf "  \
 GPRINT:b:MIN:"Min\:%8.2lf "  \
 GPRINT:b:MAX:"Max\:%8.2lf \n" \
 CDEF:c=b,FLOOR,b,SIN,- \
 LINE1:c#000099:"Magic" \
 #CDEF:b1=b,1,+ \
 #LINE1:b1#990000:"Outdoors+1"  \

