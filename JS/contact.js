const form = document.getElementById("contact-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  try {
    await firebase.firestore().collection("contactMessages").add({
      name,
      email,
      message,
      timestamp: new Date()
    });

    alert("✅ Message sent successfully!");
    form.reset();
  } catch (error) {
    console.error("Error sending message:", error);
    alert("❌ Failed to send message. Please try again.");
  }
});
