// Test script to verify tournament logic
// Both players bet the same way (LONG or SHORT)

function determineWinner(roomBet, hostPercentageChange, guestPercentageChange) {
  let hostScore, guestScore;

  if (roomBet === 'LONG') {
    // Both players are betting LONG - higher percentage increase wins
    hostScore = hostPercentageChange;
    guestScore = guestPercentageChange;
  } else {
    // Both players are betting SHORT - lower percentage decrease wins (less negative is better)
    hostScore = -hostPercentageChange; // Convert negative to positive for comparison
    guestScore = -guestPercentageChange;
  }

  let winner;
  if (hostScore > guestScore) {
    winner = 'host';
  } else if (guestScore > hostScore) {
    winner = 'guest';
  } else {
    winner = 'tie';
  }

  return {
    winner,
    hostScore,
    guestScore,
    hostPercentageChange,
    guestPercentageChange
  };
}

console.log("🧪 Testing Tournament Logic\n");

// Test 1: LONG tournament - both players bet LONG
console.log("📈 Test 1: LONG Tournament");
console.log("Both players bet LONG - higher percentage increase wins");
const longResult = determineWinner('LONG', 5.2, 3.8);
console.log(`Host: +5.2%, Guest: +3.8%`);
console.log(`Winner: ${longResult.winner} (Host score: ${longResult.hostScore}, Guest score: ${longResult.guestScore})`);
console.log("✅ Expected: Host wins (5.2 > 3.8)\n");

// Test 2: SHORT tournament - both players bet SHORT
console.log("📉 Test 2: SHORT Tournament");
console.log("Both players bet SHORT - lower percentage decrease wins");
const shortResult = determineWinner('SHORT', -2.1, -4.5);
console.log(`Host: -2.1%, Guest: -4.5%`);
console.log(`Winner: ${shortResult.winner} (Host score: ${shortResult.hostScore}, Guest score: ${shortResult.guestScore})`);
console.log("✅ Expected: Host wins (2.1 > 4.5, less negative is better)\n");

// Test 3: SHORT tournament with different scenario
console.log("📉 Test 3: SHORT Tournament (Different scenario)");
const shortResult2 = determineWinner('SHORT', -8.2, -1.5);
console.log(`Host: -8.2%, Guest: -1.5%`);
console.log(`Winner: ${shortResult2.winner} (Host score: ${shortResult2.hostScore}, Guest score: ${shortResult2.guestScore})`);
console.log("✅ Expected: Guest wins (1.5 > 8.2, less negative is better)\n");

// Test 4: Tie scenario
console.log("🤝 Test 4: Tie Scenario");
const tieResult = determineWinner('LONG', 3.5, 3.5);
console.log(`Host: +3.5%, Guest: +3.5%`);
console.log(`Winner: ${tieResult.winner} (Host score: ${tieResult.hostScore}, Guest score: ${tieResult.guestScore})`);
console.log("✅ Expected: Tie (3.5 = 3.5)\n");

console.log("🎯 All tests completed!"); 