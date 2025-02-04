document.getElementById("submit").addEventListener("click", function () {
  const rating = document.getElementById("rating").value;

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    alert("Invalid rating! Please enter a number between 1 and 5.");
    return;
  }
  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: updateFeedbackElements,
      args: [parseInt(rating, 10)],
    });
  });
});

// Function to execute inside the webpage
function updateFeedbackElements(rating) {
  let checkIframe = setInterval(() => {
    let iframe = document.querySelector("iframe");
    if (iframe) {
      console.log("Iframe found!");
      clearInterval(checkIframe);
    }
  }, 1000);

  const iframe = document.querySelector("iframe");
  if (!iframe) return;

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  if (!iframeDoc) return;

  const elements = Array.from(
    iframeDoc.querySelectorAll(".emptypng, .smileypng")
  );

  if (!elements.length) {
    return;
  }

  const inputs = Array.from(
    iframeDoc.querySelectorAll(
      'input[id*="RatingExplain1_RatingExtender_ClientState"]'
    )
  );
  const anchorTags = Array.from(iframeDoc.querySelectorAll('a[id$="_A"]'));

  // Reset all elements to emptypng
  elements.forEach((element) => {
    element.classList.remove("smileypng");
    element.classList.add("emptypng");
  });

  // Update elements based on the rating
  for (let i = 0; i < elements.length; i += 5) {
    for (let j = 0; j < 5; j++) {
      if (elements[i + j]) {
        if (j < rating) {
          elements[i + j].classList.remove("emptypng");
          elements[i + j].classList.add("smileypng");
        } else {
          elements[i + j].classList.remove("smileypng");
          elements[i + j].classList.add("emptypng");
        }
      }
    }
  }

  // Update input values based on the rating
  for (let i = 0; i < inputs.length; i += 5) {
    for (let j = 0; j < 5; j++) {
      if (inputs[i + j]) {
        inputs[i + j].value = j < rating ? rating.toString() : "";
      }
    }
  }

  // Update anchor tags based on the rating
  for (let i = 0; i < anchorTags.length; i += 5) {
    for (let j = 0; j < 5; j++) {
      if (anchorTags[i + j]) {
        anchorTags[i + j].setAttribute(
          "title",
          j < rating ? rating.toString() : ""
        );
      }
    }
  }

  // Submit the form after 2 seconds
  setTimeout(() => {
    const submitButton = iframeDoc.querySelector("#ffbHome_btnSubmit");
    if (submitButton) {
      console.log("Clicking submit button");
      submitButton.click();
    }
  }, 2000);
}

