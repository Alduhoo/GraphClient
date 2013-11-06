var sigInst;
var currentEdge;
var isPlaying;
var intervalID;

/**
 * Initializes the graph, reads GEXF file and stores the graph in sigInst variable
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
    sideMargin: 50
  }).mouseProperties({
    maxRatio: 32
  });

  // Parse a GEXF encoded file to fill the graph
  // (requires "sigma.parseGexf.js" to be included)
  sigInst.parseGexf('xml/test.gexf');

  // Set starting edge to 1
  currentEdge = 1;
  // Start with the animation paused
  isPlaying = false;
  // Draw the initial state of the graph
  update2();
}

if (document.addEventListener) {
  document.addEventListener("DOMContentLoaded", init, false);
} else {
  window.onload = init;
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
  var fecha = document.getElementById('date').value.split('-');

  return fecha[1] + "/" + fecha[2] + "/" + fecha[0];
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
 */
function filter(filterDate) {
  sigInst.iterNodes(function(node) {
    var date = parseDate(getAttr(node, 'Born'));

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
    var date = parseDate(getAttr(edge, 'Born'));

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
    var date = parseDate(getAttr(edge, 'Born'));

    filter(date);
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
  var date = parseDate(getAttr(sigInst.getEdges(currentEdge), 'Born'));

  document.getElementById('currentEdge').innerHTML = currentEdge;
  document.getElementById('date').innerHTML = date;
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
  update2();
}

/**
 * Resets current edge to 1
 */
function reset() {
  currentEdge = 1;
  update2();
}

/**
 * Advances to next edge every second or stops animation if already playing
 */
function play() {
  if (isPlaying) {
    // stop playing
    clearInterval(intervalID);

    document.getElementById('play').innerHTML = 'Play';
  } else {
    // start playing
    intervalID = setInterval(
      function() {
        next();
      },
      1000);

    document.getElementById('play').innerHTML = 'Pause';
  }
  isPlaying = !isPlaying;
}