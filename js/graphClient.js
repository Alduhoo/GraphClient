var filterAttribute = '0';
var numEdges = 0;
var greyColor = '#666';

/**
 * Initializes the graph, reads GEXF file and stores the graph in sigInst
 * variable
 */
function init() {
  // Instanciate sigma.js and customize rendering :
  sigInst = sigma.init(document.getElementById('sigma')).drawingProperties({
    defaultLabelColor: '#fff',
    defaultLabelSize: 14,
    defaultLabelBGColor: '#fff',
    defaultLabelHoverColor: '#000',
    labelThreshold: 6,
    defaultEdgeType: 'curve'
  }).graphProperties({
    minNodeSize: 0.5,
    maxNodeSize: 5,
    minEdgeSize: 1,
    maxEdgeSize: 1,
    sideMargin: 50,
  }).mouseProperties({
    maxRatio: 32
  });

  // Parse a GEXF encoded file to fill the graph
  // (requires "sigma.parseGexf.js" to be included)
  sigInst.parseGexf('xml/red_politica_mex.gexf');

  /**
   * Now, here is the code that shows the popup :
   */
  var popUp;

  // This function is used to generate the attributes list from the node
  // attributes. Since the graph comes from GEXF, the attibutes look like:
  // [
  //   { attr: 'Lorem', val: '42' },
  //   { attr: 'Ipsum', val: 'dolores' },
  //   ...
  //   { attr: 'Sit',   val: 'amet' }
  // ]
  /*
  function attributesToString(attr) {
    return '' +
      attr.map(function(o){
        return '' + o.attr + ' : ' + o.val + '';
      }).join('') +
      '';
  }
  */
  function attributesToString(attr) {
    var result = "Attributes:</br>";
    var filterDate = parseDate(getDate());

    for (var i = 1; i < attr.length; i += 2) {
      var date = attr[i - 1];
      var value = attr[i];

      if (parseDate(date.val) <= filterDate) {
        result += '<li>' + date.val + ': ' + value.val + '</li>';
      }
    }

    // console.log(result);
    return result;
  }

  function showNodeInfo(event) {
    try {
        window.clearTimeout(popupID);
    } catch (err) {
      console.log("Found the following error: " + err);
    }
    popUp && popUp.remove();

    var node;
    var edgeLabel;
    sigInst.iterNodes(function(n){
      node = n;
      edgeLabel = getEdges(n);
    },[event.content[0]]);

    popUp = $(
      '<div class="node-info-popup"></div>'
    ).append(
      // The GEXF parser stores all the attributes in an array named
      // 'attributes'. And since sigma.js does not recognize the key
      // 'attributes' (unlike the keys 'label', 'color', 'size' etc),
      // it stores it in the node 'attr' object :
      attributesToString( node['attr']['attributes'] )
    ).attr(
      'id',
      'node-info'+sigInst.getID()
    ).css({
      'display': 'inline-block',
      'border-radius': 3,
      'padding': 5,
      'background': '#fff',
      'color': '#000',
      'box-shadow': '0 0 4px #666',
      'position': 'relative',
      'left': node.displayX,
      'top': node.displayY+15,
      'width': '400px',
      'max-height': '200px',
      'overflow-y': 'scroll'
    });

    if (edgeLabel.length > 0) {
      popUp.append("Links:</br>" + edgeLabel);
    }

    $('ul',popUp).css('margin','0 0 0 20px');

    $('#sigma').append(popUp);

    // grey out
    var nodes = event.content;
        var neighbors = {};
        sigInst.iterEdges(function(e){
          if(nodes.indexOf(e.source)<0 && nodes.indexOf(e.target)<0){
            if(!e.attr['grey']){
              e.attr['true_color'] = e.color;
              e.color = greyColor;
              e.attr['grey'] = 1;
            }
          }else{
            e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
            e.attr['grey'] = 0;

            neighbors[e.source] = 1;
            neighbors[e.target] = 1;
          }
        }).iterNodes(function(n){
          if(!neighbors[n.id]){
            if(!n.attr['grey']){
              n.attr['true_color'] = n.color;
              n.color = greyColor;
              n.attr['grey'] = 1;
            }
          }else{
            n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
            n.attr['grey'] = 0;
          }
        }).draw(2,2,2);
  }

  function hideNodeInfo(event) {
    popUp && popUp.remove();
    popUp = false;
  }

  function greyIn(event) {
    // grey out
    sigInst.iterEdges(function(e){
      e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
      e.attr['grey'] = 0;
    }).iterNodes(function(n){
      // n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
      n.color = '#000';
      n.attr['grey'] = 0;
    }).draw(2,2,2);
    // remove popup after specified time in ms
    popupID = window.setTimeout(removePopUp, 2000);
    // removePopUp();
  }

  sigInst.bind('downnodes',showNodeInfo).bind('outnodes', greyIn).draw();

  // Set starting edge to 1
  currentEdge = 0;
  // Set max edges to slider
  numEdges = sigInst.getEdgesCount();
  $('#slider').attr('max', numEdges);
  // Start with the animation paused
  isPlaying = false;
  // Draw the initial state of the graph
  update2();
}

/**
 * Re-draws the graph
 */
function draw() {
  sigInst.draw();
}

