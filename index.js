

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

//get data
url = "https://api.covid19india.org/v4/min/timeseries.min.json"
var data = d3.json(url)

data.then((json)=> {

	
	var s1 = '2020-04-01';
	var d1 = new Date(s1);

	var d2 = d3.max(Object.keys(json["TT"]["dates"]), d => new Date(d));
	var max = d3.max(Object.values(json["TT"]["dates"]), d => d['total']['confirmed']-d['total']['recovered']-d['total']['deceased']);
	
	var maxT = d3.max(Object.values(json["TT"]["dates"]), d => d['total']['tested']);
	var dCount = d3.count(Object.keys(json["TT"]["dates"]), d => new Date(d));

	var margin  = {top: 30, right: 80, bottom: 40, left:80},
	width = 1000 - margin.left -margin.right,
	height = 450 - margin.top - margin.bottom;

	var svg = d3
	.select("svg")
	.attr('width', width + margin.left + margin.right)
	.attr('height', height*2 + margin.top*2 + margin.bottom)
	.append('g')
	.attr('transform','translate(' + margin.left + ',' + margin.top + ')');

	var  walk = [];

	var f=0,a=0,b=0,pos=0,l=0,d_rate=0,newC = 0;

	var color = '';

	//axes for first chart
	var x = d3.scaleTime()
	.domain([d1,d2])
	.range([0,width]).nice();

	svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

	var y = d3.scaleLinear()
	.domain([0,max])
	.range([height,0]).nice();

	svg.append("g")
	.call(d3.axisLeft(y));


	//plotting the the first chart
	while (d1.toISOString() != d2.toISOString()){
		
        var d4 = d1.toISOString().substring(0, 10)

		key2 = 'dates'
       	key4 ='total'
        key5 ='confirmed'
        key6 = 'recovered'
        key7 = 'deceased'
     
        var conf = json["TT"][key2][d4][key4][key5]
        var rec = json["TT"][key2][d4][key4][key6]
        var dec = json["TT"][key2][d4][key4][key7]
        var test = json["TT"][key2][d4][key4]['tested']
     	

        var active = conf - rec - dec 

        svg
		.append("circle")
		.attr('cx', x(d1))
		.attr('cy', y(active))
		.attr("r", 1.5)
        .attr("fill", "#696969")
        ;

  		
        l = walk.length;
  		
  		

  		if (l==0){
			pos = 100*(conf/test)
			d_rate = 100*(dec/conf)
			newC = conf};

  		if (l>0){
  			if(test - walk[l-1].tested == 0){pos = 0;}
  			else{
  			pos = 100*(conf-walk[l-1].confirmed)/(test - walk[l-1].tested)
  			d_rate = 100*(dec-walk[l-1].dec)/(conf - walk[l-1].confirmed)
  			newC = conf - walk[l-1].confirmed ;}};
        

        var dp = {
        	step:d1, 
        	dec:dec, 
        	tested: test, 
        	confirmed: conf, 
        	positive: pos,
        	d_rate:d_rate, 
        	new: newC};
        
        walk.push(dp);


        var c=x(d1), d=y(active), d_1 = y(dec);


    	if(b<d){color = '#1fa385'};//green
    	if(b>=d){color = '#b30000'};//red

    	if( f==1){
			svg
    		.append('path')
    		.attr("fill", "none")
    		.attr("stroke", color)
    		.attr("stroke-width", 4)
    		.attr('d',d3.line()([[a,b], [c, d]]))
    		.append('title')
        	.text(d4 + " : " + active);

    		svg
			.append("rect")
			.attr('x', x(d1))
			.attr('y', y(newC))
			.attr('height', y(0)-y(newC))
			.attr('width', width/dCount)
        	.attr("fill", "#696969")
        	.append('title')
        	.text(d4 + " : " + newC)
        	;

    	};

    	f=1
    	var a = x(d1),
    	b=y(active),
    	b1=y(dec);

        d1=d1.addDays(1);
	
    }

 //defining axes for second chart
	var y2 = d3.scaleLog()
	.domain([500,maxT])
	.range([height,0]).nice();

	var y3 = d3.scaleLinear()
	.domain([0,50])
	.range([height,0]);

	svg.append("g")
	.attr("transform", "translate(" + width + "," + (height+margin.top) +" )")
	.call(d3.axisRight(y3));

	svg.append("g")
	.attr("transform", "translate(" + 0 + "," + (height+margin.top) +" )")
	.call(d3.axisLeft(y2));

	svg.append("g")
    .attr("transform", "translate(0," + (margin.top+height*2) + ")")
    .call(d3.axisBottom(x));


//plotting the second chart
    svg.append("path")
      .datum(walk)
      .attr("fill", "tomato")
      .attr("transform", "translate(" + 0 + "," + (height+margin.top) +" )")
      .attr('fill-opacity', 0.5)
      .attr("d", d3.area()
    .x(d => x(d.step))
    .y0(y(0))
    .y1(d => y2(d.dec)))
     ;

      svg.append("path")
      .datum(walk)
      .attr("fill", "tomato")
      .attr("transform", "translate(" + 0 + "," + (height+margin.top) +" )")
      .attr('fill-opacity', 0.35)
      .attr("d", d3.area()
    .x(d => x(d.step))
    .y0(y(0))
    .y1(d => y2(d.confirmed)));


      svg.append("path")
      .datum(walk)
      .attr("fill", "tomato")
      .attr("transform", "translate(" + 0 + "," + (height+margin.top) +" )")
      .attr('fill-opacity', 0.2)
      .attr("d", d3.area()
    .x(d => x(d.step))
    .y0(y(0))
    .y1(d => y2(d.tested)));

      svg.append("path")
      .datum(walk)
      .attr("fill", "none")
      .attr("transform", "translate(" + 0 + "," + (height+margin.top) +" )")
      .attr("stroke", "#606060")
    	.attr("stroke-width", 1.5)
      .attr("d", d3.line()
    .x(d => x(d.step))
    .y(d => y3(d.positive)));

      svg.append("path")
      .datum(walk)
      .attr("fill", "none")
      .attr("transform", "translate(" + 0 + "," + (height+margin.top) +" )")
      .attr("stroke", "	#202020")
    	.attr("stroke-width", 1.5)
      .attr("d", d3.line()
    .x(d => x(d.step))
    .y(d => y3(d.d_rate)));


    function make_y_gridlines() {		
    return d3.axisLeft(y2)
        .ticks(7)
	}

// making the gridlines
	t = (y2.ticks().length - 1)/9;
	b=(height+margin.top)+height/t;
	h = (height*2)+margin.top

	while(b < h){
		a=0;
		c=width;
		d=b;

		svg
    	.append('path')
    	.attr("opacity", "0.5")
    	.attr("stroke", "#e62200")
    	.style("stroke-dasharray", ("2, 4"))
    	.attr("stroke-width", 1)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    	b+=height/t;
    	d+=height/t;
    }

// Adding Legends
	svg
		.append("circle")
		.attr('cx', margin.left/2)
		.attr('cy', margin.top/2)
		.attr("r", 2)
        .attr("fill", "#696969")


    a=margin.left/2 - 5
    c=margin.left/2 
    b=d=margin.top/2

    svg
    	.append('path')
    	.attr("opacity", 0.9)
    	.attr("fill", "none")
    	.attr("stroke", '#b30000')
    	.attr("stroke-width", 4)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    a=margin.left/2 
    c=margin.left/2 + 5
    svg
    	.append('path')
    	.attr("opacity", 0.9)
    	.attr("fill", "none")
    	.attr("stroke", '#1fa385')
    	.attr("stroke-width", 4)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    svg
    	.append('text')
    	.attr('x', margin.left/2 + 20)
    	.attr('y', margin.top/2+4)
    	.attr('class','legend')
    	.text('Active Cases');

    a=margin.left/2
    c=margin.left/2 
    b=margin.top/2 + 15
    d=margin.top/2 + 20
    svg
    	.append('path')
    	.attr("opacity", 0.9)
    	.attr("fill", "none")
    	.attr("stroke", "#696969")
    	.attr("stroke-width", 3)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    svg
    	.append('text')
    	.attr('x', margin.left/2 + 20)
    	.attr('y', margin.top/2+20)
    	.attr('class','legend')
    	.text('Daily New Cases');

    b=(margin.top) + 5+ height
    d=(margin.top) + 10 + height

    svg
    	.append('path')
    	.attr("opacity", 0.2)
    	.attr("fill", "none")
    	.attr("stroke", "tomato")
    	.attr("stroke-width", 8)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    svg
    	.append('text')
    	.attr('x', margin.left/2 + 20)
    	.attr('y', margin.top+10+height)
    	.attr('class','legend')
    	.text('Tested till date');

    b=(margin.top) + 20+ height
    d=(margin.top) + 25 + height

    svg
    	.append('path')
    	.attr("opacity", 0.4)
    	.attr("fill", "none")
    	.attr("stroke", "tomato")
    	.attr("stroke-width", 8)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    svg
    	.append('text')
    	.attr('x', margin.left/2 + 20)
    	.attr('y', margin.top+25+height)
    	.attr('class','legend')
    	.text('Confirmed cases');

    b=(margin.top) + 35+ height
    d=(margin.top) + 40 + height

    svg
    	.append('path')
    	.attr("opacity", 0.6)
    	.attr("fill", "none")
    	.attr("stroke", "tomato")
    	.attr("stroke-width", 8)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    svg
    	.append('text')
    	.attr('x', margin.left/2 + 20)
    	.attr('y', margin.top+40+height)
    	.attr('class','legend')
    	.text('Deaths');

    b=(margin.top) + 65+ height
    d=(margin.top) + 65 + height
    a=margin.left/2 -5
    c=margin.left/2 + 5

    svg
    	.append('path')
    	.attr("fill", "none")
    	.attr("stroke", "#606060")
    	.attr("stroke-width", 2)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    svg
    	.append('text')
    	.attr('x', margin.left/2 + 20)
    	.attr('y', margin.top+70+height)
    	.attr('class','legend')
    	.text('Poitivity Rate');


    b=(margin.top) + 80+ height
    d=(margin.top) + 80 + height
    a=margin.left/2 -5
    c=margin.left/2 + 5

    svg
    	.append('path')
    	.attr("fill", "none")
    	.attr("stroke", "#202020")
    	.attr("stroke-width", 2)
    	.attr('d',d3.line()([[a,b], [c, d]]));

    svg
    	.append('text')
    	.attr('x', margin.left/2 + 20)
    	.attr('y', margin.top+85+height)
    	.attr('class','legend')
    	.text('Mortality Rate');

    a = width + 40
    b = (margin.top*3)+(height*1.5)
    svg
    	.append('text')
    	.attr("transform", "rotate(-90"+ "," +a+ "," +b+ ")")
    	.attr('x', a)
    	.attr('y', b)
    	.attr('class','legend')
    	.text('Positivity / Mortality Rate');

});


















