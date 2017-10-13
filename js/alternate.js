function split(playerHand) {
    for (var idx = 0; idx <=2; idx++) {
    if (playerHand[0].img == playerHand[1].img) {
   var playerSplit = playerHand.splice(0,1);
   playerHand.push(dealRandomCard());
   playerSplit.push(dealRandomCard());
   wager = wager * 2;
   computeHand(playerHand);
   computeHand(playerSplit);
    checkWinner();
}
}}
$('.double').on('click', function () {
  double();
})


function double() {
    playerDone = true;
    wager = wager * 2;
    playerHand.push(dealRandomCard());
    if (playerTotal > 21) {
        winner = false;
    }
    checkWinner();
    render();
}


function render() {

    computeHand(dealerHand);
    computeHand(playerHand);

}

/*----- constants -----*/
var playerHand = [];
var dealerHand = [];
var bank = 1000;
var wager = 0;
var counter = 0;
var winner = false; 
var isBJ = false; 
var playerDone = false;

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
      this.cards.push(new Card(Deck.values[n], Deck.names[n], Deck.suits[s], Deck.img));
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
    deal();
    counter = counter + 1;
      if (counter ===  5) {
        deck.cards = [];
        deck.createAllCards();
        console.log('reshuffled');
        counter = 0;
    }
    var playerTotal = computeHand(playerHand);
    var dealerTotal = computeHand(dealerHand);
    checkBJ();
    messTotal();
    document.querySelector('.dTotal').innerHTML = "Dealer showing " + (dealerTotal - dealerHand[0].value);

    document.querySelector('.hit').removeAttribute('disabled');
    document.querySelector('.stay ').removeAttribute('disabled');
});

  $('.hit').on('click', function () {
    playerHand.push(dealRandomCard());
    var dealerTotal = computeHand(dealerHand);
    var playerTotal = computeHand(playerHand);
    
    computeHand(playerHand);
    if (playerHand >= 22) {
      // here is where a problem is
      disable();  
      checkWinner();
    }
    messTotal(); 
    document.querySelector('.dTotal').innerHTML = "Dealer showing " + (dealerTotal - dealerHand[0].value);  
  });

  $('.stay').on('click', function () {
    disable();
    document.querySelector('.upBet').removeAttribute('disabled');
    document.querySelector('.downBet').removeAttribute('disabled');
    playerTotal = computeHand(playerHand);
    dealerTotal = computeHand(dealerHand);
    computeHand(dealerHand);
    computeHand(playerHand);
    messTotal();
// dealer takes cards until they have to stay or bust
    while (dealerTotal <= 16) {
      dealerHand.push(dealRandomCard());
      dealerTotal = computeHand(dealerHand);
      if (dealerTotal > 21) {
        setMessage('dealer busts');
      }
      messTotal();
  }
    checkWinner();
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

messTotal();
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
    var playerTotal = computeHand(playerHand);
    var dealerTotal = computeHand(dealerHand);
    document.querySelector('.pTotal').innerHTML = "Player total is " + playerTotal;
    document.querySelector('.dTotal').innerHTML = "Dealer has " + dealerTotal;
}

//changes the main message
function setMessage(message) {
    document.querySelector('.message').innerHTML = message;
}
 // checks for winner
function checkWinner() {
  var playerTotal = computeHand(playerHand);
  var dealerTotal = computeHand(dealerHand);
  computeHand(dealerHand);
  computeHand(playerHand);
  if (dealerTotal <= 21 && dealerTotal > playerTotal) {
    // bank = bank - wager;
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;
    setMessage('Dealer got you that time...');
    disable();
    document.querySelector('.deal').removeAttribute('disabled');
  } if (playerTotal > dealerTotal && playerTotal <= 21) {
    messTotal();
    bank = bank + wager;
    setMessage("Winner!! Winner!!");
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;
    disable();
    document.querySelector('.deal').removeAttribute('disabled');    
  } if (dealerTotal == playerTotal) {
    setMessage('Let this one slide...');
    messTotal();
    disable();
    document.querySelector('.deal').removeAttribute('disabled');    
  } if (playerTotal >= 22 ) {
    setMessage('Player loses');
    // bank = bank - wager; 
    disable();
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;    
    document.querySelector('.deal').removeAttribute('disabled');
  } if (playerTotal <= 21 && dealerTotal > 21) {
    setMessage('dealer busts, you win');
    bank = bank + wager;
    disable();
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;   
    document.querySelector('.deal').removeAttribute('disabled');     
  } if (playerTotal > 21) {
    // //here is where a problem is. 
    // document.querySelector('.hit').setAttribute('disabled', '');      
    // document.querySelector('.stay').setAttribute('disabled', '');      
    bank = bank - wager;
    setMessage('You should have stayed...');
    disable();
    document.querySelector('.deal').removeAttribute('disabled');      
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;
}
}

function checkBJ () {
  var playerTotal = computeHand(playerHand);
  var dealerTotal = computeHand(dealerHand);
  if (dealerTotal === 21 && playerTotal != 21) {
    bank = bank - wager;  
    setMessage('Dealer got 21, not your day');
    disable();      
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;
    document.querySelector('.deal').removeAttribute('disabled');    
  } else if (playerTotal === 21) {
    bank = bank + (wager * 1.5); 
    disable();
    setMessage('You got 21!!');
    document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;    
    document.querySelector('.deal').removeAttribute('disabled');    
  }
  }

// increases wager amount
function upBet() {
  wager = wager + 50;
  bank = bank - wager;
  document.querySelector('.wage').innerHTML = "Wage Total: $" + wager;
  document.querySelector('.downBet').removeAttribute('disabled');
  document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;    
  if (wager >= bank) {
    setMessage('Cannot bet more than bank amount');
    document.querySelector('.upBet').setAttribute('disabled', '')
  } 
}

// decreases wager amount
function downBet() {
  wager = wager - 50;
  document.querySelector('.wage').innerHTML = "Wage Total: $" + wager;
  document.querySelector('.bankTotal').innerHTML = "Bank Total: $" + bank;      
  if (wager <= 0 ) {
    document.querySelector('.downBet').setAttribute('disabled', '')
  } if (wager <= bank) {
    document.querySelector('.upBet').removeAttribute('disabled', '');
  }
}

function disable() {
  document.querySelector('.hit').setAttribute('disabled', '');      
  document.querySelector('.stay').setAttribute('disabled', '');      
  document.querySelector('.double').setAttribute('disabled', '');      
  document.querySelector('.split').setAttribute('disabled', '');      

  
}

deck.createAllCards();
document.querySelector('.downBet').setAttribute('disabled', '')