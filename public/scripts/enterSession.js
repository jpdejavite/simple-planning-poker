
const enterSession = async () => {
  try {
    const form = document.getElementById('enter-session-form');
    if (form.checkValidity() === false) {
      return false;
    }

    const sessionId = document.getElementById('enterSessionId').value;
    const userName = document.getElementById('userName').value;
    const database = firebase.app().database();
    const userId = database.ref().child('sessions').push().key;

    showLoading('Entrando na sessão...');
    clearErrorMessage();

    await database.ref().child('sessions').child(sessionId).child('users').child(userId).set(userName);
    setCookie(userId);

    window.location.href = `/session/${sessionId}`;
    return false;
  } catch (e) {
    console.error(e);
    showErrorMessage('Erro ao entrar na sessão!');
    hideLoading();
  }
};

window.addEventListener('load', () => {
  var form = document.getElementById('enter-session-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === false) {
      return;
    }
    form.classList.add('was-validated');
    enterSession();
  }, false);
}, false);