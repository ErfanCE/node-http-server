const signupBtn = document.getElementById('signup-btn');
const signupStatus = document.getElementById('signup-status');

signupBtn.addEventListener('click', async (e) => {
  try {
    e.preventDefault();

    const data = {
      firstname: document.getElementById('firstname').value,
      lastname: document.getElementById('lastname').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    };

    const response = await fetch('http://localhost:8000/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error.message);
    }

    const { data: userData } = await response.json();

    signupStatus.textContent = `user username:(${userData.username}) signed up successfully`;
  } catch (err) {
    console.log(err);
    signupStatus.textContent = err.message;
  }
});
