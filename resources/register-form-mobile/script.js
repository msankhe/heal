var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var pickerDefault = new Pikaday(
    {
        field: document.getElementById('expected'),
        theme: 'triangle-theme',
        minDate: new Date()
    });


function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}
function loadData() {
    let dataString = localStorage.getItem("healUserDetails");

    if (dataString != null) {
        let data = JSON.parse(dataString);

        if (data.name) {
            let nameInput = document.getElementById("name");
            nameInput.value = data.name;
            validateInput(nameInput);
        }

        if (data.id) {
            let idInput = document.getElementById("id");
            idInput.value = data.id;
            validateInput(idInput);
        }

        if (data.email) {
            let idInput = document.getElementById("email");
            idInput.value = data.email;
            validateInput(idInput);
        }
    }

    if (Number(getQueryVariable('showtemp')) == 1) {
        document.querySelector('.temp-group').style.display = 'block';
    }

    document.querySelector('#location').value = getQueryVariable('loc') || '';


}

// load data on page load
loadData();


function validateInput(element) {
    let value = element.value;

    element.classList.remove("filled");
    if (value.trim().length > 0) {
        element.classList.add("filled");
    }

    validateForm();
}

function validateForm() {
    let name = document.getElementById("name").value;
    let id = document.getElementById("id").value;
    let submitButton = document.getElementById("submit");


    let isValid = false;

    submitButton.classList.remove("valid");
    if (name.trim().length > 0 /*&& id.trim().length > 0*/) {
        submitButton.classList.add("valid");
        isValid = true;
    }

    return isValid;
}

function submitForm() {
    let feedBackContainer = document.getElementById("feedback");

    let name = document.getElementById("name").value;
    let id = document.getElementById("id").value;
    let temperature = document.getElementById("temperature").value;
    let location = document.getElementById("location").value;
    let countriesVisted = document.getElementById("countriesVisited").value;
    let email = document.getElementById("email").value;
    let contact = document.getElementById("contact").value;
    let expected = document.getElementById('expected').value;

    let expectedat = null;
    if (expected.trim().length > 0) {
        let expectedDate = new Date(expected);
        expectedat = expectedDate.toISOString();
    }

    let _data = JSON.stringify({
        "id": id.trim(),
        "name": name.trim(),
        "location": location.trim(),
        'expectedat': expectedat,
        "temperature": temperature.trim(),
        "source": "Mobile",
        "countriesvisited": countriesVisted.trim(),
        "email": email.trim(),
        "contactnumber": contact.trim()
    });

    let API_URL = "http://staywoke.v4.iviva.cloud/Lucy/SituationalAwareness/users";
    let API_Key = "SC:staywoke:529c20cd6c187259";

    fetch(API_URL, {
        method: "post",
        headers: {
            'Authorization': 'APIKEY ' + API_Key,
            'Content-Type': 'application/json'
        },
        body: _data
    })
        .then((res) => res.json())
        .then(response => {

            if (!response._id) {
                // error
                feedBackContainer.innerHTML = "<span class=\"error\">Ooops! Sorry something went wrong</span>";
            }

            // update local storage
            localStorage.setItem("healUserDetails", _data);
            feedBackContainer.innerHTML = "<span class=\"success\">Done</span>";

            // reset from
            var inputs = document.getElementsByClassName("input");
            Array.prototype.forEach.call(inputs, (element) => {
                element.value = "";
                validateInput(element);
            });
            if (getQueryVariable('showtemp') != '1') {
                document.querySelector('.form-done').classList.remove('invisible');
                document.querySelector('.form-container').classList.add('invisible');
            }

        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

function saveChanges() {
    let isValid = validateForm();
    let feedBackContainer = document.getElementById("feedback");
    feedBackContainer.innerHTML = "<span class=\"info\">Submitting...</span>";

    if (isValid) {
        // submit form
        submitForm();
    }
    else {
        // show error
        feedBackContainer.innerHTML = "<span class=\"error\">Name is Required</span>";
    }
}

document.getElementById("submit").addEventListener("click", saveChanges);