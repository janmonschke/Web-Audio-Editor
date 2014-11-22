var paper = Snap("#playground");

var createNode = function(paper, topX, topY){
  var rectWidth = 100;
  var rectHeight = 100;

  var outerRect = paper.rect(topX, topY, rectWidth, rectHeight, 5, 5).attr({
    fill: 'rgba(0,0,0,.2)',
    stroke: 'rgba(0,0,0,.5)',
    strokeWidth: 2
  });

  var circleRadius = 10;
  var rectHorizontalMiddle = topY + (rectHeight / 2) - (circleRadius / 2);

  var input = paper.circle(topX, rectHorizontalMiddle, circleRadius);
  var output = paper.circle((topX + rectWidth), rectHorizontalMiddle, circleRadius);

  var group = paper.group(outerRect, input, output)

  return {
    rect: outerRect,
    group: group,
    input: input,
    output: output
  };
}

var node1 = createNode(paper, 10, 10);
var node2 = createNode(paper, 200, 200);

node1.input.click(function(){
  console.log('clicked my input');
});

var updateLine = function(){
  var bb1 = node1.output.getBBox();
  var bb2 = node2.input.getBBox();
  paper.line(bb1.x, bb1.y, bb2.x, bb2.y).attr({
    strokeWidth: 2,
    stroke: '#000'
  });
};

node1.group.drag();
node2.group.drag();

updateLine();