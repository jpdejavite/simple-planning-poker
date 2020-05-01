const showCurrentSessionBox = () => {
  document.getElementById('current-session-box').style.display = 'block';
  document.getElementById('current-session-box').style.visibility = 'visible';
  document.getElementById('summary-session-box').style.display = 'block';
  document.getElementById('summary-session-box').style.visibility = 'visible';

  document.getElementById('create-session-box').style.display = 'none';
  document.getElementById('create-session-box').style.visibility = 'hidden';
  document.getElementById('enter-session-box').style.display = 'none';
  document.getElementById('enter-session-box').style.visibility = 'hidden';
};

const getCurrentSessionStatus = (session, userId) => {
  if (!session.currentVote) {
    return { status: 'Nenhuma votação iniciada ainda', voteFinished: true };
  }

  if (!session.votes || !session.votes[session.currentVote] || !session.votes[session.currentVote].users) {
    if (!userId) {
      return { status: 'Ninguém votou na sessão ainda', voteFinished: false };
    }
    return { status: 'Você não votou na sessão ainda', voteFinished: false };
  }

  if (userId && !session.votes[session.currentVote].users[userId]) {
    return { status: 'Você não votou na sessão ainda', voteFinished: false };
  }

  const usersCount = Object.keys(session.users || {}).length;
  const votesCount = Object.keys(session.votes[session.currentVote].users).length;
  const missingVotes = usersCount - votesCount;
  if (missingVotes === 0) {
    return { status: 'Todos já votaram!', voteFinished: true };
  }

  if (votesCount === 0) {
    return { status: 'Falta todos votarem', voteFinished: false };
  }

  if (missingVotes == 1) {
    return { status: 'Falta 1 pessoa votar', voteFinished: false };
  }
  return { status: `Faltam ${missingVotes} pessoas não votarem`, voteFinished: false };
};

const doVote = async (sessionId, voteId, userId, vote) => {
  if (!voteId) {
    return;
  }
  const database = firebase.app().database();
  const voteSnap = await database.ref().child('sessions').child(sessionId).child('votes').child(voteId).child('users').child(userId).once('value');
  if (voteSnap && voteSnap.val()) {
    alert('Você já votou nessa sessão, espere a próxima.');
    return;
  }
  await database.ref().child('sessions').child(sessionId).child('votes').child(voteId).child('users').child(userId).set(vote);
};

const showCurrentSessionData = async (session, sessionId, userId) => {
  document.getElementById('main-title').innerHTML = `${session.name} (id ${sessionId})`;
  document.getElementById('main-text').innerHTML = userId ? `Você entrou na sessão <b>${session.name}</b>` : `Visualizando a sessão <b>${session.name}</b>`;
  document.getElementById('current-session-box-title').innerHTML = userId ? 'Baralho' : 'Ações';
  document.getElementById('current-session-main-action').innerHTML = userId ? 'Sair' : 'Iniciar nova votação';

  const { status, voteFinished } = getCurrentSessionStatus(session, userId);
  document.getElementById('current-session-main-status').innerHTML = status;

  if (!session.users || Object.keys(session.users).length === 0) {
    document.getElementById('session-users').innerHTML = '0';
    document.getElementById('session-users-list').innerHTML = `<p class="common-text">Para convidar pessoas compartilhe o id <b>${sessionId}</b> da sessão</p>`;
  } else {
    const userList = [];
    Object.keys(session.users).forEach((uid) => {
      let currentUserVote = null;
      if (session.currentVote && session.votes && session.votes[session.currentVote] && session.votes[session.currentVote].users) {
        currentUserVote = session.votes[session.currentVote].users[uid] || null;
      }
      userList.push(`<p class="common-text">${session.users[uid]} - <b>${voteFinished ? (currentUserVote || 'aguardando nova votação') : (currentUserVote ? 'já votou' : 'aguardando voto')}</b></p>`);
    });
    document.getElementById('session-users-list').innerHTML = userList.join('');
    document.getElementById('session-users').innerHTML = session.users ? Object.keys(session.users).length : 0;
  }

  if (!userId) {
    document.getElementById('current-session-deck').style.display = 'none';
    document.getElementById('current-session-deck').style.visibility = 'hidden';
  } else {
    document.getElementById('current-session-deck').style.display = 'block';
    document.getElementById('current-session-deck').style.visibility = 'visible';

    const database = firebase.app().database();

    const decksSnap = await database.ref(`/decks/${session.deck}/cards`).once('value');
    const cards = [];
    let currentUserVote = '';
    if (session.currentVote && session.votes && session.votes[session.currentVote] && session.votes[session.currentVote].users) {
      currentUserVote = session.votes[session.currentVote].users[userId] || '';
    }
    decksSnap.forEach((cardSnap, i) => {
      const cardVal = cardSnap.val();
      let cardBoxBorderClass = 'card-box-border';
      if (currentUserVote && currentUserVote === cardVal) {
        cardBoxBorderClass += ' card-box-border-voted';
      }

      cards.push(`
        <div class="card-box">
          <div class="${cardBoxBorderClass}" onclick="doVote('${sessionId}', '${session.currentVote || ''}', '${userId}', '${cardVal}')">
            <div class="card-box-content bg-primary">
              <p class="card-text"><b>${cardVal}</b></p>
            </div>
          </div>
        </div>
      `);
    });
    document.getElementById('current-session-deck').innerHTML = cards.join('');
  }
};

const doMainActionOnSession = async (session, sessionId, userId) => {
  const database = firebase.app().database();

  if (!userId) {
    const voteId = database.ref().child('sessions').push().key;
    await database.ref().child('sessions').child(sessionId).child('currentVote').set(voteId);
    await database.ref().child('sessions').child(sessionId).child('votes').child(voteId).set({
      createdAt: new Date().toJSON(),
    });
    return;
  }

  setCookie();
  await database.ref().child('sessions').child(sessionId).child('users').child(userId).set(null);
  window.location.href = '/';
};

const onSessionChange = (sessionSnap, userId) => {
  showCurrentSessionData(sessionSnap.val(), sessionSnap.key, userId);
};

const initSession = async ({ sessionId, userId }) => {
  try {
    showLoading('Carregando sessão...');
    clearErrorMessage();

    const database = firebase.app().database();

    const sessionSnap = await database.ref(`/sessions/${sessionId}`).once('value');
    hideLoading();
    if (!sessionSnap || !sessionSnap.val()) {
      console.error(`session ${sessionId} does not exists`);
      showErrorMessage(`Sessão ${sessionId} não existe!`);
      return;
    }

    if (!userId) {
      userId = getCookie();
    }

    showCurrentSessionBox();
    const session = sessionSnap.val();
    showCurrentSessionData(session, sessionId, userId);

    // clear cookie if user is not in session user list
    if (userId && (!session.users || !session.users[userId])) {
      setCookie();
      userId = null;
    }

    document.getElementById('current-session-main-action').addEventListener('click', () => {
      doMainActionOnSession(session, sessionId, userId);
    });

    document.getElementById('current-session-second-action').addEventListener('click', () => {
      window.location.href = '/';
    });

    database.ref(`/sessions/${sessionId}`).on('value', (snap) => {
      onSessionChange(snap, userId);
    });
  } catch (e) {
    console.error(e);
  }
};