
const createSession = async () => {
  try {
    const form = document.getElementById('create-session-form');
    if (form.checkValidity() === false) {
      return;
    }

    const name = document.getElementById('sessionName').value;

    const sessionDeck = document.getElementById('sessionDeck');
    const deck = sessionDeck.options[sessionDeck.selectedIndex].id;

    showLoading('Criando sessão...');
    clearErrorMessage();

    const database = firebase.app().database();

    const sessionId = database.ref().child('sessions').push().key;
    await database.ref().child('sessions').child(sessionId).set({
      createdAt: new Date().toJSON(),
      name,
      deck,
    });

    setCookie();
    window.location.href = `/session/${sessionId}`;
  } catch (e) {
    console.error(e);
    showErrorMessage('Erro ao criar sessão!');
    hideLoading();
  }
};

window.addEventListener('load', () => {
  var form = document.getElementById('create-session-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === false) {
      return;
    }
    form.classList.add('was-validated');
    createSession();
  }, false);
}, false);