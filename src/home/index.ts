const url = process.env.ADDIN_BASE_URL || "/";
const baseUrl = url.split('/').slice(0, 3).join('/');

document.addEventListener("DOMContentLoaded", function () {
    const meetLink = document.getElementById("meet") as HTMLAnchorElement;
    if (meetLink) {
        meetLink.href = baseUrl;
        console.log("Réunion Jitsi lancée", baseUrl);
    }
});
