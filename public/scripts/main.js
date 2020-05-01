document.addEventListener('DOMContentLoaded', async () => {
  try {
    hideLoading();
    if (!window.location.pathname) {
      return;
    }

    const matches = (/\/session\/(.+)/i).exec(window.location.pathname);
    if (matches && matches.length > 1) {
      initSession({ sessionId: matches[1] });
    }
  } catch (e) {
    console.error(e);
  }
});