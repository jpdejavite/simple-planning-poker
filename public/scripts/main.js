document.addEventListener('DOMContentLoaded', async () => {
  try {
    hideLoading();
    if (!window.location.pathname) {
      return;
    }

    const database = firebase.app().database();

    const deckList = ['<option selected disabled value="">Escolha...</option>'];
    const decksSnap = await database.ref(`/decks`).once('value');
    decksSnap.forEach((deckSnap) => {
      const deck = deckSnap.val();
      deckList.push(`<option id="${deckSnap.key}">${deck.name} - ${deck.cards.join(',')}</option>`);
    });
    document.getElementById('sessionDeck').innerHTML = deckList.join('');
  
    const matches = (/\/session\/(.+)/i).exec(window.location.pathname);
    if (matches && matches.length > 1) {
      initSession({ sessionId: matches[1] });
    }
  } catch (e) {
    console.error(e);
  }
});