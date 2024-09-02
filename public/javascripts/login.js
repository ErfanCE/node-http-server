const loginBtn = document.getElementById('login-btn');
const loginStatus = document.getElementById('login-status');

loginBtn.addEventListener('click', async (e) => {
  try {
    e.preventDefault();

    const data = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    };

    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // handle (400-500 status code range)
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error.message);
    }

    const { data: userData } = await response.json();
    loginStatus.textContent = `welcome ${userData.firstname}`;
  } catch (err) {
    console.log(err.message);
    loginStatus.textContent = err.message;
  }
});
