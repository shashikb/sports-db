function searchLastName(e) {
  var searchContent = $('#searchContent').val();
  $.post( "/search-lastname", function( data ) {
    console.log(data);
  });
}
