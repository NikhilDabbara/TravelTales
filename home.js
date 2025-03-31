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

document.getElementById("search--btn").addEventListener("click", function(event) {
    event.preventDefault(); // Critical: Stops the link from jumping to "#"

    const age = prompt("Please enter your age:");
    
    // If user clicks "Cancel" or enters nothing
    if (age === null || age.trim() === "") {
      alert("Age is required to proceed.");
      return; // Exit the function
    }

    const ageNumber = parseInt(age);
    
    // If input is not a number
    if (isNaN(ageNumber)) {
      alert("Please enter a valid age (e.g., 25).");
      return;
    }

    // Store age (optional)
    localStorage.setItem("userAge", ageNumber);

    // Redirect logic
    if (ageNumber < 28) {
      window.location.href = "index_2.html"; // Under 28
    } else {
      window.location.href = "index_1.html"; // 28 or older
    }
  });