var sigInst;

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
 * Filter's the graph's nodes and edges according to the current date
 */
function filter() {
  var filterDate = parseDate(getDate());

  sigInst.iterNodes(function(node) {
    var date = parseDate(getAttr(node, 'Born'));

    console.log(node);
    console.log(date);
    console.log(filterDate);

    if (filterDate >= date) {
      node.hidden = 0;
    } else {
      node.hidden = 1;
    }
  });

  sigInst.iterEdges(function(edge) {
    var date = parseDate(getAttr(edge, 'Born'));

    console.log(edge);
    console.log(date);
    console.log(filterDate);

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
  filter();
  draw();
}