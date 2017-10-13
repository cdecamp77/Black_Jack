/*----- constants -----*/
var playerHand = [];
var dealerHand = [];
var bank = 1000;
var wager = 0;
var counter = 0;
var winner = false; 
var playerDone = false;
var deck = new Deck();
var dealerTotal = computeHand(dealerHand);
var playerTotal = computeHand(playerHand);

// create the deck
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

/*----- event listeners -----*/
$(function () {
    $('.deal').on('click', function () {
      playerDone = false;
      counter = counter + 1;
        if (counter ===  5) {
          deck.cards = [];
          deck.createAllCards();
          counter = 0;
      }
      deal();
      checkBJ();
      render();
      document.querySelector('.dTotal').innerHTML = "Dealer showing " + (dealerHand[0].value);
      document.querySelector('.double').removeAttribute('disabled');
      document.querySelector('.hit').removeAttribute('disabled');
      document.querySelector('.stay ').removeAttribute('disabled');
  });
  
    $('.hit').on('click', function () {
      playerHand.push(dealRandomCard());
      computeHand(playerHand);
      messTotal();
      if (playerTotal > 21) {
        playerDone = true;
        busted();
        render();
      }
      renderPlayer();
      messTotal();
      document.querySelector('.dTotal').innerHTML = "Dealer showing " + (dealerHand[0].value);  
    });
  
    $('.double').on('click', function () {
      renderMoney();
      playerDone = true;
      renderDealer();
      double();
      render();
    });
  
    $('.stay').on('click', function () {
      playerDone = true;
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

  // deals the initial cards to the player and dealer
function deal() {
    setMessage('What would you like to do?');
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

  //deals random card from Deck
function dealRandomCard() {
    return deck.cards.splice(Math.floor(Math.random() * deck.cards.length), 1)[0];
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

  //changes the main message
function setMessage(message) {
    document.querySelector('.message').innerHTML = message;
}

//renders
function render() {
    renderCards();
    disable();
    renderMoney();
    messTotal();
    renderPlayer();
  }

  // renders the cards the dealer is dealt
function renderCards() { if (dealerHand.length == 2 && playerDone == false) {
    document.querySelector('.dealerCards').innerHTML = '';
    dealerHand.forEach(function (card, i) {
      var cardDiv = document.createElement('div');
      if (i == 0) {
        cardDiv.className = 'card '+card.img;
      } else {
        cardDiv.className = 'card back-blue';
      }
      document.querySelector('.dealerCards').append(cardDiv);
    })
      } else {
        renderDealer();
  }
}
  
  
  //renders the cards after the player stays
  function renderDealer() {
    document.querySelector('.dealerCards').innerHTML = '';
    dealerHand.forEach(function (card) {
      var cardDiv = document.createElement('div');
      cardDiv.className = 'card '+card.img;
      document.querySelector('.dealerCards').append(cardDiv);
    });
  }
  
  //renders the players cards
  function renderPlayer() {
    document.querySelector('.playerCards').innerHTML = '';
    playerHand.forEach(function (card){
      var cardDiv = document.createElement('div');
      cardDiv.className = 'card '+card.img;
      document.querySelector('.playerCards').append(cardDiv);
    });
  }

  //displays bank and wager amount
function renderMoney() {
    document.querySelector('.wage').innerHTML = "Wage Total: $" + wager;
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;
}

// displays the totals for user
function messTotal() {
    playerTotal = computeHand(playerHand);
    dealerTotal = computeHand(dealerHand);
    document.querySelector('.pTotal').innerHTML = "Looks like you have " + playerTotal;
    document.querySelector('.dTotal').innerHTML = "Dealer has " + dealerTotal;
}

// removes functions of certain buttons
function disable() {
    document.querySelector('.hit').setAttribute('disabled', '');      
    document.querySelector('.stay').setAttribute('disabled', '');      
    document.querySelector('.double').setAttribute('disabled', '');      
    document.querySelector('.split').setAttribute('disabled', '');      
  }

//double down feature
function double() {
    wager = (wager * 2);
    playerHand.push(dealRandomCard());
    playerTotal = computeHand(playerHand);
    if (playerTotal > 21) {
        winner = false;
        setMessage('Double was not succesful');
        render();
        wager = 0;
    } else if (playerTotal < 22 && dealerTotal != 21) { 
      // dealer takes cards until they have to stay or bust
          while (dealerTotal <= 16) {
            dealerHand.push(dealRandomCard());
            computeHand(dealerHand);
            messTotal();
            busted();
          } 
          checkWinner();
    } 
    if (winner) {
      bank = bank + wager;
      wager = 0;
    } else {
      bank = bank - (wager * 2);
    }
    render();
    document.querySelector('.deal').removeAttribute('disabled');
    document.querySelector('.upBet').removeAttribute('disabled');
  }

  //checks for BlackJack
function checkBJ () {
    playerTotal = computeHand(playerHand);
    dealerTotal = computeHand(dealerHand);
    if (dealerTotal == 21 && playerTotal != 21) {
      playerDone = true;
      winner = false;
      setMessage('Dealer got BlackJack, not your day');
      wager = 0;
      document.querySelector('.deal').removeAttribute('disabled');      
    } else if (playerTotal == 21 && dealerTotal != 21) {
      playerDone = true;
      bank = bank + (wager * 1.5);
      setMessage('Winner!! Winner!! Chicken Dinner!!');
      document.querySelector('.deal').removeAttribute('disabled');      
    } else if (playerTotal == 21 && dealerTotal == 21) {
      playerDone = true;
      setMessage('Not the best time for a BlackJack, next time.');
      document.querySelector('.deal').removeAttribute('disabled');      
    }
    disable();
    render();
    if (playerHand.length == 2) {
      disable();
    }
    }

//checks to see if anyone has busted or not
function busted() {
    playerTotal = computeHand(playerHand);
    dealerTotal = computeHand(dealerHand);
    if (playerTotal > 21) {
      wager = 0; 
      setMessage('You took one too many.');
      document.querySelector('.deal').removeAttribute('disabled');
      document.querySelector('.upBet').removeAttribute('disabled');
      document.querySelector('.downBet').setAttribute('disabled', '');   
      messTotal();
    } 
    if (dealerTotal > 21) {
      winner = true;
      setMessage("The dealer can't count!");
    }
    render();
  }

  //checks for winner
function checkWinner () {
    if (playerTotal > dealerTotal && playerTotal < 22) {
      winner = true;
      setMessage('Drinks are on you this evening.');
    } else if (dealerTotal > 21) {
      busted();
    } else if (dealerTotal == playerTotal) {
      setMessage('No winner here. Better than losing.');
    } else {
      setMessage('Dealer got lucky.');
      winner = false;
      wager = 0;
      document.querySelector('.downBet').setAttribute('disabled', '');
    }
    if (winner) {
      bank = bank + wager;
      document.querySelector('.downBet').removeAttribute('disabled');
    } else {
      if (playerTotal != dealerTotal) {
      wager = 0;
      }
    }
    reset();
    render();
  }

  // increases wager amount
function upBet() {
    wager = wager + 50;
    bank = bank - 50;
    document.querySelector('.downBet').removeAttribute('disabled');
    if ((bank - wager) > bank || bank === 0) {
      setMessage("I am afraid you don't have enough funds...");
      document.querySelector('.upBet').setAttribute('disabled', '');
    } 
    renderMoney();
  }
  
  // decreases wager amount
  function downBet() {
    wager = wager - 50;
    bank = bank + 50;
    if (wager <= 0 ) {
      document.querySelector('.downBet').setAttribute('disabled', '');
    } if (wager <= bank) {
      document.querySelector('.upBet').removeAttribute('disabled', '');
    }
    renderMoney();
  }

  // resets the game if the bank runs out
function reset() {
    if(bank === 0 && wager === 0) {
      setMessage('Have you tried counting cards? Try again.');
      bank = 1000;
    }
  }

  deck.createAllCards();
  document.querySelector('.downBet').setAttribute('disabled', '');