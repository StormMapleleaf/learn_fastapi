document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    body: formData,
  });

  const result = document.getElementById("result");

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    result.textContent = "登录成功！Token: " + data.access_token;
  } else {
    const error = await response.json();
    result.textContent = "登录失败：" + error.detail;
  }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const payload = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const response = await fetch("http://localhost:8000/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = document.getElementById("result");

  if (response.ok) {
    const data = await response.json();
    result.textContent = "注册成功！Email: " + data.email;
  } else {
    const error = await response.json();
    result.textContent = "注册失败：" + error.detail;
  }
});
