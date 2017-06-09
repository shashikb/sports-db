function searchLastName(e) {
  var searchContent = $('#searchContent').val();
  $.post( "/search-lastname", function( data ) {
    console.log(data);
  });
}
// 
// var editBtn = document.getElementById('editBtn');
// var firstName = document.getElementById('first-name-field');
// var lastName = document.getElementById('last-name-field');
// var ageField = document.getElementById('age-field');
// var weightField = document.getElementById('weight-field');
// var heightField = document.getElementById('height-field');
// var salaryField = document.getElementById('salary')
// editBtn.addEventListener('click', function(e) {
// 		var dataObj = {
// 			fname: ,
// 			name: nameField.value,
// 			reps: repsField.value,
// 			weight: weightField.value,
// 			date: dateField.value,
// 			lbs: lbsField.value
// 		};
//
// 		var http = new XMLHttpRequest();
// 		http.open('put', '/update', true);
// 		http.setRequestHeader('Content-Type', 'application/json');
// 		http.send(JSON.stringify(dataObj));
//
// 	})
