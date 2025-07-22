const loader = document.getElementById("loader");
const result = document.getElementById("result");
const themeToggle = document.getElementById("themeToggle");

function showLoader() {
  loader.classList.remove("hidden");
}
function hideLoader() {
  loader.classList.add("hidden");
}

function getVideo() {
  const url = document.getElementById("url").value;
  if (!url) return alert("Please enter a YouTube URL.");

  result.innerHTML = "";
  showLoader();

  fetch("http://localhost:3000/video-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })
    .then((res) => res.json())
    .then((data) => {
      hideLoader();
      if (data.error) return (result.innerHTML = `<p>${data.error}</p>`);

      result.innerHTML = `
        <h3>${data.title}</h3>
        <img src="${data.thumbnail}" alt="Thumbnail" />
        <select id="formatSelect">
          ${data.formats.map(f => `<option value="${f.itag}">${f.qualityLabel} (${f.container})</option>`).join("")}
        </select>
        <button onclick="downloadVideo('${url}')">⬇️ Download</button>
      `;
    })
    .catch(() => {
      hideLoader();
      result.innerHTML = "<p>Error fetching video.</p>";
    });
}

function downloadVideo(url) {
  const itag = document.getElementById("formatSelect").value;
  showLoader();
  window.location.href = `http://localhost:3000/download?url=${encodeURIComponent(url)}&itag=${itag}`;
  setTimeout(hideLoader, 2000); // simulate download
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});
