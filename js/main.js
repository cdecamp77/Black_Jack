/*----- constants -----*/
var playerHand = [];
var dealerHand = [];
var bank = 1000;
var wager = 0;
var counter = 0;
var winner = false; 
var deck = new Deck();
var dealerTotal = computeHand(dealerHand);
var playerTotal = computeHand(playerHand);

/*----- app's state (variables) -----*/
function Card(value, name, suit, img) {
  this.value = value;
  this.name = name;
  this.suit = suit;
  this.img = this.suit + this.name;
}

function Deck() {
  this.cards = [];
}

Deck.prototype.createAllCards = function () {
  for (var s = 0; s < Deck.suits.length; s++) {
    for (var n = 0; n < Deck.names.length; n++) {
      this.cards.push(new Card(Deck.values[n], Deck.names[n],Deck.suits[s], Deck.img));
    }
  }
}

Deck.names = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
Deck.values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
Deck.suits = ['h', 'd', 's', 'c'];
;

/*----- event listeners -----*/
$(function () {
  $('.deal').on('click', function () {
    counter = counter + 1;
      if (counter ===  5) {
        deck.cards = [];
        deck.createAllCards();
        console.log('reshuffled');
        counter = 0;
    }
    deal();
    render();
    checkBJ();
    document.querySelector('.dTotal').innerHTML = "Dealer showing " + (dealerTotal - dealerHand[0].value);
    document.querySelector('.hit').removeAttribute('disabled');
    document.querySelector('.stay ').removeAttribute('disabled');
});

  $('.hit').on('click', function () {
    playerHand.push(dealRandomCard());
    computeHand(playerHand);
    messTotal();
    if (playerTotal > 21) {
      busted();
      renderMoney()
      disable();
    }
    messTotal();
    // render();
    document.querySelector('.dTotal').innerHTML = "Dealer showing " + (dealerTotal - dealerHand[0].value);  
  });

  $('.stay').on('click', function () {
    disable();
    dealerTotal = computeHand(dealerHand);
// dealer takes cards until they have to stay or bust
    while (dealerTotal <= 16) {
      dealerHand.push(dealRandomCard());
      dealerTotal = computeHand(dealerHand);
      messTotal();
      busted();
    }
    document.querySelector('.deal').removeAttribute('disabled');
    document.querySelector('.upBet').removeAttribute('disabled');
    document.querySelector('.downBet').removeAttribute('disabled');
  checkWinner();
  render();
});
  $('.upBet').on('click', function (){
    upBet();
  });
  $('.downBet').on('click', function (){
    downBet();
  });
});  

/*----- functions -----*/

//deals random card from Deck
function dealRandomCard() {
  return deck.cards.splice(Math.floor(Math.random() * deck.cards.length), 1)[0];
}
// deals the initial cards to the player and dealer
function deal() {
  setMessage('Player, what would you like to do?');
  if (playerHand.length == 0) {
    playerHand.push(dealRandomCard());
    dealerHand.push(dealRandomCard());
    playerHand.push(dealRandomCard());
    dealerHand.push(dealRandomCard());
    document.querySelector('.upBet').setAttribute('disabled', '');
    document.querySelector('.downBet').setAttribute('disabled', '');
    document.querySelector('.deal').setAttribute('disabled', '');
  } else {
    playerHand = [];
    dealerHand = [];
    deal();
  }
}

//computes hands for both players, taking acct for aces
function computeHand(hand) {
  var aceCount = 0;
  var total = hand.reduce(function (acc, card) {
    if (card.value === 11) aceCount++;
    return acc + card.value;
  }, 0);
  while (total > 21 && aceCount) {
    total -= 10;
    aceCount--;
  }
  return total;
}

// displays the totals for user
function messTotal() {
    playerTotal = computeHand(playerHand);
    dealerTotal = computeHand(dealerHand);
    document.querySelector('.pTotal').innerHTML = "Player total is " + playerTotal;
    document.querySelector('.dTotal').innerHTML = "Dealer has " + dealerTotal;
}

//changes the main message
function setMessage(message) {
    document.querySelector('.message').innerHTML = message;
}

function checkBJ () {
  playerTotal = computeHand(playerHand);
  dealerTotal = computeHand(dealerHand);
render();
  if (dealerTotal == 21 && playerTotal != 21) {
    winner = false;
    setMessage('Dealer got 21, not your day');
    wager = 0;
    document.querySelector('.deal').removeAttribute('disabled');
    document.querySelector('.hit').setAttribute('disabled', '');
    document.querySelector('.stay').setAttribute('disabled', '');
    render();
  } else if (playerTotal == 21) {
    bank = bank + (wager * 1.5);
    setMessage('You got 21!!');
    document.querySelector('.deal').removeAttribute('disabled'); 
    render()
  }
  }

// increases wager amount
function upBet() {
  wager = wager + 50;
  bank = bank - 50;
  document.querySelector('.downBet').removeAttribute('disabled');
  if ((bank - wager) > bank || bank === 0) {
    setMessage('Cannot bet more than bank amount');
    document.querySelector('.upBet').setAttribute('disabled', '')
  } 
  renderMoney();
}

// decreases wager amount
function downBet() {
  wager = wager - 50;
  bank = bank + 50;
  if (wager <= 0 ) {
    document.querySelector('.downBet').setAttribute('disabled', '')
  } if (wager <= bank) {
    document.querySelector('.upBet').removeAttribute('disabled', '');
  }
  renderMoney();
}
// removes functions of certain buttons
function disable() {
  document.querySelector('.hit').setAttribute('disabled', '');      
  document.querySelector('.stay').setAttribute('disabled', '');      
  document.querySelector('.double').setAttribute('disabled', '');      
  document.querySelector('.split').setAttribute('disabled', '');      
}
//displays bank and wager amount
function renderMoney() {
    document.querySelector('.wage').innerHTML = "Wage Total: $" + wager;
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;
}

function render() {
    renderMoney();
    messTotal();
    disable();
    reset();
}

function checkWinner () {
  playerTotal = computeHand(playerHand);
  dealerTotal = computeHand(dealerHand);
  if (playerTotal > dealerTotal && playerTotal < 22) {
    winner = true;
    setMessage('Player has won');
    render();
  } else if (dealerTotal > 21){
    busted();
} else if (dealerTotal == playerTotal) {
    bank = bank
    wager = wager
    setMessage('You have pushed');
    render();
  } else {
    setMessage('Dealer has won');
    winner = false;
    wager = 0;
    render();
  }
  if (winner) {
    bank = bank + wager;
  render();
  } else {
    wager = 0;
    disable();
  }
  reset()
  render();
}

function busted() {
  playerTotal = computeHand(playerHand);
  dealerTotal = computeHand(dealerHand);
  if (playerTotal > 21) {
    wager = 0; 
    setMessage('You have busted');
    document.querySelector('.deal').removeAttribute('disabled');
    document.querySelector('.upBet').removeAttribute('disabled');
    messTotal();
    disable ();
  } 
  if (dealerTotal > 21) {
    winner = true;
    setMessage('Dealer has gone over');
    messTotal();
    disable();
  }
}

function reset() {
  if(bank === 0 && wager === 0) {
    setMessage('You have run out of money, good thing you bought in again, good luck');
    bank = 1000;
  }
}

deck.createAllCards();
document.querySelector('.downBet').setAttribute('disabled', '')