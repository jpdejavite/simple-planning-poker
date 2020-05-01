const defaultAnimationTimeout = 1000;

const hideLoading = () => {
  setTimeout(() => {
    document.getElementById('loading-spinner').style.visibility = 'hidden';
  }, defaultAnimationTimeout);
};

const showLoading = (message) => {
  document.getElementById('loading-spinner-message').innerHTML = message || '...';
  document.getElementById('loading-spinner').style.visibility = 'visible';
};


const showErrorMessage = (message) => {
  setTimeout(() => {
    document.getElementById('error-message').innerHTML = `Erro: ${message || 'erro inesperado'}`;
    document.getElementById('error-message').style.display = 'block';
    document.getElementById('error-message').style.visibility = 'visible';
  }, defaultAnimationTimeout);
};

const clearErrorMessage = () => {
  document.getElementById('error-message').innerHTML = '';
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('error-message').style.visibility = 'hidden';
};


const setCookie = (cvalue) => {
  var d = new Date();
  d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
  var expires = `expires=${d.toUTCString()}`;
  document.cookie = `userId=${cvalue||''};${expires};path=/`;
};

const getCookie = () => {
  const name = 'userId=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};