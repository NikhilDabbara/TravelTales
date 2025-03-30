// Add an event listener to the search link
document.getElementById('search--btn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default link behavior

    // Get the search term
    var searchTerm = document.getElementById('destination').value;

    // Redirect to the results page with the search term as a URL parameter
    if (searchTerm) {
        window.location.href = 'index_1.html?search=' + encodeURIComponent(searchTerm);
    } else {
        alert('Please enter a search term.'); // Optional: Alert if the search term is empty
    }
});

