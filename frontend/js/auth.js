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
