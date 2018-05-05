var paginationEl = d3.select("#pagination");
var countEl = d3.select("#count");

var table = d3.select("#ufo-table");
var loader = d3.select("#loader");

// get data from jsonblob
var url = "https://jsonblob.com/api/jsonBlob/4176e27b-4313-11e8-a75a-d5a15cebc6ed"

showLoader();

// get data for page
d3.json(url, init);

//  event listeners to the pagination element
paginationEl.on("click", changePage);


var filters = {};


d3.selectAll(".filter").on("change", function(event) {
  var changedElement = d3.event.target;
  var filterId = changedElement.id;
  var value = changedElement.value.trim();

  if (value) {
    filters[filterId] = value;
  }
  else {
    delete filters[filterId];
  }

  refreshTable();
});


var data = {
    filter: function() {
    //  returns a new array
    this.filtered = this.dataSet.filter(function(ufoRecord) {
      var matchesFilters = true;

      // loop through filters
      Object.entries(filters).forEach(function(entry) {
        var filterId = entry[0];
        var filterValue = entry[1];

        // record doesn't match, flag it
        if (!fuzzyMatches(filterValue, ufoRecord[filterId])) {
          matchesFilters = false;
        }
      });
      // if never false, still true
      return matchesFilters;
    });
  }
};


function fuzzyMatches(search, result) {
  // Trimming result
    var slicedResult = result.slice(0, search.length);

  return search === slicedResult;
}


var page = {
  currentPage: 1,
    numPages: function() {
    return Math.ceil(data.filtered.length / this.resultsPerPage());
  },
  // returns value of dropdown
  resultsPerPage: function() {
    return countEl.property("value").trim();
  },
    getPageSubset: function() {
    var counter;
    if (this.currentPage < 11) {
      counter = 1;
    }
    else if (this.currentPage % 10 === 0) {
      counter = this.currentPage - 9;
    }
    else {
      counter = Math.floor(this.currentPage / 10) * 10 + 1;
    }
    var pageNumbers = [counter];
    counter++;
    while (pageNumbers[pageNumbers.length - 1] < this.numPages() && pageNumbers.length < 10) {
      pageNumbers.push(counter);
      counter++;
    }
    return pageNumbers;
  },
  paginate: function(array, pageSize, pageNumber) {
    pageNumber--;
    return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
  }
};

function init(dataSet) {

  data.dataSet = dataSet;
  data.filtered = dataSet;

  loadDropdown();
  loadTable();
  appendPagination();
}

function refreshTable() {
  data.filter();

  loadTable();

  appendPagination();
}

function loadDropdown() {
  
  var dropdownOptions = {
    country: ["<option default value=''>all</option>"],
    shape: ["<option default value=''>all</option>"]
  };

  var countryDropdown = d3.select("#country");
  var shapeDropdown = d3.select("#shape");

  
  var optionKeys = Object.keys(dropdownOptions);

    for (var i = 0; i < data.dataSet.length; i++) {
    var ufoData = data.dataSet[i];
    for (var j = 0; j < optionKeys.length; j++) {
      var dropdownOption = optionKeys[j];
      var optionHTML = "<option value='" + ufoData[dropdownOption] + "'>" + ufoData[dropdownOption] + "</option>";
          }
  }
    countryDropdown.html(dropdownOptions.country.join(""));
  shapeDropdown.html(dropdownOptions.shape.join(""));
}

function changePage(event) {
  d3.event.preventDefault();
  var paginationBtn = d3.event.target;
  var newPageNumber = parseInt(paginationBtn.getAttribute("href"));

  
  if (newPageNumber < 1 || newPageNumber > page.numPages()) {
    return false;
  }
  page.currentPage = newPageNumber;
  if (paginationBtn.className === "page-direction") {
    appendPagination();
  }
  else {
    setActivePage();
  }
  return loadTable();
}




function appendPagination() {
  var pageSubset = page.getPageSubset();

  
  paginationEl
    .html("")
    .append("li")
      .append("a")
        .attr("class", "page-direction")
        .attr("href", pageSubset[0] - 1)
        .html("<");

  for (var i = 0; i < pageSubset.length; i++) {
    var currentPage = pageSubset[i];

    paginationEl
      .append("li")
        .append("a")
          .attr("class", "page-direction")
          .attr("href", currentPage)
          .classed("active", currentPage === page.currentPage)
          .html(currentPage);
  }

  paginationEl
    .append("li")
      .append("a")
        .attr("class", "page-direction")
        .attr("href", pageSubset[0] + pageSubset.length)
        .html(">");
}

function loadTable() {
  var tbody = d3.select("tbody")
    .html("");

  showLoader();

  var resultsThisPage = page.paginate(
    data.filtered,
    page.resultsPerPage(),
    page.currentPage
  );

  for (var i = 0; i < resultsThisPage.length; i++) {
    var ufoObject = resultsThisPage[i];
    var ufoKeys = Object.keys(ufoObject);

    var row = tbody.append("tr")
      .classed("table-row", true);

    for (var j = 0; j < ufoKeys.length; j++) {
      var currentKey = ufoKeys[j];

      row.append("td")
        .html(ufoObject[currentKey])
        .classed("text-center", true);
    }
  }

  hideLoader();
}

function showLoader() {
  table.style("visibility", "hidden");
  loader.style("display", "block");
}

function hideLoader() {
  table.style("visibility", "visible");
  loader.style("display", "none");
}