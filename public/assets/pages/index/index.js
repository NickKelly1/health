"use strict";

const Url = URL || webkitURL;

document.addEventListener('DOMContentLoaded', function () {
  const checkUrl = new URL(
    `/check?${new URLSearchParams([
      ['size', 'xl'],
      ['url', document.location.origin],
    ]).toString()}`,
    document.location.origin,
  );
  fetch(checkUrl)
    .then(res => res.blob())
    .then(blob => {
      const imgUrl = Url.createObjectURL(blob);
      const img = new Image(imgUrl);
      img.src = imgUrl;
      img.alt = "site status";
      img.addEventListener('load', function () {
        Url.revokeObjectURL(this.src);
        const status = document.getElementById('site-status');
        status.innerHTML = '';
        status.appendChild(this);
      });
    })
});