/**
 * Get's the current date selected by the date input
 * @return {string}
 */
function getDate() {
  // var fecha = document.getElementById('date').value.split('-');
  var edge = sigInst.getEdges(currentEdge);
  return getAttr(edge, filterAttribute);
}

/**
 * Parses a date into a JS date object
 * @param  {string} date
 * @return {JavaScript Date}
 */
function parseDate(date) {
  var fecha = date.split('/');
  return new Date(fecha[2], fecha[0] - 1, fecha[1]);
}

/**
 * Filter's the graph's nodes and edges according to the supplied date
 * @param  {JavaScript Date} filterDate
 *
function filter(filterDate) {
  sigInst.iterNodes(function(node) {
    var date = parseDate(getAttr(node, filterAttribute));

    // console.log(node);
    // console.log(date);
    // console.log(filterDate);

    if (filterDate >= date) {
      node.hidden = 0;
    } else {
      node.hidden = 1;
    }
  });

  sigInst.iterEdges(function(edge) {
    var date = parseDate(getAttr(edge, filterAttribute));

    // console.log(edge);
    // console.log(date);
    // console.log(filterDate);

    if (filterDate >= date) {
      edge.hidden = 0;
    } else {
      edge.hidden = 1;
    }
  });
}
*/
/**
 * Get's the value of the specified node's or edge's attribute
 * @param  {Node/Edge} node
 * @param  {string} attr
 * @return {string}
 */
function getAttr(node, attr) {
  var result = "";

  node.attr.attributes.forEach(function (a) {
    if (a.attr == attr) {
      result = a.val;
      return;
    }
  });

  return result;
}

/**
 * Updates the whole page, first filters according to current date, then
 * re-draws graph
 */
function update() {
  var filterDate = parseDate(getDate());

  filter(filterDate);
  draw();
}

/**
 * Filters the graph up to the specified edge number
 * @param  {int} edgeNumber
 */
function filterUpToEdge(edgeNumber) {
  try {
    var edge = sigInst.getEdges(edgeNumber);
    var date = parseDate(getAttr(edge, filterAttribute));

    // filter(date);

    // hide every node
    sigInst.iterNodes(function(node) {
      node.hidden = 1;
    });
    // iterate edges
    sigInst.iterEdges(function (edge) {
      if (parseInt(edge.id) <= edgeNumber) {
        var edges = [edge.source, edge.target];
        sigInst.iterNodes(function (node) {
          node.hidden = 0;
          // console.log(node);
        }, edges);
      }
    });
  } catch (err) {
    console.log("Found the following error: " + err);
    reset();
  }
}

/**
 * Updates the whole page, first filters to current edge, then re-draws graph
 * @return {[type]}
 */
function update2() {
  filterUpToEdge(currentEdge);
  draw();

  // update UI
  var date = parseDate(getAttr(sigInst.getEdges(currentEdge), filterAttribute));

  // document.getElementById('currentEdge').innerHTML = currentEdge;
  document.getElementById('date-banner').innerHTML = date.toDateString();
  $('#slider').val(currentEdge);
}

/**
 * Sets the next edge
 */
function next() {
  currentEdge++;
  update2();
}

/**
 * Sets the previous edge
 */
function prev() {
  currentEdge--;
  if (currentEdge < 0) {
    currentEdge = numEdges - 1;
  }
  update2();
}

/**
 * Resets current edge to 1
 */
function reset() {
  currentEdge = 0;
  update2();
}

/**
 * Advances to next edge every second or stops animation if already playing
 */
function play() {
  if (isPlaying) {
    // stop playing
    clearInterval(intervalID);

    document.getElementById('play').innerHTML = '<img src="images/play.png"height="40"alt="Play">';
  } else {
    // start playing
    intervalID = setInterval(
      function() {
        next();
      },
      1000);

    document.getElementById('play').innerHTML = '<img src="images/pause.png"height="40"alt="Pause">';
  }
  isPlaying = !isPlaying;
}

/**
 * Function that handles onmouseup event for the slider, gets its new value and
 * sets the currentEdge to that value
 */
function slider() {
  var value = $('#slider').val();

  // console.log(value);
  currentEdge = value;
  update2();
}

function getEdges(node) {
  var result = "";
  var filterDate = parseDate(getDate());

  // console.log(node.id + " is being hovered");

  sigInst.iterEdges(function(edge) {
    if (edge.source == node.id || edge.target == node.id) {
      if (parseDate(getAttr(edge, filterAttribute)) <= filterDate &&
          !sigInst.getNodes(edge.target).hidden &&
          !sigInst.getNodes(edge.source).hidden) {
        var target = sigInst.getNodes(edge.target);
        var source = sigInst.getNodes(edge.source);
        if (node.id == target.id) {
          result += '<li>con ' + source.label + ' ';
        } else {
          result += '<li>con ' + target.label + ' ';
        }

        result += '(' + getAttr(edge, filterAttribute) + '): ' + edge.label + '</li>';
        // console.log(edge);
        // console.log(edge.source + "->" + edge.target);
      }
    }
  });

  // console.log(result);
  return result;
}

function removePopUp()
{
  var popUp = $('.node-info-popup');
  popUp.remove();
}