// ZurePicks keyword content (built from the top-100 keyword CSV).
// What this file does:
//  1) KW: an extra, hand-written section + extra FAQs for each INDEXED page, appended below what the page already shows.
//  2) NEW_GUIDES: four new evergreen guide pages that fill keyword gaps (they are added to guides.html and the sitemap by the normal build).
//  3) applyKeywordContent(): the one function build-pages.mjs calls inside page(). It never touches noindex pages
//     (match pages, dated archive pages, non-top team pages), so nothing that was un-indexed becomes indexed.
// To change any wording, edit the text here and run the normal build. No numbers below are live stats: they are maths that is always true.
// Section format:  [ 'Heading', 'paragraph', 'paragraph', ['bullet', 'bullet'] ]

const render = (secs) => `<div class="prose kw">${secs.map(([h, ...ps]) => `<h2>${h}</h2>${ps.map((p) => (Array.isArray(p) ? `<ul class="mk">${p.map((li) => `<li>${li}</li>`).join('')}</ul>` : `<p>${p}</p>`)).join('')}`).join('')}</div>`;

export const KW = {};
export const TITLES = {};
export const REL = {}; // 'Related reading' link lines, so every guide gets real internal links // optional title / description upgrades for pages whose title is fixed in build-pages.mjs

// ============ HOME ============
KW['index.html'] = { s: [
  ['Free football predictions today, with the working shown',
   'ZurePicks is a free football predictions site. Every day we take the bookmakers’ own prices, strip out the built-in margin and show you the chance each result really carries. That is why you will see a percentage next to every tip: it is the odds turned into something you can read at a glance. If you have ever searched for football tips with probability and found only a team name and a tick, this is the fix.',
   'There is no sign-up and no paywall. You open the page, pick a game, tap the price and it goes into your slip. Nobody asks for your email, and nothing here is locked behind a “VIP” group. If you want to know how we work it out, the <a href="how-it-works.html">methodology page</a> has the full story.'],
  ['Accurate football predictions free: what “accurate” can honestly mean',
   'Anyone promising 100% accuracy is selling something. A football pick is a probability, not a prophecy. A 70% pick should lose about three times in ten, and a site that never shows a loss is hiding them. What we can promise is accuracy of a different kind: the percentages are calculated the same way every day, and every result is posted afterwards, wins and losses together, on the <a href="track-record.html">track record</a> page.',
   'That is also how you can judge us. Check whether the picks we label 70% really win about 70% of the time over a few weeks. If they do not, you will see it in our own numbers before you see it anywhere else.'],
  ['A football prediction site without sign up: how to use it in two minutes',
   ['Scroll the board for today’s games, or use the search box for a team or league.', 'Tap a price to add it to the slip, then tap <b>Copy slip</b> if you want to rebuild it in your betting app.', 'Prefer a ready-made ticket? Open the <a href="2-odds-predictions.html">2 odds</a>, <a href="3-odds-predictions.html">3 odds</a> or <a href="5-odds-predictions.html">5 odds</a> page.', 'Not sure what a market means? The <a href="football-betting-glossary.html">glossary</a> and the <a href="best-football-betting-markets-for-beginners.html">beginner’s guide to markets</a> explain it without jargon.']],
  ['AI football predictions today: what our assistant does and does not do',
   'The <a href="ai-betting-assistant.html">AI picker</a> is a slip builder, not a crystal ball. You tell it what you want, for example a 3 odds slip using only today’s games, and it searches the same published prices you can see on the board and assembles the combination with the best combined chance. It cannot see injuries the bookmakers have not priced in, and it cannot know who wins. Think of it as a fast, tidy way to do the sums.']
], faq: [
  ['Are the football predictions on ZurePicks really free?', 'Yes. Today’s predictions, the 2, 3 and 5 odds slips, the tools and the guides are all free, and you do not need an account.'],
  ['What does the percentage next to a tip mean?', 'It is the chance the bookmakers’ odds imply once their margin is removed. A 70% tip means the market rates that outcome as roughly a 7 in 10 chance. It is an estimate, not a guarantee.'],
  ['Can I use ZurePicks without signing up?', 'Yes. There is no registration. Open the page, read the picks and copy the slip if you want it.'],
  ['Where can I see how your tips have actually performed?', 'On the track record page, which lists results by market and by chance band, including the losses.']
] };

// ============ DAILY HUBS ============
KW['football-predictions-tomorrow.html'] = { s: [
  ['Planning tomorrow’s slip tonight: how to use this page',
   'Plenty of bettors like to build the slip the evening before so they are not rushing at kick-off. That is exactly what this page is for. It shows tomorrow’s fixtures with bookmaker prices and the chance each price implies, so you can line up your picks, compare them and sleep on it.',
   'One honest warning: odds move overnight. Team news, a late injury or a heavy bet can shift a price by the next morning, and some early prices are not yet published for smaller leagues. Treat tonight’s numbers as a first look and check them again before you place anything. Tomorrow’s 2, 3 and 5 odds slips use only tomorrow’s games, so nothing from today is mixed in.'],
  ['Early-slip checklist',
   [ 'Pick games, not “a slip”. Choose the matches you actually believe in first, then see what total they make.', 'Prefer fewer legs. Three picks at 70% each land together about 34% of the time; five land about 17%.', 'Re-check prices in the morning. If your pick’s odds have dropped a lot, the value may be gone.', 'Write down your stake before you look at the potential return.' ]]
], faq: [
  ['Are tomorrow’s football predictions final?', 'No. They use the prices available now. Odds and team news change before kick-off, so check again on the day.'],
  ['Why are some of tomorrow’s games missing odds?', 'Bookmakers publish prices for some leagues only a day or less before kick-off. Games without a published price are listed but cannot carry a tip yet.']
] };

KW['football-predictions-weekend.html'] = { s: [
  ['Weekend football predictions: why Saturday needs a plan',
   'Weekends are when most fixtures land, which is both the opportunity and the trap. With dozens of games on a Saturday, it is easy to add leg after leg until the slip is really a lottery ticket. The better approach is the opposite: use the long list to find a few games where the price and the chance agree, and ignore the rest.',
   'Our weekend page covers the whole span from Friday night to Sunday, in West Africa Time, so late kick-offs in other time zones do not catch you out. The big European leagues usually peak on Saturday afternoon and Sunday, while the weekend’s quieter leagues fill the late-night gaps.'],
  ['Building a weekend 5 odds accumulator without wrecking it',
   'A weekend 5 odds slip is popular because there is so much choice, but the maths does not change. Five legs at about 1.38 each multiply to roughly 5.00, and if each leg is a 72% chance the whole slip lands about one time in five. Use the <a href="5-odds-predictions.html">5 odds page</a> to see the combined chance before you commit, and keep the stake small enough that a loss is boring, not painful.']
], faq: [
  ['When do weekend football predictions go live?', 'Fixtures and prices appear as the bookmakers publish them, usually from midweek. The weekend page updates through Friday, Saturday and Sunday.'],
  ['What time zone are the kick-off times in?', 'West Africa Time (WAT, Africa/Lagos), which is UTC+1 all year.']
] };

KW['football-predictions-yesterday.html'] = { s: [
  ['Yesterday’s football prediction results, wins and losses together',
   'Trust in a tipster is built on the day after, not the day before. This page shows how yesterday’s picks actually finished: the final score and a tick or cross for each pick we published. We do not delete the red crosses and we do not quietly swap a pick after the match.',
   'If you are checking yesterday’s football prediction results to decide whether to follow us today, look at the pattern, not one day. A 70% pick will lose three times in ten, so a bad day is normal and a perfect day is luck. The longer view, by market, lives on the <a href="track-record.html">track record</a>.']
], faq: [
  ['Where can I find yesterday’s football prediction results?', 'Right here. Every game from yesterday with a published pick shows the final score and whether each pick won or lost.'],
  ['Do you remove losing tips?', 'No. A tip that was published before kick-off stays in the record whatever the result.']
] };

KW['safest-football-tips-today.html'] = { s: [
  ['Sure football predictions today: the honest version',
   'People type “sure football predictions today” because they want certainty. Football does not offer it. What it does offer is a range: some outcomes are far more likely than others, and a careful filter can find them. Our safest-tips page applies a simple rule. A game is listed only when the bookmakers’ own prices, with the margin removed, imply a chance of 75% or better.',
   'That is a strong pick, not a sure one. A 75% outcome fails one time in four. If you stack four of them in a slip, the whole slip lands only about 32% of the time. If a site tells you a pick is 100% sure, read <a href="are-sure-odds-real.html">are sure odds real?</a> before you send them any money.'],
  ['How to use safe tips sensibly',
   ['Use one or two as legs, not ten.', 'Short prices pay little: at odds of 1.30 you must be right about 77% of the time just to break even.', 'Check the date and the kick-off time. A tip for a game that already started is no use.', 'Never chase a loss with a bigger stake. See <a href="betting-bankroll-and-staking.html">bankroll and staking</a>.']]
], faq: [
  ['What are the safest football tips today?', 'The games where the odds imply a chance of 75% or more. They are listed on this page and refresh through the day.'],
  ['Are safe tips guaranteed?', 'No. Even a 75% pick loses about one game in four. Nothing in football betting is guaranteed.'],
  ['Why do the safest tips have such short odds?', 'Because the market already knows they are likely. A higher chance means a shorter price, which is the trade-off behind every bet.']
] };

KW['pick-of-the-day.html'] = { s: [
  ['Banker of the day and bet of the day: what it means here',
   'A banker is the pick you trust most on the day. People search for “banker of the day football” and “bet of the day football” to get one clear selection without scrolling through a hundred games. We choose ours from the strongest published price on the board, and the result is posted whatever happens.',
   'We use the word banker carefully. In betting slang it can sound like a guarantee. It is not. It is simply the best-rated option on a given day, and even the best-rated option loses sometimes. Read <a href="what-is-a-banker-bet.html">what a banker bet really is</a> for the full picture, and keep the stake as small as you would for any other bet.']
], faq: [
  ['What is the banker of the day?', 'The single pick our odds-based method rates highest for that day. It is not a guarantee.'],
  ['Is the bet of the day the same as the banker?', 'On ZurePicks they are the same thing: the best-rated pick of the day, with its result recorded afterwards.']
] };

// ============ SLIPS ============
KW['2-odds-predictions.html'] = { s: [
  ['2 odds daily predictions: how the slip is built',
   'A 2 odds slip aims for a total price of about 2.00, which means doubling your stake if it lands. We get there by choosing the fewest games that can reach 2.00 with the best combined chance, so you usually see two legs, sometimes three. Each leg is a market the odds rate as likely, and the combined chance is shown next to the price so you can see what you are really backing.',
   'Searching for “sure 2 odds today” will turn up a lot of promises. Here is the arithmetic instead: two 70% picks land together about 49% of the time. That is roughly a coin flip, which is exactly what 2.00 odds should be. Anyone offering a guaranteed double is offering you something the maths does not allow.'],
  ['Free 2 odds rollover tips: be careful with rollovers',
   'A rollover means taking the whole return from one 2 odds win and staking it on the next day’s slip. It is exciting and it is dangerous. Start with 10 and win five days running and you reach 320. But the chance of five straight winning days at 49% each is under 3%. One loss on day four and you are back to nothing.',
   'If you like the idea, treat the rollover as entertainment with money you can lose, never as a plan. A calmer alternative is a fixed stake each day and a rule to stop after a loss.'],
  ['Safe 2 odds accumulator today',
   'Nothing is safe, but some builds are safer than others. Two games from different leagues, each priced near 1.40, have less hidden correlation than two games in the same league on the same night. Avoid adding a third or fourth leg just to push the price up. Every extra leg is one more way to lose. You can check the sums on the <a href="accumulator-calculator.html">accumulator calculator</a>.']
], faq: [
  ['Is a 2 odds accumulator safe?', 'It is one of the lower-risk accumulators because it needs few legs, but no accumulator is safe. Two 70% picks together win about 49% of the time.'],
  ['What is a 2 odds rollover?', 'Staking the full return of one win on the next 2 odds slip. It compounds fast on a win streak and loses everything on the first defeat, so stakes must stay small.'],
  ['Can I use the 2 odds slip on 1xBet or SportyBet?', 'Yes. Copy the slip and rebuild the legs in the app. Prices differ by bookmaker, so check them before you confirm. See <a href="betting-tips-for-sportybet-bet9ja-msport-1xbet.html">how to use our tips on your bookmaker</a>.']
] };

KW['3-odds-predictions.html'] = { s: [
  ['3 odds daily predictions and the “3 odds banker” idea',
   'The phrase “sure 3 odds banker today” mixes two things that do not belong together. A banker is a trusted single pick. A 3 odds slip is a combination of several. What we can do is build the 3 odds slip from the picks with the best chance and show you the combined number honestly. Three 70% picks land together about 34% of the time, so a loss is more likely than a win, and the price pays for that.',
   'A 3 odds slip is where many people settle because it feels balanced: a decent return without a monster list of legs. We keep the number of games as low as we can, because a three-leg slip with higher-chance picks beats a five-leg slip made of weaker ones.'],
  ['Daily 3 odds rollover: a calmer way to do it',
   'Rolling a 3 odds slip day after day multiplies the risk. At roughly a one-in-three chance per day, a three-day winning streak happens about 4% of the time. If you want a routine, use a fixed daily stake from a bankroll you set in advance, and let the wins and losses even out. The <a href="stake-size-calculator.html">stake size calculator</a> helps you pick a sensible amount.']
], faq: [
  ['What are the odds of a 3 odds slip winning?', 'It depends on the legs. Three 70% picks win together about 34% of the time. The slip page shows the combined chance for the current build.'],
  ['Is there a sure 3 odds banker today?', 'No pick is sure. The slip uses the strongest available picks, but any one leg can lose and that loses the slip.']
] };

KW['5-odds-predictions.html'] = { s: [
  ['5 odds accumulator tips today: the long shot, explained',
   'A 5 odds slip usually takes four or five legs. It pays well because it is hard to win. Five legs at about 1.38 each multiply to roughly 5.00, and if every leg is a 72% chance, the whole slip lands about one time in five. Treat it as a ticket you are happy to lose, not as a daily income plan.',
   'Searches like “sure 5 odds daily” are the most dangerous of the lot, because a promise of a sure five-times return is simply not possible. If a 5 odds win were reliable, bookmakers would not offer it at that price.'],
  ['Weekend 5 odds, made less painful',
   ['Keep the stake small. Decide it before you look at the potential return.', 'Prefer legs from different leagues so one bad weekend in a single competition cannot sink the slip.', 'Remember the draw. Even strong favourites fail to win a lot more often than people expect.', 'Compare your slip with a smaller one on the <a href="3-odds-predictions.html">3 odds page</a>. Fewer legs usually mean a better chance.']]
], faq: [
  ['How likely is a 5 odds accumulator to win?', 'Four 70% picks win together about 24% of the time and five 75% picks about 24%. Weaker legs make it worse.'],
  ['Is 5 odds better than 3 odds?', 'It pays more but wins less often. Neither is better, it depends on how much risk you are comfortable with.']
] };

KW['single-shot-predictions.html'] = { s: [
  ['Single bet of the day and 2.00 odds single predictions',
   'A single bet is one match, one outcome, one price. There is no slip to rebuild and no second leg to ruin it. Our single-shot page looks for a home or away win priced near 2.00, which is the sweet spot for people who want a decent return from one selection. At 2.00 you need to win just over half the time to break even, so a pick rated at 60% or better has a margin of comfort.',
   'The trade-off with singles is that the return is smaller than an accumulator. That is deliberate. If your aim is to still be betting next month, singles with disciplined stakes beat clever slips almost every time. We compare the two approaches in <a href="single-bet-vs-accumulator.html">single bet vs accumulator</a>.']
], faq: [
  ['What is a single bet of the day?', 'One selection on one match, chosen as the strongest value pick of the day for a price near 2.00.'],
  ['Why choose a single instead of an accumulator?', 'Because there is only one thing that can go wrong. An accumulator multiplies the risk with every extra leg.']
] };

KW['track-record.html'] = { s: [
  ['A football tipster track record that shows the losses',
   'Search for a transparent football tipster track record and you will notice how rare the real thing is. Most “winning” pages show only the wins. Ours is built the other way round. Every pick published before kick-off is graded after the final whistle, and the table includes the failures. You can read how the grades are made on <a href="how-it-works.html">how it works</a>.',
   'Read the table like this: look at the chance band, then at the strike rate. If 70–79% picks win somewhere around 70–79% of the time, the numbers are doing their job. If the strike rate is far below the band for a long stretch, the method needs fixing, and we would rather you spot that than hide it.'],
  ['What a good track record looks like, and what it does not',
   'A short run proves very little. Ten wins in a row is luck, and ten losses in a row is also luck. Judge a prediction site by volume, by consistency between promised chance and actual result, and by whether it still shows the bad weeks. Be suspicious of anything that claims 90% or more over a short window.']
], faq: [
  ['Does ZurePicks show its losing predictions?', 'Yes. Every published pick is graded and stays in the record, whatever the result.'],
  ['How do I know the track record is not edited?', 'Picks are published before kick-off and graded from the final score. The results come from the same data feed that drives the live page, and you can check any match yourself.']
] };

// ============ MARKETS ============
KW['1x2-predictions.html'] = { s: [
  ['1X2 football predictions today and “straight win” talk',
   'In Nigerian betting slang a “straight win” is simply a 1X2 pick where one team wins outright, with no draw cover. That is the market on this page. The 1 is a home win, the X a draw and the 2 an away win. We list a game when one outcome is clearly ahead once the bookmaker’s margin is removed.',
   'The reason straight wins pay better than double chance is the draw. Roughly a quarter of football matches end level, so a favourite rated at 60% still fails to win four games in ten. If a straight win feels too risky, the <a href="double-chance-predictions.html">double chance</a> page covers two of the three results for a shorter price.']
], faq: [
  ['What does 1X2 mean in football betting?', '1 means the home team wins, X means a draw and 2 means the away team wins.'],
  ['What is a straight win?', 'A bet on one team to win the match outright, with no draw protection. It is the same as a 1 or 2 pick in the 1X2 market.']
] };

KW['home-win-predictions.html'] = { s: [
  ['Sure straight win for today: reading a home win properly',
   'The search “sure straight win for today” is really a search for a favourite at home. Our page lists those games when the home side clears a 60% chance after the margin is removed. That is a strong signal, but it is not a lock: a home favourite rated at 65% still drops points about one match in three.',
   'Before you back a home win, check three things the price cannot fully tell you: who is missing from the starting eleven, whether the team has a heavy midweek game, and what the pitch and weather are like. If the odds are very short, the double chance version on the <a href="1x-double-chance-predictions.html">1X page</a> may suit better.']
], faq: [
  ['Is a home win a safe bet?', 'Home sides win more often than away sides, but the price already reflects that. A 65% home favourite still fails to win about one game in three.']
] };

KW['away-win-predictions.html'] = { s: [
  ['Away win predictions today: when the visitor is genuinely better',
   'Away wins are the harder sell. Home advantage is real, and bookmakers price it in. So when an away side is still the favourite after that advantage, it usually means the gap in quality is large. That is the situation this page looks for. A title-chasing team visiting a side near the bottom is the classic picture.',
   'The risk is the draw and the second-string squad. Strong visitors often rotate in cup weeks, and away teams who lead tend to protect the lead. If you would rather not take the full risk, the <a href="x2-double-chance-predictions.html">X2 page</a> covers the draw as well.']
], faq: [
  ['Are away win predictions less reliable than home wins?', 'Away favourites are usually fewer and carry bigger prices because home advantage is built into the odds.']
] };

KW['draw-predictions.html'] = { s: [
  ['Draw predictions today: high odds, low hit rate',
   'People look for draw predictions today football because draws pay well, often 3.00 or more. The catch is the strike rate. Roughly one match in four ends level, and picking which one is genuinely hard. Our page lists the games the market rates as most likely to finish level, using the 1X2 prices we hold, so you start from the odds and not from a hunch.',
   'Draws cluster in tight games between sides of similar quality and in matches where one team needs only a point. A draw is also a low-scoring result in most cases, so it often goes together with Under 2.5 goals. Treat draw bets as small-stake entertainment, not as a core strategy.']
], faq: [
  ['How often do football matches end in a draw?', 'Roughly one in four across most major leagues, though it varies by league and season.'],
  ['Is betting on draws profitable?', 'The odds are high because the outcome is hard to predict. Over time most draw bettors lose money, so keep stakes small.']
] };

KW['double-chance-predictions.html'] = { s: [
  ['Double chance predictions today: the safety-net market',
   'Double chance gives you two of the three results in one bet: home or draw (1X), away or draw (X2), or home or away (12). Because you are covered twice, you win more often and the price is shorter. Our page lists these picks only when the chance is 75% or higher, because a short price must be earned by a high chance.',
   'The mistake is treating double chance as free money. At odds of 1.25 you need to win 80% of the time to break even. Pick the cover on matches where you trust one team not to lose but cannot call the winner, and read the plain-English guide, <a href="what-is-double-chance-bet.html">what is double chance?</a>, if you are new to it.']
], faq: [
  ['What does double chance mean?', 'You win if either of two outcomes happens. 1X covers home win or draw, X2 covers away win or draw and 12 covers home win or away win.']
] };

KW['1x-double-chance-predictions.html'] = { s: [
  ['1X double chance predictions: home win or draw',
   'The 1X bet wins if the home team wins or the match ends level. It is popular for strong home teams who do not always win but rarely lose. The price is short, so the page only lists games where the home side has a very high chance of avoiding defeat.',
   'What to check before you back 1X: how many goals the home side concedes, whether the main striker or goalkeeper is out, and how the visitors score on the road. A home team on a bad run can lose three times in a row at short odds. If the home side is clearly stronger, compare 1X with a straight win on the <a href="home-win-predictions.html">home win page</a>.']
], faq: [
  ['What does 1X mean in betting?', '1X means home win or draw. Your bet loses only if the away team wins.']
] };

KW['x2-double-chance-predictions.html'] = { s: [
  ['X2 double chance predictions: away win or draw',
   'X2 wins if the away team wins or the match is drawn. It is a favourite with bettors who like a strong visitor but worry about home advantage. Because the home team is the only way to lose, the price is shorter than a straight away win.',
   'Good X2 spots are games where the away team is much better, or where a home team is missing key players. Be careful with long travel, rotation after a midweek European night, and teams with strong home records. For a bigger price with more risk, look at the <a href="away-win-predictions.html">away win page</a>.']
], faq: [
  ['What does X2 mean in betting?', 'X2 means draw or away win. You lose only if the home team wins.']
] };

KW['over-1-5-goals-predictions.html'] = { s: [
  ['Over 1.5 goals predictions today: what it means and why people love it',
   'What does over 1.5 goals mean? It means the match must finish with two or more goals in total. 1-1, 2-0, 3-2 all win. 0-0 and 1-0 lose. Because most matches clear that bar, it is a favourite accumulator leg, and “sure over 1.5 goals today” is one of the most common safe-leg searches.',
   'Over 1.5 is only as safe as the price lets it be. At 1.30 the market implies about 77%. That is high but it still means roughly one match in four fails. Using five Over 1.5 legs in one slip is a classic trap: a single 1-0 loses the whole ticket. Pick teams that actually score, and check our <a href="over-under-goals-betting-explained.html">over/under explainer</a> if the line is new to you.']
], faq: [
  ['What does over 1.5 goals mean?', 'It means the match must have at least two goals in total. A 1-0 result loses, a 1-1 or 2-0 wins.'],
  ['Is over 1.5 goals a safe bet?', 'It is one of the safer goals lines, but short prices mean you must be right very often to profit, and 1-0 results do happen.']
] };

KW['over-2-5-goals-predictions.html'] = { s: [
  ['Over 2.5 goals predictions today: three goals or more',
   'Over 2.5 wins when a match has three or more goals. It is the most searched goals market because the price is usually close to even money. That also makes it the one where the bookmaker’s margin hurts most, since both sides carry similar odds.',
   'Look for games where both teams score often and both defend poorly, and be wary of the “it always goes over” trap: league averages hide big differences between clubs. Compare with <a href="under-2-5-goals-predictions.html">Under 2.5</a> and with <a href="over-2-5-goals-vs-btts.html">Over 2.5 vs BTTS</a> to choose the better fit for a game.']
], faq: [
  ['How many goals do you need for over 2.5?', 'Three or more. 2-1 wins and 1-1 loses.']
] };

KW['under-2-5-goals-predictions.html'] = { s: [
  ['Under 2.5 goals predictions today: the low-scoring angle',
   'Under 2.5 wins with two goals or fewer, so 0-0, 1-0, 1-1 and 2-0 all count. It suits matches between cautious sides, tight derbies and games where one team is happy to defend. It is also the natural partner of a draw bet.',
   'The risk is a single early goal. A 1-0 game can turn into 3-1 in ten minutes once the trailing team throws players forward. Check whether the stronger team is a fast starter and whether either side has a long list of absentees. For the other side of the line, see <a href="over-2-5-goals-predictions.html">Over 2.5 predictions</a>.']
], faq: [
  ['What does under 2.5 goals mean?', 'The match must finish with two goals or fewer in total.']
] };

KW['over-3-5-goals-predictions.html'] = { s: [
  ['Over 3.5 goals predictions: the high-odds goals market',
   'Over 3.5 needs four or more goals in the match, so the price is high and the hit rate is low. A 4-0 or a 3-1 wins; a 2-1 loses. We list games where the odds imply a realistic chance, usually two attacking teams who also concede a lot.',
   'Because wins are rare, the right stake is small. Do not use Over 3.5 as a rescue bet after a loss. If you want to understand the line properly first, read <a href="over-3-5-goals-explained.html">Over 3.5 goals explained</a>.']
], faq: [
  ['How many goals do you need for over 3.5?', 'Four or more goals in the match.']
] };

KW['under-3-5-goals-predictions.html'] = { s: [
  ['Under 3.5 goals safe tips: a steadier accumulator leg',
   'Under 3.5 wins when the match has three goals or fewer. Because most games end with three or fewer, it is a favourite when people want a safer leg. The price is correspondingly short, so it only pays when you build it into an accumulator, which is also when the risk climbs.',
   'The failure case is a goal-fest. One 3-2 loses the leg and the whole slip. Stay away from games with two leaky defences and a lot at stake, and do not stack too many Under 3.5 legs. The sums are easy to check on the <a href="accumulator-calculator.html">accumulator calculator</a>.']
], faq: [
  ['Is under 3.5 goals a safe bet?', 'It wins often, but it is priced that way. A single 3-2 or 4-1 loses it.']
] };

KW['btts-predictions.html'] = { s: [
  ['BTTS and GG predictions today: the same bet, two names',
   'BTTS and GG are the same market. BTTS stands for both teams to score and GG means goal-goal, the term used by many African bettors. It wins when each team scores at least once, whatever the final score. 1-1 wins, 3-2 wins, 3-0 loses.',
   'We list games where both attacks are active and the defences are not airtight. “Sure GG tips today” does not exist, but a filtered list does, and it shows the percentage behind every pick. Watch for a missing striker or goalkeeper and for heavy favourites who often win 2-0 or 3-0, because that kills the bet. For the full explanation, read <a href="what-is-btts-gg-bet.html">what BTTS and GG mean</a>.']
], faq: [
  ['What does GG mean in football betting?', 'GG means goal-goal: both teams score at least once. It is the same as BTTS Yes.'],
  ['What does NG mean?', 'NG means no goal for at least one team, the same as BTTS No.']
] };

KW['both-teams-not-to-score-predictions.html'] = { s: [
  ['BTTS No and GG No predictions: when a team fails to score',
   'BTTS No, also written GG No or NG, wins when at least one team ends the match without a goal. That means a 1-0, a 2-0 and a 0-0 all win. It is a quieter niche than BTTS Yes and fewer people check it, which makes it worth a look if you like clean-sheet angles.',
   'Typical spots are a strong home side against a weak attack, a team with a missing striker, or two defensive teams in a low-stakes game. The danger is a late consolation goal. For the opposite market, see <a href="btts-predictions.html">BTTS Yes</a>.']
], faq: [
  ['What is BTTS No?', 'A bet that at least one of the two teams fails to score.']
] };

// ============ LEAGUES ============
const LGX = (file, h, p1, p2, q, a) => { KW[file] = { s: [[h, p1, p2]], faq: [[q, a]] }; };
LGX('premier-league-predictions.html', 'Premier League predictions this weekend, and EPL odds in plain words',
  'The Premier League is the most searched league in the world, which also makes its odds some of the sharpest. Bookmakers know every injury and every lineup rumour, so the percentages here tend to be well calibrated and the bargains are rare. Use this page for EPL predictions and odds together: the price, the chance it implies, and whether a game is worth your attention at all.',
  'Most matches fall on Saturday and Sunday, with Saturday’s main kick-off at 3pm UK time, which is 4pm WAT in the European winter. Midweek rounds and holiday fixtures can pile games on top of each other, so rotation matters more than people think. Check the squad news before kick-off and see <a href="over-2-5-goals-predictions.html">Over 2.5</a> or <a href="btts-predictions.html">BTTS</a> for the goals angle.',
  'What time do Premier League matches kick off in Nigeria?', 'The usual Saturday 3pm kick-off in the UK is 4pm in Nigeria during the UK winter and 3pm during UK summer time, because Nigeria stays on West Africa Time all year.');
LGX('la-liga-predictions.html', 'La Liga predictions today: what to know before you bet',
  'La Liga has 20 clubs and 38 games each. Spanish football is known for possession, tactical patience and late kick-offs, and the league has some of the biggest gaps between the top and the bottom. That can make the favourites’ prices short and the draws surprisingly common in the middle of the table.',
  'Late evening kick-offs are normal, so a 9pm Spanish game can finish after midnight in WAT during the summer. Top teams often rotate around European weeks, and goals can dry up in tight games. Our picks list the market with the clearest price and show the chance behind it. For related markets see <a href="double-chance-predictions.html">double chance</a> and <a href="under-2-5-goals-predictions.html">Under 2.5</a>.',
  'How many teams are in La Liga?', 'There are 20 clubs, and each plays 38 matches, home and away.');
LGX('serie-a-predictions.html', 'Serie A predictions this weekend: patient football, patient betting',
  'Serie A has 20 clubs and a reputation for organised defending. That tends to make low-scoring games and draws more common than in some other leagues, so Under 2.5 and double chance often come up in our lists. The big clubs also lose points in places that surprise casual bettors.',
  'Games are spread across Friday to Monday, and kick-off times vary through the day, so check the WAT time on each card. Remember that late-season games can be affected by what teams need, not just how they play. See <a href="draw-predictions.html">draw predictions</a> and <a href="x2-double-chance-predictions.html">X2</a> for related angles.',
  'Is Serie A a low-scoring league?', 'It is often described that way, but goal numbers change from season to season. Look at current team form rather than the old reputation.');
LGX('bundesliga-predictions.html', 'Bundesliga over 2.5 predictions and more',
  'The Bundesliga has 18 clubs and 34 games each, and it has long been the league people associate with goals. That is why “Bundesliga over 2.5 predictions” is a common search. The reputation is earned, but not every game: some mid-table matches are cagey, and a title favourite may win 1-0.',
  'Use the goal-line picks on this page as a starting point and then check how many goals each side concedes away from home. Our <a href="over-2-5-goals-predictions.html">Over 2.5 page</a> and <a href="btts-predictions.html">BTTS page</a> show the same logic for every league.',
  'Does the Bundesliga have more goals than other leagues?', 'It has often averaged more goals per game than some major leagues, but it varies by season and team.');
LGX('ligue-1-predictions.html', 'Ligue 1 predictions today: one big club and a lot of variety',
  'Ligue 1 has 18 clubs and 34 games each. One or two wealthy sides can dominate, so favourites often carry short prices, while the games among the mid-table are far harder to call. That is where the value lives, and also where the risk lives.',
  'Because the strongest teams often rest players before European fixtures, always check the lineup. When prices are very short, <a href="1x-double-chance-predictions.html">1X</a> or a goals market may offer a better balance. Today’s fixtures and odds are above.',
  'How many matches are in a Ligue 1 season?', 'Each of the 18 clubs plays 34 matches.');
LGX('champions-league-predictions.html', 'Champions League predictions tonight: midweek nights explained',
  'Champions League games are usually played on Tuesday and Wednesday evenings. In the European winter the common kick-offs of 6:45pm and 9:00pm CET are the same clock time in Nigeria, because CET and WAT are both UTC+1. In summer, European clocks move forward and the games are an hour earlier on a Nigerian clock.',
  'Cup nights behave differently from league weekends. Teams play for aggregate results, rotation is common, and a defensive draw can suit both sides. Use the odds and the chance on each card to see where the market is confident, and read <a href="football-predictions-nigeria-time-wat.html">kick-off times in Nigerian time</a> so you never miss a start.',
  'What time are Champions League games in Nigeria?', 'During the European winter, 6:45pm and 9:00pm CET kick-offs are 6:45pm and 9:00pm in Nigeria. In summer they are an hour earlier on a Nigerian clock.');
LGX('europa-league-predictions.html', 'Europa League predictions on Thursday: rotation is the story',
  'The Europa League is played mostly on Thursdays, which puts it a few days before weekend league games. That is why rotation plays such a big part. Big clubs may rest stars, smaller clubs can treat the match as the highlight of their season, and prices do not always reflect the lineup.',
  'Check the team news before you back a favourite. If a heavy favourite fields a young side, the draw and double chance markets can be more sensible than a straight win. See <a href="double-chance-predictions.html">double chance predictions</a> and <a href="draw-predictions.html">draw predictions</a>.',
  'Which day is the Europa League played?', 'Mostly Thursday, with a small number of games on other days depending on the round.');
LGX('championship-predictions.html', 'Championship predictions today: accumulators and BTTS',
  'The English Championship has 24 clubs and 46 games each, which means a lot of fixtures and a lot of variety. Gaps between teams are smaller than at the top level, so results are less predictable and draws are common. That is why the league is popular for accumulators and BTTS.',
  'With so many games, form changes quickly. A manager change can shift a team’s outlook in a week. Look at the chance behind each price, keep your legs few and read <a href="how-accumulator-bets-work.html">how accumulator bets work</a> before you stack the Championship’s tricky results.',
  'How many games are played in the Championship?', 'Each of the 24 clubs plays 46 league games.');
LGX('eredivisie-predictions.html', 'Eredivisie over 1.5 and 2.5 tips: why the Dutch league is a goals league',
  'The Eredivisie has 18 clubs and 34 matches each, and it is known for attacking football and young players. That is why “Eredivisie over 1.5 and 2.5 tips” are so popular. The league has regularly produced above-average goals, particularly in matches involving the top sides.',
  'Big clubs can win by large scores, but so can the underdogs lose by a lot, so be careful with large stakes on the Over 3.5 line. For safer goal lines read <a href="over-1-5-goals-predictions.html">Over 1.5 predictions</a>; for a higher-risk line see <a href="over-2-5-goals-predictions.html">Over 2.5</a>.',
  'Is the Eredivisie a high-scoring league?', 'It has often had more goals per game than several other major leagues, though it changes by season.');
LGX('j1-league-predictions.html', 'J1 League predictions today: the early-morning football in Nigeria',
  'Japan is eight hours ahead of Nigeria. A 7pm kick-off in Japan is 11am in Nigeria, so J1 League games are morning or midday football on a Nigerian clock. That suits people who like to check results before lunch.',
  'The league is known for organised teams, high fitness and a lot of travel. Because it gets less coverage than Europe’s big leagues, odds can move less, and team news is harder to find. Stick to the chance shown on each card and use a smaller stake than you would for the Premier League. See <a href="football-predictions-nigeria-time-wat.html">kick-off times in Nigerian time</a>.',
  'What time is J1 League football in Nigeria?', 'Japan is eight hours ahead, so a 7pm kick-off in Japan is 11am in Nigeria.');
LGX('brasileirao-predictions.html', 'Brazilian Serie A predictions: late-night fixtures in WAT',
  'Brazil is four hours behind Nigeria, so a 9pm game in Brazil starts at 1am on a Nigerian clock. That makes the Brasileirão a late-night league for most readers, and a good one to check results for in the morning rather than stay up.',
  'Brazilian football has long travel distances, a tight calendar and many home advantages, which show up as short home prices and a lot of draws. Use the percentages on the page and keep stakes small when you cannot watch the game. Related reading: <a href="draw-predictions.html">draw predictions</a>.',
  'What time are Brasileirão games in Nigeria?', 'Brazil is four hours behind Nigeria. A 9pm Brazilian kick-off is 1am in Nigeria the next day.');
LGX('npfl-predictions.html', 'NPFL predictions today: Nigeria Premier Football League tips',
  'The Nigeria Premier Football League is the top division in the country, and “Nigeria premier football league predictions” and “NPFL predictions today” are searched by people who want local football without scrolling through European lists. Fewer bookmakers cover it in depth, so prices can be less sharp and information is thinner.',
  'Home advantage is strong in Nigerian football, travel can be hard and results can be surprising. When odds exist, we show the percentage they imply, but the sample of past results is smaller, so treat any pick as a lower-confidence one and stake accordingly. Fixtures are listed above in WAT.',
  'Where can I find NPFL predictions today?', 'On this page, with fixtures in WAT, bookmaker odds where published and the chance each price implies.');

// ============ TOOLS ============
KW['odds-converter.html'] = { s: [
  ['How to convert odds to a winning percentage',
   'To turn decimal odds into a chance, divide 1 by the odds and multiply by 100. Odds of 2.50 give 1 ÷ 2.50 = 0.40, which is 40%. Odds of 1.50 give 66.7%. This number is called the implied probability, and it is the bookmaker’s opinion with their margin still inside it.',
   'To remove the margin, add up the implied chances of all outcomes and divide each by the total. For example, odds of 1.90, 3.40 and 4.20 imply 52.6%, 29.4% and 23.8%, which adds to 105.9%. After removing the margin they become about 49.7%, 27.8% and 22.5%. That cleaned-up figure is what ZurePicks shows next to a pick. A fuller walk-through is in the <a href="bookmaker-margin-overround-explained.html">margin explainer</a>.'],
  ['Implied probability and the bookmaker margin calculator',
   'The <a href="margin-remover-calculator.html">margin remover</a> does the sums above in one tap. Use it whenever you compare two bookmakers: the lower the margin, the better the prices are for you.']
], faq: [
  ['How do I convert odds to winning percentage?', 'Divide 1 by the decimal odds and multiply by 100. Odds of 2.00 equal 50%.'],
  ['What is implied probability?', 'The chance of an outcome that a bookmaker’s odds suggest, including the bookmaker’s margin.']
] };

KW['accumulator-calculator.html'] = { s: [
  ['How to calculate accumulator odds, and what a parlay is',
   'Parlay is the American word for an accumulator, so a parlay odds calculator and an acca bet return calculator do the same job. To calculate the odds yourself, multiply the decimal odds of every leg. For example, 1.50 × 1.40 × 1.60 = 3.36. A 1,000 stake returns 3,360 if all three win, which is a profit of 2,360.',
   'Then do the other half of the sum: the chances multiply too. Three legs at 70% each land together 34% of the time. An accumulator is not a cheaper way to win more, it is a way to risk more at once. If you want a gentler path, see <a href="single-bet-vs-accumulator.html">single bet vs accumulator</a>.']
], faq: [
  ['What is a parlay?', 'The American word for an accumulator: several selections in one bet that must all win.'],
  ['How do I calculate my acca return?', 'Multiply your stake by the total odds. The return includes your stake, so subtract the stake to get the profit.']
] };

KW['stake-size-calculator.html'] = { s: [
  ['Betting stake calculator and unit size: keep one number small',
   'A unit is a fixed slice of your bankroll, usually 1% to 2%. If your bankroll is 50,000, one unit at 1% is 500. Betting in units means a bad week cannot wipe you out, and a good week does not tempt you into reckless stakes.',
   'To use the calculator, enter your bankroll and the percentage you are comfortable with. The result is the stake for one bet. Keep it the same until your bankroll has changed in a meaningful way. If you want the maths behind bigger or smaller stakes, see <a href="kelly-staking-calculator.html">the Kelly calculator</a> and <a href="betting-bankroll-and-staking.html">bankroll and staking</a>.']
], faq: [
  ['What is a unit size in sports betting?', 'A fixed percentage of your bankroll, commonly 1% to 2%, used as your standard stake.']
] };

KW['kelly-staking-calculator.html'] = { s: [
  ['Kelly criterion stake calculator: bet less than the formula says',
   'The Kelly formula gives the stake that grows a bankroll fastest, if your estimate of the chance is right. The shortcut is f = (b × p − q) ÷ b, where b is the decimal odds minus 1, p is your chance of winning and q is 1 − p. With odds of 2.00 and a belief of 55%, f = (1 × 0.55 − 0.45) ÷ 1 = 10% of the bankroll.',
   'In practice, people use half or quarter Kelly, because their chance estimates are never perfect. If you overestimate your edge, full Kelly can be reckless. Our <a href="kelly-criterion-football-betting.html">Kelly guide</a> explains it with football examples.']
], faq: [
  ['Is Kelly criterion safe?', 'Only if your probability estimate is accurate. Most bettors use half or quarter Kelly because estimates are rarely perfect.']
] };

KW['margin-remover-calculator.html'] = { s: [
  ['Bookmaker margin calculator: what the extra percentage means',
   'Add up the implied chances of every outcome in a market. If the total is above 100%, the extra is the bookmaker’s margin, also called the overround. A fair market would add to exactly 100%. Over time, the margin is the price you pay for betting.',
   'Use this tool to compare bookmakers on the same match. A lower margin means better value, and the difference adds up over hundreds of bets. See <a href="how-bookmakers-calculate-football-odds.html">how bookmakers calculate football odds</a> for the full process.']
], faq: [
  ['What is a bookmaker margin?', 'The built-in profit in a bookmaker’s odds. It shows up as implied chances that add to more than 100%.']
] };

// ============ EXISTING GUIDES: short quick-answer sections ============
KW['what-is-btts-gg-bet.html'] = { s: [['What does GG mean in football betting?', 'GG stands for goal-goal. It is the Nigerian and wider African shorthand for both teams to score, so GG and BTTS Yes are the same bet. NG means no goal for at least one side, the same as BTTS No. See today’s picks on the <a href="btts-predictions.html">BTTS and GG page</a>.']],
  faq: [['What does BTTS mean in betting?', 'Both teams to score. The bet wins if each team scores at least once.'], ['What does GG mean in football betting?', 'Goal-goal: both teams score. It is the same as BTTS Yes.']] };
KW['how-to-read-football-odds.html'] = { s: [['What is implied probability in odds?', 'Implied probability is the chance a price suggests. Divide 1 by the decimal odds: 2.00 means 50%, 1.25 means 80%, 4.00 means 25%. The bookmaker’s margin is still inside, so the real chance is usually a little lower. The <a href="odds-converter.html">odds converter</a> does it for you and strips the margin.']],
  faq: [['How do I read football odds?', 'Decimal odds show the total return per 1 staked, stake included. Odds of 2.50 return 2.50 for each 1 staked.'], ['What is implied probability in odds?', 'The chance a price suggests, found by dividing 1 by the decimal odds.']] };
KW['are-sure-odds-real.html'] = { s: [['Why “sure odds” keep going viral', 'Sure odds posts spread because they sell hope. Ask three questions: can you check the old results, do they ask for money before the game, and do they ever show a loss? A real result history shows wrong picks. Nobody can guarantee a football result, and anyone who could would not need to sell tips. If you have already been asked to pay, read <a href="fixed-matches-and-sure-odds-scams.html">fixed matches and sure odds scams</a>.']],
  faq: [['Are sure odds real in football betting?', 'No. No tipster can guarantee a result. Strong picks exist, but every pick can lose.']] };
KW['single-bet-vs-accumulator.html'] = { s: [['How to avoid losing accumulators', 'You cannot avoid losing them completely, but you can lose less often. Use fewer legs, pick the higher-chance outcomes, avoid putting several games from the same league in one slip and decide the stake before you see the return. A full checklist is in <a href="how-to-avoid-losing-accumulators.html">how to avoid losing accumulators</a>.']],
  faq: [['What is the difference between a single bet and an accumulator?', 'A single is one selection. An accumulator combines several, and all of them must win, so it pays more but loses more often.']] };
KW['over-3-5-goals-explained.html'] = { s: [['Quick answer: what does over 3.5 goals mean?', 'It means four or more goals in the match. A 3-1 wins and a 2-1 loses. For today’s tips, see <a href="over-3-5-goals-predictions.html">Over 3.5 goals predictions</a>.']],
  faq: [['What does over 3.5 goals mean?', 'The match must have four or more goals in total.']] };
KW['what-is-double-chance-bet.html'] = { s: [['What is double chance 1X in betting?', 'The 1X bet wins if the home team wins or the game is drawn. X2 wins on a draw or an away win and 12 wins if either team wins. Each one covers two of the three results, which is why the price is shorter. Try today’s <a href="1x-double-chance-predictions.html">1X picks</a> or <a href="x2-double-chance-predictions.html">X2 picks</a>.']],
  faq: [['What is double chance 1X in betting?', 'A bet on the home team to win or draw. You lose only if the away team wins.']] };
KW['what-is-a-banker-bet.html'] = { s: [['What is a banker bet in football?', 'A banker is the selection you feel most sure of, often the first leg you put into a slip. The word does not mean guaranteed. Even strong favourites lose, so keep banker stakes within your normal limit. See today’s <a href="pick-of-the-day.html">banker of the day</a>.']],
  faq: [['What is a banker bet in football?', 'The pick you trust most, often used as the foundation of an accumulator. It is not guaranteed.']] };
KW['bookmaker-margin-overround-explained.html'] = { s: [['How bookmakers calculate football odds', 'Bookmakers start with their own estimate of each outcome, adjust for the money coming in on each side, then add a margin so the prices total more than 100%. Read the long version in <a href="how-bookmakers-calculate-football-odds.html">how bookmakers calculate football odds</a>.']],
  faq: [['What is the overround?', 'The amount by which the implied chances add up to more than 100%. It is the bookmaker’s margin.']] };
KW['betting-bankroll-and-staking.html'] = { s: [['How to manage a betting bankroll: a short version', 'Set aside an amount you can afford to lose and treat it as spent. Bet 1% to 2% of it per bet. Never top up after a loss to chase. Write every bet down. After 100 bets you will know more about your real results than any tipster can tell you. Try the <a href="stake-size-calculator.html">stake size calculator</a> to set your unit.']],
  faq: [['How do I manage my betting bankroll?', 'Use a fixed bankroll, bet 1% to 2% per bet, never chase losses and keep a record of every bet.']] };
KW['over-under-goals-betting-explained.html'] = { s: [['What does over 1.5 goals mean?', 'Over 1.5 wins when the match has two or more goals, and under 1.5 wins with zero or one. The half goal removes the possibility of a push, so the bet always settles as win or lose. See <a href="over-1-5-goals-predictions.html">today’s over 1.5 predictions</a>.']],
  faq: [['What does over 1.5 goals mean?', 'The match must have at least two goals in total.']] };
KW['football-betting-glossary.html'] = { s: [['Football betting terms explained, in one page', 'This glossary is the quick version. For the longer explainers, the best starting points are <a href="how-to-read-football-odds.html">how to read odds</a>, <a href="what-is-btts-gg-bet.html">BTTS and GG</a> and <a href="best-football-betting-markets-for-beginners.html">the best football betting markets for beginners</a>. Words you will meet most: stake, odds, leg, banker, acca, rollover, margin and bankroll.']],
  faq: [['What are the most common football betting terms?', 'Stake, odds, accumulator, banker, BTTS/GG, double chance, over/under, implied probability and bankroll.']] };
KW['how-it-works.html'] = { s: [['How we turn bookmaker prices into football tips', 'Step by step: we collect the prices, convert them to implied chances, remove the margin so the total is 100%, then list a pick only if it clears a minimum chance for its market. The result of every pick is recorded afterwards. Nothing in the method is hidden and nothing is edited after the match.']],
  faq: [['Does ZurePicks use AI to predict matches?', 'We use bookmaker odds as the base, plus a simple team-record model where odds are missing. The AI picker builds slips from those published prices. It does not predict outcomes by itself.']] };
KW['how-to-add-our-slip-to-your-betting-app.html'] = { s: [['Free booking codes and predictions: how it really works', 'A booking code is a saved slip that works only on one bookmaker, and only until the games kick off. Because prices differ between bookmakers, a code made elsewhere may show different odds or miss a market entirely. The safest way is to copy our slip and rebuild it in your own app, checking each price. Read <a href="betting-tips-for-sportybet-bet9ja-msport-1xbet.html">tips for SportyBet, Bet9ja, MSport and 1xBet</a>.']],
  faq: [['Can I get a booking code from ZurePicks?', 'We show slips and let you copy the legs. A booking code only works on one bookmaker, so we recommend rebuilding the slip in your own app and checking the odds.']] };
KW['kelly-criterion-football-betting.html'] = { s: [['Kelly criterion in one paragraph', 'Kelly says: stake a fraction of your bankroll equal to your edge divided by the odds minus one. If you believe a 2.00 bet wins 55% of the time, that is 10%. Because the estimate is shaky, most people use half Kelly or less. Try the <a href="kelly-staking-calculator.html">Kelly calculator</a>.']],
  faq: [['What is the Kelly criterion in betting?', 'A formula for the stake that maximises long-run bankroll growth, given your estimated chance and the odds.']] };

// ============ NEW GUIDE PAGES ============
export const NEW_GUIDES = [
{ slug: 'betting-tips-for-sportybet-bet9ja-msport-1xbet', h: 'Football tips for SportyBet, Bet9ja, MSport and 1xBet: how to use them',
  blurb: 'How to rebuild a slip in the app you use, what booking codes are, and why prices differ between bookmakers.',
  title: 'Football Tips for SportyBet, Bet9ja, MSport & 1xBet', desc: 'How to use free football predictions on SportyBet, Bet9ja, MSport and 1xBet: rebuild the slip, check the odds and understand booking codes.',
  lead: 'Whichever app you use, the method is the same: choose the games first, then rebuild the slip and check the prices before you confirm.',
  body: `<h2>The one rule that works on every bookmaker</h2><p>ZurePicks is an independent tips site. It does not run a bookmaker and does not take bets. Our picks come from published odds and a calculated chance, and you place the bet yourself in the app you trust. The steps are the same everywhere: add the games to the slip on our page, copy it, then find each game in your app and compare the price.</p><h2>Why the odds are not identical everywhere</h2><p>Every bookmaker sets its own prices and its own margin. A game that is 1.85 on one app can be 1.78 on another. A small difference matters when you stack legs: on a three-leg slip, a 0.05 drop on each leg cuts the total by roughly 8% to 10%. Always trust the price on your own screen, not the number in a screenshot.</p><h2>SportyBet</h2><p>Search for the match by team name, open the market that matches our pick (1X2, double chance, over/under or GG/NG) and add it to the slip. If the line is not listed, skip that leg instead of replacing it with a different market. Free betting tips for SportyBet are only useful if the legs on your slip match the legs we showed.</p><h2>Bet9ja</h2><p>Bet9ja lists GG and NG in the goals section and double chance under its own heading. If you are looking for “bet9ja sure predictions today”, remember that no list is sure: pick two or three legs with the highest chance and keep the stake small.</p><h2>MSport</h2><p>MSport has strong coverage of African leagues and plenty of football markets. Use the search for a team or league and match the market name carefully, because wording can differ slightly between apps.</p><h2>1xBet</h2><p>1xBet usually has the widest list of leagues and the widest range of markets. That helps with smaller competitions, but it also makes it easy to add legs you did not plan. Keep to the picks on your list. On “1xbet sure odds today” searches, the same warning applies: nothing is sure, and the combined chance on the <a href="2-odds-predictions.html">2 odds slip</a> tells the real story.</p><h2>What about free booking codes?</h2><p>A booking code is a saved slip that works on one bookmaker only and stops working once the first game starts. Codes shared by strangers can be old, can have different odds from the original or can include legs you would not choose. If you use one, open it, read every leg and drop what you do not agree with. More in <a href="how-to-add-our-slip-to-your-betting-app.html">how to add our slip to your betting app</a>.</p><h2>A short safety list</h2><ul><li>Never pay anyone for a “fixed match”. See <a href="fixed-matches-and-sure-odds-scams.html">fixed matches and sure odds scams</a>.</li><li>Set your stake before you look at the potential win.</li><li>Use only licensed bookmakers in your country and only if you are 18 or older.</li><li>If betting stops being fun, read <a href="responsible-gambling.html">responsible gambling</a>.</li></ul>`,
  faq: [['Does ZurePicks work with SportyBet, Bet9ja, MSport and 1xBet?', 'You can copy our slip and rebuild it in any of them. We do not run or own a bookmaker.'], ['Why is the same game priced differently on each app?', 'Each bookmaker sets its own odds and margin, so prices differ slightly.'], ['Do you publish booking codes?', 'We show slips you can copy. A booking code only works on one bookmaker and expires at kick-off, so rebuilding the slip yourself is safer.']] },

{ slug: 'best-football-betting-markets-for-beginners', h: 'Best football betting markets for beginners',
  blurb: 'Six simple markets to learn first, how each wins and where beginners usually go wrong.',
  title: 'Best Football Betting Markets for Beginners Explained', desc: 'The simplest football betting markets for beginners: 1X2, double chance, over/under goals and BTTS, with examples and common mistakes.',
  lead: 'Start with markets you can explain to a friend in one sentence. These six are the easiest to understand.',
  body: `<h2>1. Match result (1X2)</h2><p>Pick home win, draw or away win. It is easy to understand, but the draw makes it harder than it looks. Roughly one game in four ends level. See <a href="1x2-predictions.html">1X2 predictions</a>.</p><h2>2. Double chance</h2><p>You cover two of the three results, for example home win or draw. The price is shorter and you win more often. It is a gentle way to learn how odds and chance trade off. Read <a href="what-is-double-chance-bet.html">what is double chance</a>.</p><h2>3. Over/under 1.5 goals</h2><p>Over 1.5 wins with two goals or more. It is the easiest goals line to follow, though 1-0 results will beat you more often than you think.</p><h2>4. Over/under 2.5 goals</h2><p>Over 2.5 needs three goals or more. Under 2.5 wins with two or fewer. It is popular because the price is near even, and for the same reason the bookmaker margin hurts here.</p><h2>5. Both teams to score (BTTS or GG)</h2><p>It wins if each team scores. It does not matter who wins. Read <a href="what-is-btts-gg-bet.html">what BTTS and GG mean</a>.</p><h2>6. Draw no bet</h2><p>If the game ends level, you get your stake back. If your team wins you win. It is a good halfway option between a straight win and double chance. See <a href="what-is-draw-no-bet.html">draw no bet</a>.</p><h2>What to avoid at the start</h2><p>Skip correct score, half-time/full-time and long accumulators until you are comfortable. They pay big because they are very hard to win. Learn to read odds first with <a href="how-to-read-football-odds.html">how to read football odds</a>, and set a stake rule with <a href="betting-bankroll-and-staking.html">bankroll and staking</a>.</p>`,
  faq: [['What is the easiest football bet for beginners?', 'Double chance or over 1.5 goals, because they win more often. They also pay less.'], ['Should beginners bet on accumulators?', 'It is better to start with single bets so you learn how odds and results behave before multiplying the risk.']] },

{ slug: 'football-predictions-nigeria-time-wat', h: 'Football predictions in Nigerian time: WAT kick-off guide',
  blurb: 'How to convert UK, European, Japanese and Brazilian kick-offs into West Africa Time.',
  title: 'Football Predictions in Nigerian Time (WAT) Kick-off Guide', desc: 'What time are football games in Nigeria? A simple WAT guide for the Premier League, Europe, Japan and Brazil, with ZurePicks times shown in WAT.',
  lead: 'Every time on ZurePicks is in West Africa Time. Here is how to convert the rest.',
  body: `<h2>What WAT means</h2><p>West Africa Time is UTC+1, and Nigeria does not change its clocks for summer. That is why kick-offs shift by an hour for you twice a year even though nothing changed in Nigeria.</p><h2>Quick conversion table</h2><div class="sc"><table><thead><tr><th>Where the game is</th><th>Clock difference</th><th>Example</th></tr></thead><tbody><tr><td>England (winter, GMT)</td><td>Nigeria is 1 hour ahead</td><td>3pm in England = 4pm WAT</td></tr><tr><td>England (summer, BST)</td><td>Same time</td><td>3pm in England = 3pm WAT</td></tr><tr><td>Spain, Italy, Germany, France (winter)</td><td>Same time</td><td>9pm CET = 9pm WAT</td></tr><tr><td>Spain, Italy, Germany, France (summer)</td><td>Nigeria is 1 hour behind</td><td>9pm CEST = 8pm WAT</td></tr><tr><td>Japan</td><td>Nigeria is 8 hours behind</td><td>7pm in Japan = 11am WAT</td></tr><tr><td>Brazil</td><td>Nigeria is 4 hours ahead</td><td>9pm in Brazil = 1am WAT</td></tr></tbody></table></div><h2>When are the main competitions?</h2><p>Premier League games are mostly on weekends, with a busy Saturday afternoon. Champions League nights are on Tuesday and Wednesday, and Europa League on Thursday. Japan’s J1 League is a morning league for Nigerian readers and Brazil’s Serie A is a late-night one. Today’s fixtures with WAT times are on the <a href="./">home page</a>, and the league pages show kick-offs too: <a href="premier-league-predictions.html">Premier League</a>, <a href="champions-league-predictions.html">Champions League</a>, <a href="j1-league-predictions.html">J1 League</a> and <a href="brasileirao-predictions.html">Brasileirão</a>.</p><h2>Do not miss the start</h2><p>Always check the time on the card before you place a bet. Once a game starts, pre-match prices are gone and the tip is no longer useful. For games already in progress, see the <a href="live.html">live page</a>.</p>`,
  faq: [['What time is football in Nigeria today?', 'Open the home page. Every kick-off is listed in West Africa Time.'], ['Does Nigeria change its clocks?', 'No. Nigeria stays on UTC+1 all year, so the gap to Europe changes with their summer time.']] },

{ slug: 'how-to-avoid-losing-accumulators', h: 'How to avoid losing accumulators: 8 habits that help',
  blurb: 'Eight practical habits that make accumulators lose less often, with the maths behind each.',
  title: 'How to Avoid Losing Accumulators: 8 Practical Habits', desc: 'You cannot avoid losing every accumulator, but these eight habits help: fewer legs, higher chances, small stakes and honest records.',
  lead: 'There is no trick that makes an accumulator safe. There are habits that stop you making it worse.',
  body: `<h2>1. Use fewer legs</h2><p>Chances multiply. Two 70% picks win 49% of the time, three win 34%, five win about 17%. Every extra leg makes the slip harder to win.</p><h2>2. Choose higher-chance legs</h2><p>Five 75% legs win about 24% of the time. Five 60% legs win about 8%. A slightly higher chance on each leg makes a large difference.</p><h2>3. Do not chase a big price</h2><p>If the total needs ten legs, it is a lottery ticket. Treat it like one and stake a small amount.</p><h2>4. Mix leagues, not the same game types</h2><p>Several Over 1.5 legs or several home favourites can all fail on the same weekend. Spread the risk.</p><h2>5. Skip tired and rotated teams</h2><p>Midweek European games change lineups. A favourite with a second-string team is a different bet.</p><h2>6. Check the price in your own app</h2><p>A small price drop on every leg cuts the return fast. If the price is no longer worth it, drop the leg.</p><h2>7. Set the stake first</h2><p>Decide what you can afford to lose before you look at the potential win. Use the <a href="stake-size-calculator.html">stake size calculator</a>.</p><h2>8. Keep a record</h2><p>Write down every slip. After 50 you will see your real win rate. See <a href="accumulator-maths-the-slip-never-shows.html">the accumulator maths the slip never shows</a> and <a href="how-accumulator-bets-work.html">how accumulator bets work</a>.</p>`,
  faq: [['Why do accumulators lose so often?', 'Every leg must win and the chances multiply, so each extra leg lowers the chance of winning.'], ['Is there a way to guarantee an accumulator wins?', 'No. You can only reduce how often it loses.']] },

{ slug: 'how-bookmakers-calculate-football-odds', h: 'How bookmakers calculate football odds',
  blurb: 'From team ratings to the final price: how bookmakers build odds and add their margin.',
  title: 'How Bookmakers Calculate Football Odds, Step by Step', desc: 'How bookmakers calculate football odds: estimate the chances, add a margin, adjust for money and publish a price. With a worked example.',
  lead: 'Odds look mysterious until you see the steps. There are only four.',
  body: `<h2>Step 1: estimate the chances</h2><p>Bookmakers use ratings, recent results, injuries, home advantage and models to estimate the chance of each result. Say they think a home win is 50%, a draw 28% and an away win 22%.</p><h2>Step 2: turn chances into fair odds</h2><p>Fair decimal odds are 1 divided by the chance: 2.00, 3.57 and 4.55.</p><h2>Step 3: add the margin</h2><p>The bookmaker shaves the odds so the implied chances add to more than 100%. The prices might become 1.90, 3.40 and 4.20. Their implied chances are 52.6%, 29.4% and 23.8%, which total 105.9%. The extra 5.9% is the margin.</p><h2>Step 4: adjust to the money</h2><p>If lots of bets come in on one side, the price on that side shortens and the other side lengthens. That is why odds move before kick-off and why a price at breakfast may not be a price at lunch.</p><h2>What this means for you</h2><p>The price tells you the bookmaker’s opinion plus their cut. ZurePicks removes the cut to show the chance, so you can compare picks fairly. Try it yourself with the <a href="margin-remover-calculator.html">margin remover</a> or the <a href="odds-converter.html">odds converter</a>, and read <a href="bookmaker-margin-overround-explained.html">margin and overround explained</a> for more.</p>`,
  faq: [['How do bookmakers calculate football odds?', 'They estimate each result’s chance, convert it into odds, add a margin and adjust for the money placed.'], ['Why do odds change before a match?', 'Because of team news and because bookmakers move prices to balance the bets they receive.']] }
];

// ============ HOOK used by build-pages.mjs ============
// Appends the keyword section + extra FAQs to an INDEXED page. Noindex pages (match pages, dated archives, non-top team pages) are never touched.
export function applyKeywordContent(file, o) {
  const k = KW[file], t = TITLES[file], r = REL[file];
  if (o.noindex || (!k && !t && !r)) return o;
  const out = { ...o };
  if (k?.s) out.body = (o.body || '') + render(k.s);
  if (r) out.body = (out.body || o.body || '') + `<p class="rel"><b>Related reading:</b> ${r.map(([h, l]) => `<a href="${h}">${l}</a>`).join(' · ')}</p>`;
  if (k?.faq) {
    const seen = new Set((o.faq || []).map(([q]) => String(q).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()));
    const extra = k.faq.filter(([q]) => !seen.has(String(q).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()));
    out.faq = [...(o.faq || []), ...extra];
  }
  if (t?.title) out.title = typeof t.title === 'function' ? t.title(o.title || '', o.desc || '') : t.title;
  if (t?.desc) out.desc = typeof t.desc === 'function' ? t.desc(o.title || '', o.desc || '') : t.desc;
  return out;
}

// ============ SLIPS HUB WORDING + TOOLS HUB ============
KW['2-odds-predictions.html'].s.push(['Ready-made bet slip today: the best accumulator tips, without the noise',
  'If you want a ready-made bet slip today, the 2, 3 and 5 odds pages are the shortcut. Each one is rebuilt through the day from the games that have a published price, using only that day’s fixtures. Pick the target you like, tap <b>Copy slip</b> and rebuild the legs in your app. Looking for the best accumulator tips today? The best slip is rarely the one with the biggest price. It is the one with the highest combined chance for the return you want.',
  'You can also ask the <a href="ai-betting-assistant.html">AI picker</a> to build an AI bet slip for you. Tell it the odds you want and it assembles a combination from the same published prices you can see on the board. Compare the other targets here: <a href="3-odds-predictions.html">3 odds</a>, <a href="5-odds-predictions.html">5 odds</a> and the <a href="single-shot-predictions.html">single shot</a>.']);
KW['tools.html'] = { s: [['Which tool do I need?',
  ['Want to know what a price really says? Use the <a href="odds-converter.html">odds converter</a> to turn odds into a chance, or the <a href="margin-remover-calculator.html">margin remover</a> to strip out the bookmaker’s cut.', 'Building a slip? The <a href="accumulator-calculator.html">accumulator calculator</a> multiplies the legs and shows the return.', 'Not sure how much to stake? Start with the <a href="stake-size-calculator.html">stake size calculator</a>, then read about the <a href="kelly-staking-calculator.html">Kelly calculator</a> if you want a maths-based method.', 'Betting on handicaps? Try the <a href="asian-handicap-calculator.html">Asian handicap calculator</a>.'],
  'All the tools run in your browser and need no sign-up. Every price on ZurePicks is shown in decimal odds, and the odds converter also reads fractional and American odds.']],
  faq: [['Are the ZurePicks betting calculators free?', 'Yes. They are free, need no account and work in your browser.']] };

// ============ TITLE + DESCRIPTION UPGRADES (keyword-led, dates kept where the page already shows a date) ============
// A function gets the page's current title / description and returns the new one, so today's date keeps updating by itself.
const dateIn = (x) => (String(x).match(/\([^)]*\)/) || [''])[0];
const dFull = (d) => (String(d).match(/[A-Z][a-z]{2}, \d{1,2} [A-Z][a-z]{2} \d{4}/) || ['today'])[0];
Object.assign(TITLES, {
  'btts-predictions.html': { title: 'BTTS & GG Predictions Today: Both Teams to Score Tips', desc: 'Free BTTS and GG predictions for today with odds and the chance each price implies. Both teams to score tips, updated daily, results tracked.' },
  'football-predictions-yesterday.html': { title: (t) => `Yesterday Football Prediction Results ${dateIn(t)}`.trim() },
  'safest-football-tips-today.html': { desc: (t, d) => `Safest football tips today, ${dFull(d)}: only games the odds rate at 75% or more. The honest answer to “sure predictions”: strong picks, no promises, results posted.` },
  '2-odds-predictions.html': { title: (t) => `2 Odds Daily Predictions Today ${dateIn(t)}: Free Slip`.replace('  ', ' '), desc: (t, d) => `Free 2 odds daily predictions for ${dFull(d)}: a ready-made slip built from the strongest picks, with total odds and the combined chance shown. No sign-up.` },
  '3-odds-predictions.html': { title: (t) => `3 Odds Daily Predictions Today ${dateIn(t)}: Free Slip`.replace('  ', ' '), desc: (t, d) => `Free 3 odds daily predictions for ${dFull(d)}: a ready-made slip from today’s strongest games, with total odds and the honest combined chance. No sign-up.` },
  '5-odds-predictions.html': { title: (t) => `5 Odds Accumulator Tips Today ${dateIn(t)}: Free Slip`.replace('  ', ' '), desc: (t, d) => `5 odds accumulator tips for ${dFull(d)}: a free ready-made long-shot slip, with total odds and how rarely five legs really land. No sign-up.` },
  'single-shot-predictions.html': { title: (t) => `Single Bet of the Day ${dateIn(t)}: Free Football Pick`.replace('  ', ' '), desc: (t, d) => `Single bet of the day for ${dFull(d)}: one football pick priced near 2.00 odds, chosen from home and away wins, with a backup. Free, results posted.` },
  'home-win-predictions.html': { title: 'Home Win Predictions Today: Straight Win Tips & Odds' },
  'away-win-predictions.html': { title: 'Away Win Predictions Today: Straight Win Tips & Odds' },
  'pick-of-the-day.html': { title: 'Banker of the Day & Bet of the Day: Free Football Pick' },
  'npfl-predictions.html': { title: 'NPFL Predictions Today: Nigeria Premier League Tips & Odds', desc: 'NPFL predictions today: Nigeria Premier Football League fixtures in WAT with odds, win chance and free tips. No sign-up, results tracked.' },
  'premier-league-predictions.html': { title: 'EPL Predictions Today: Premier League Tips, Odds & Table' },
  'champions-league-predictions.html': { title: 'Champions League Predictions Tonight – Tips, Odds & Table' },
  'europa-league-predictions.html': { title: 'Europa League Predictions Thursday – Tips, Fixtures & Odds' },
  'bundesliga-predictions.html': { title: 'Bundesliga Predictions Today – Tips, Over 2.5 & Odds' },
  'eredivisie-predictions.html': { title: 'Eredivisie Predictions – Over 1.5 & 2.5 Tips, Odds & Table' },
  'brasileirao-predictions.html': { title: 'Brazilian Serie A (Brasileirão) Predictions Today' },
  'odds-converter.html': { title: 'Odds Converter & Implied Probability Calculator', desc: 'Free odds converter and implied probability calculator: switch between decimal, fractional and American odds and see the chance in percent. Works on your phone.' },
  'accumulator-calculator.html': { title: 'Accumulator Calculator: Acca & Parlay Odds, Return & Chance', desc: 'Free accumulator (acca / parlay) calculator: enter your odds to see the total odds, the return on your stake and the combined chance of winning.' },
  'stake-size-calculator.html': { title: 'Betting Stake Calculator: Bankroll & Unit Size', desc: 'Free betting stake calculator: set your bankroll and unit size, see a sensible stake and what a losing streak does to it. Bet small, stay in control.' },
  'margin-remover-calculator.html': { title: 'Bookmaker Margin Calculator: True Odds & Fair Probability' },
  'kelly-staking-calculator.html': { title: 'Kelly Criterion Stake Calculator for Football Betting' },
  'track-record.html': { title: 'Football Tipster Track Record: Every Win & Loss Shown', desc: 'A transparent football tipster track record: hit rates for every market over 30 days, and how often higher-chance picks really win. Losses included.' },
  'tools.html': { title: 'Football Betting Calculators: Odds, Acca, Stake & Margin', desc: 'Free football betting calculators: odds converter, accumulator, stake size, margin remover and Kelly. No sign-up, works on your phone.' },
  'ai-betting-assistant.html': { title: 'AI Bet Slip Generator: Free AI Football Predictions Today', desc: 'Free AI bet slip generator for football: tap for a 2 or 3 odds slip or a single shot near 2.00, for today or tomorrow. Built from bookmaker odds, no sign-up.' }
});

// ============ AI PICKER PAGE (its own FAQ schema already exists, so only a text section is added) ============
KW['ai-betting-assistant.html'] = { s: [
  ['Which button should I press? A quick guide to the AI bet slip generator',
   ['<b>You want a ready-made bet slip today:</b> press 2 odds or 3 odds. The picker searches the games that have not kicked off and returns the combination with the best combined chance for that target.', '<b>You want one clean bet:</b> use the single shot, one game near 2.00 with a backup from another game.', '<b>You want a different slip:</b> press shuffle. You get the next-best combination, not a random one.', '<b>You want to plan ahead:</b> switch to Tomorrow. Prices fill in through the day, so tomorrow’s slips get stronger by the evening.'],
   'This is the fastest way to turn the day’s fixtures into a slip without doing the sums yourself. It is a free AI bet slip generator, but the maths behind it is the same maths you can check on the <a href="accumulator-calculator.html">accumulator calculator</a>.'],
  ['AI football predictions today: what to expect, and what not to',
   'A tool like this is good at three things: reading many prices quickly, removing the bookmaker’s margin and testing combinations you would not have time to test. It is not good at news the bookmakers have not priced in, such as a player who warmed up badly or a pitch that flooded an hour ago.',
   'So use it as a starting point. Look at the slip, check the team news for each game, and drop any leg you are not happy with. If you want to see how the picks have done, the <a href="track-record.html">track record</a> lists wins and losses side by side.']
] };

// ============ SAUDI PRO LEAGUE (new league page, added to the LG list in build-pages.mjs) ============
KW['saudi-pro-league-predictions.html'] = { s: [
  ['Saudi Pro League predictions today: late kick-offs, big names',
   'The Saudi Pro League has grown fast in Nigeria because of its star signings and its evening kick-offs. Saudi Arabia is two hours ahead of Nigeria, so a 9pm game in Riyadh starts at 7pm WAT, which suits anyone who wants to bet after work.',
   'Big clubs such as Al Hilal, Al Nassr and Al Ittihad often have a clear gap in quality over the lower half of the table, which shows up as short prices on the favourites. Use the percentage on each card to see how much of the price is already built in. The league also stops for national-team breaks, so a quiet board on some days is normal, not a fault.'],
  ['How to bet Saudi football sensibly',
   ['Check the lineup. Foreign stars are sometimes rested or injured, and that moves a price more than people expect.', 'Watch the heat and the calendar. Summer games are played late for a reason, and congested weeks bring rotation.', 'Favourites can be priced very short. If the price is too low, a goals market or <a href="double-chance-predictions.html">double chance</a> may be a better fit.', 'Read <a href="football-predictions-nigeria-time-wat.html">the Nigerian time guide</a> so you never miss a start.']]
], faq: [['What time are Saudi Pro League games in Nigeria?', 'Saudi Arabia is two hours ahead of Nigeria, so a 9pm kick-off in Saudi Arabia is 7pm in Nigeria.'], ['Where can I find Saudi Pro League predictions today?', 'On this page, with fixtures in WAT, bookmaker odds where published and the chance each price implies. It is free and needs no sign-up.']] };

// ============ THIN PAGES: real extra content ============
KW['responsible-gambling.html'] = { s: [
  ['Betting should stay fun, small and optional',
   'Every tip on this site is a probability, not a promise. That means losing runs are normal, even with strong picks, and it is exactly why staking matters more than any single prediction. If betting is starting to cost you more than you planned, or more than you enjoy, this page is for you.'],
  ['Signs that betting is becoming a problem',
   [ 'You bet more than you meant to, or for longer than you meant to.', 'You chase losses by raising the stake or adding legs to “win it back”.', 'You borrow money, use rent or bill money, or hide betting from people close to you.', 'You feel anxious or low when you cannot bet, or when you lose.', 'You think about the next bet more than about anything else.' ],
   'One or two of these does not mean you are in trouble, but it is a good moment to slow down and talk to someone.'],
  ['Simple rules that protect you',
   [ 'Set a monthly betting budget before you start, and treat it as spent. Our <a href="stake-size-calculator.html">stake size calculator</a> can turn it into a stake per bet.', 'Never top up after a loss. A bad run does not mean a win is due.', 'Use the tools your bookmaker gives you: deposit limits, time-outs and self-exclusion. Licensed bookmakers should offer them.', 'Keep a record of every bet. Seeing the real totals changes how people feel about betting.', 'Take regular breaks, and stay away from betting when you are stressed, angry or have been drinking.' ]],
  ['Where to get help',
   'Free, confidential support exists. BeGambleAware.org and GamblingTherapy.org (linked above) give advice and online chat in English, and many countries have their own helplines, so search for “gambling help” plus your country. Talking to a trusted friend or family member also helps more than most people expect.',
   'Betting is for adults aged 18 or older, and the rules differ by country and state. In Nigeria, check that a bookmaker is licensed by the relevant regulator before you deposit. You can also read <a href="is-this-betting-site-safe.html">how to check whether a betting site is safe</a>.']
] };

KW['why-an-empty-day-is-a-good-day.html'] = { s: [
  ['What to do on a day with no pick',
   'A day with no pick feels like wasted time, but it is the method working. We only publish a tip when the market rates it above a minimum chance. When nothing clears that bar, the honest output is nothing. Filling the gap with weak picks would raise the number of tips and lower their quality.',
   [ 'Use the time to read the <a href="track-record.html">track record</a> and see which markets are really winning.', 'Learn one new market. The <a href="best-football-betting-markets-for-beginners.html">beginner’s guide to markets</a> is a good start.', 'Plan tomorrow. The <a href="football-predictions-tomorrow.html">tomorrow page</a> shows early prices.', 'Do nothing. Not betting is a position, and it costs nothing.' ]],
  ['Why bettors lose money on quiet days',
   'A common pattern in betting is that people who feel they must have action tend to bet on games they know little about, in leagues they never follow, at prices that are rarely good. A quiet day removes that pressure. It also protects your bankroll, which is the only thing that lets you bet next week.']
] };

KW['why-a-70-percent-pick-still-loses.html'] = { s: [
  ['The maths of a 70% pick, in plain numbers',
   'A 70% pick wins seven times in ten on average. “On average” hides a lot. Over ten such picks, the chance of at least one loss is about 97%, and over twenty it is almost certain. Three losses in a row sounds rare, but across 30 picks the chance of seeing at least one run of three is about 44%, and across 100 picks it is about 86%.',
   'None of that means the pick was wrong. It means the numbers are doing what they should. The right question after a loss is not “was the tip bad?” but “was the price fair, and is my stake small enough that this loss does not matter?”'],
  ['How to judge a tipster fairly',
   [ 'Group results by stated chance. Do 70% picks win about 70% of the time over many bets?', 'Look at a long window, not a good week. Our <a href="track-record.html">track record</a> shows 30 days by market.', 'Check that losses are shown. A record with no losing days is not a record.', 'Stake small enough to survive a streak. See <a href="betting-bankroll-and-staking.html">bankroll and staking</a>.' ]]
] };

KW['how-accumulator-bets-work.html'] = { s: [
  ['A worked example, step by step',
   'Say you stake 1,000 on four legs priced 1.50 each. The total odds are 1.50 × 1.50 × 1.50 × 1.50 = 5.06, so the return is 5,062 and the profit is 4,062. That looks generous until you do the second half of the sum. If each leg wins 66.7% of the time, which is what 1.50 implies, all four win together only about 20% of the time, or one slip in five.',
   'This is why accumulators feel exciting and lose often. The price grows with every leg, but the chance of winning shrinks even faster.'],
  ['Things that surprise people',
   [ 'If one leg is void, for example the match is postponed, most bookmakers settle the slip without it, at odds of 1.00 for that leg. Check the rules in your app.', 'Legs from the same match can be linked. A bookmaker may not allow them in a normal accumulator, which is what a <a href="bet-builder-explained.html">bet builder</a> is for.', 'Cash out lets you take a smaller return before all legs finish. Read <a href="cash-out-explained.html">cash out explained</a> before relying on it.', 'Systems such as the <a href="lucky-15-yankee-system-bets-explained.html">Lucky 15 and Yankee</a> cover several combinations so one loss does not end the whole bet.', 'Bonuses on accumulators can look big but come with conditions. Read the small print.' ],
   'To reduce how often accumulators fail, read <a href="how-to-avoid-losing-accumulators.html">how to avoid losing accumulators</a>.']
] };

KW['accumulator-maths-the-slip-never-shows.html'] = { s: [
  ['The hidden cost: margin multiplies too',
   'Every price includes the bookmaker’s margin, and in an accumulator that margin is multiplied along with the odds. Suppose four legs have a fair price of 2.00 each, so fair total odds of 16.00. If the bookmaker offers 1.90 on each leg, a margin of about 5% per leg, the total is 1.90 × 1.90 × 1.90 × 1.90 = 13.03. You have given up about 18.5% of the fair return without noticing.',
   'With five legs it gets worse: 1.90 to the power of five is 24.76 against a fair 32.00, about 22.6% lower. That is the reason shorter slips are not only less risky but also cheaper to play.'],
  ['What to do with this',
   'Use fewer legs, compare prices between bookmakers before you confirm, and check the combined chance, not just the combined odds. Our <a href="accumulator-calculator.html">accumulator calculator</a> shows both, and the <a href="margin-remover-calculator.html">margin remover</a> shows how much of each price is the bookmaker’s cut.']
] };

KW['tools.html'].s.push(['How the tools fit together',
  'A simple routine uses three of them in order. First, check what a price really says with the odds converter or margin remover. Second, build your slip on the accumulator calculator and look at the combined chance, not only the combined odds. Third, set your stake with the stake size calculator before you place anything. The whole routine takes about two minutes and it stops most of the common mistakes: backing a price that is worse than it looks, stacking too many legs and staking more than you planned.',
  'Everything runs in your browser and needs no account. If a term is new, the <a href="football-betting-glossary.html">glossary</a> explains it in plain words, and <a href="expected-value-in-betting.html">expected value</a> explains why the maths above matters over many bets.']);

// extra depth on short explainers
KW['stake-size-calculator.html'].s.push(['A worked example with a losing streak',
  'Say your bankroll is 50,000 and your unit is 1%, which is 500. A run of ten losses in a row, which is rare but possible, costs about 4,800 if you keep the stake at 1% of the shrinking bankroll, leaving about 45,200. The same run at 10% stakes would leave about 17,400, a loss of more than two-thirds. That difference is the whole argument for small stakes.',
  'The calculator shows this for your own numbers. Change the percentage and watch how the damage from a bad run changes. Most people are surprised how little 1% feels like on the day and how much it protects them over a month.']);
KW['what-is-double-chance-bet.html'].s.push(['When double chance is a smart choice, and when it is not',
  'Double chance is smart when you trust one team not to lose but cannot call a win. A strong home side against a mid-table visitor is the classic case: the home win might be 55%, the draw 25%, and 1X covers 80%. It is a poor choice when the price is so short that the bet barely pays. At odds of 1.15 you need to win about 87% of the time to break even, so check the price against the chance before you tap.',
  'It also pairs well with other markets. A 1X leg is a common anchor in a short accumulator, but remember that each leg lowers the combined chance. See <a href="how-to-avoid-losing-accumulators.html">how to avoid losing accumulators</a>.']);
KW['what-is-btts-gg-bet.html'].s.push(['Spotting a good GG game',
  'Good GG games have two features: both teams create chances, and at least one of them concedes regularly. Look at how many of each side’s last five matches had goals at both ends, not just total goals. A team that wins 3-0 every week is a poor GG pick even if it scores a lot. Also check lineups: a missing first-choice goalkeeper pushes GG up, and a missing main striker pushes it down.',
  'If the game has a heavy favourite, GG often fails because the weaker team never scores. If the match is between two cautious sides, it can fail because neither team does. For the market reversed, see <a href="both-teams-not-to-score-predictions.html">BTTS No</a>.']);
KW['betting-bankroll-and-staking.html'].s.push(['A simple weekly routine',
  [ 'Sunday: set the week’s budget, and the unit (1% to 2%).', 'Each day: write the bet, the odds, the stake and the reason, before you place it.', 'After each result: record win or loss. Do not change the stake because of it.', 'Next Sunday: add up the week. If the bankroll changed by a meaningful amount, reset the unit. If not, leave it.' ],
  'It sounds boring, and that is the point. The people who last in betting are the ones who treat it like bookkeeping.']);

// ============ RELATED READING (internal links so no guide is left with one inbound link) ============
Object.assign(REL, {
  'index.html': [['is-this-betting-site-safe.html', 'Is this betting site safe?'], ['why-an-empty-day-is-a-good-day.html', 'Why an empty day is a good day'], ['why-a-70-percent-pick-still-loses.html', 'Why a 70% pick still loses']],
  'single-bet-vs-accumulator.html': [['bet-builder-explained.html', 'Bet builder explained'], ['cash-out-explained.html', 'Cash out explained'], ['lucky-15-yankee-system-bets-explained.html', 'Lucky 15 and Yankee']],
  '2-odds-predictions.html': [['cash-out-explained.html', 'Cash out explained'], ['bet-builder-explained.html', 'Bet builder explained']],
  '5-odds-predictions.html': [['lucky-15-yankee-system-bets-explained.html', 'Lucky 15 and Yankee bets'], ['how-to-avoid-losing-accumulators.html', 'How to avoid losing accumulators'], ['cash-out-explained.html', 'Cash out explained']],
  'accumulator-calculator.html': [['lucky-15-yankee-system-bets-explained.html', 'Lucky 15 and Yankee bets'], ['bet-builder-explained.html', 'Bet builder explained'], ['how-to-avoid-losing-accumulators.html', 'How to avoid losing accumulators']],
  'football-betting-glossary.html': [['football-betting-abbreviations-explained.html', 'Betting abbreviations'], ['corners-betting-explained.html', 'Corners betting'], ['jackpot-predictions-explained.html', 'Jackpot predictions'], ['asian-handicap-explained.html', 'Asian handicap'], ['what-is-expected-goals-xg.html', 'Expected goals (xG)']],
  'what-is-btts-gg-bet.html': [['football-betting-abbreviations-explained.html', 'Betting abbreviations'], ['what-is-expected-goals-xg.html', 'Expected goals (xG)']],
  'over-2-5-goals-predictions.html': [['what-is-expected-goals-xg.html', 'Expected goals (xG)'], ['how-to-read-football-form.html', 'How to read football form'], ['corners-betting-explained.html', 'Corners betting']],
  'premier-league-predictions.html': [['how-to-read-football-form.html', 'How to read football form']],
  'la-liga-predictions.html': [['how-to-read-football-form.html', 'How to read football form']],
  'serie-a-predictions.html': [['how-to-read-football-form.html', 'How to read football form']],
  'bundesliga-predictions.html': [['how-to-read-football-form.html', 'How to read football form'], ['what-is-expected-goals-xg.html', 'Expected goals (xG)']],
  '1x2-predictions.html': [['how-to-read-football-form.html', 'How to read football form'], ['what-is-expected-goals-xg.html', 'Expected goals (xG)']],
  'safest-football-tips-today.html': [['why-an-empty-day-is-a-good-day.html', 'Why an empty day is a good day'], ['is-this-betting-site-safe.html', 'Is this betting site safe?']],
  'track-record.html': [['why-an-empty-day-is-a-good-day.html', 'Why an empty day is a good day'], ['why-a-70-percent-pick-still-loses.html', 'Why a 70% pick still loses'], ['expected-value-in-betting.html', 'Expected value in betting']],
  'are-sure-odds-real.html': [['jackpot-predictions-explained.html', 'Jackpot predictions explained'], ['is-this-betting-site-safe.html', 'Is this betting site safe?']],
  'kelly-staking-calculator.html': [['expected-value-in-betting.html', 'Expected value in betting'], ['value-betting-explained.html', 'Value betting explained']],
  'stake-size-calculator.html': [['expected-value-in-betting.html', 'Expected value in betting']],
  'margin-remover-calculator.html': [['expected-value-in-betting.html', 'Expected value in betting']],
  'how-it-works.html': [['what-is-expected-goals-xg.html', 'Expected goals (xG)'], ['expected-value-in-betting.html', 'Expected value in betting'], ['why-an-empty-day-is-a-good-day.html', 'Why an empty day is a good day']],
  'tools.html': [['asian-handicap-explained.html', 'Asian handicap explained'], ['expected-value-in-betting.html', 'Expected value in betting']],
  'pick-of-the-day.html': [['why-an-empty-day-is-a-good-day.html', 'Why an empty day is a good day'], ['why-a-70-percent-pick-still-loses.html', 'Why a 70% pick still loses']],
  'football-predictions-weekend.html': [['lucky-15-yankee-system-bets-explained.html', 'Lucky 15 and Yankee bets'], ['how-to-avoid-losing-accumulators.html', 'How to avoid losing accumulators']]
});

// ============ DEEPER NEW GUIDES (no thin pages) ============
const G = (slug) => NEW_GUIDES.find((g) => g.slug === slug);
G('how-bookmakers-calculate-football-odds').body += `<h2>A worked example for goals markets</h2><p>Two-way markets work the same way. Say a bookmaker offers Over 2.5 at 1.85 and Under 2.5 at 1.95. The implied chances are 54.1% and 51.3%, which add to 105.3%. The extra 5.3% is the margin. Remove it by dividing each by 1.053 and you get a fair 51.3% for over and 48.7% for under. Notice that the bookmaker does not think over is 54%. It thinks it is about 51%, and charges you for the difference.</p><h2>Why two bookmakers can disagree</h2><p>Bookmakers do not copy each other exactly. They use different models, different customers and different risk. A bookmaker whose customers love backing home teams will shorten the away price to protect itself, while another does the opposite. That is why the same game can be 1.85 in one app and 1.78 in another, and why it can pay to compare before you confirm.</p><h2>Margins are not the same everywhere</h2><p>Big leagues with lots of money traded on them, like the Premier League, usually have tighter margins. Smaller leagues have wider ones because the bookmaker knows less and risks more. Accumulators multiply the margin on every leg, so a slip of five legs from small leagues can carry a very large hidden cost. The <a href="accumulator-maths-the-slip-never-shows.html">accumulator maths guide</a> shows the numbers.</p><h2>What “value” means</h2><p>A bet has value when the real chance of winning is higher than the chance the price implies. If you believe a team wins 55% of the time and the odds are 2.10, which implies 47.6%, you see value. The hard part is that your estimate of 55% might be wrong. That is why most professionals stake small and why <a href="expected-value-in-betting.html">expected value</a> is a long-run idea, not a promise on any single bet.</p>`;
G('how-to-avoid-losing-accumulators').body += `<h2>A slip taken apart</h2><p>Here is a five-leg slip priced 1.30, 1.35, 1.40, 1.45 and 1.50. The total odds are 5.34, which looks pleasant. The combined chance, using the prices alone, is about 18.7%, so the slip loses roughly four times in five. Now drop the two shortest prices and keep the 1.40, 1.45 and 1.50. The total falls to 3.05, but the combined chance rises to about 32.8%. You lost less than half the return and nearly doubled the chance of winning. Run your own slips through the <a href="accumulator-calculator.html">accumulator calculator</a> and you will often see the same pattern.</p><h2>Common mistakes</h2><ul><li>Adding a “safe” leg at 1.10 to nudge the total. It adds almost no return and one more way to lose.</li><li>Building the slip from the total backwards: “I need 10 odds, what fits?”</li><li>Stacking correlated legs, such as two Over 1.5 goals picks in the same league on the same night.</li><li>Cashing out in panic, or never cashing out at all. Decide your rule in advance; see <a href="cash-out-explained.html">cash out explained</a>.</li><li>Raising the stake after a near miss. A “so close” slip lost, and the next one is a new bet.</li></ul><h2>When the best slip is no slip</h2><p>If you cannot find three legs you honestly like, do not build one. A single bet, or a quiet day, is better than a slip of picks you do not believe in. See <a href="why-an-empty-day-is-a-good-day.html">why an empty day is a good day</a>.</p>`;
G('football-predictions-nigeria-time-wat').body += `<h2>When the gap with Europe changes</h2><p>Europe and the UK move their clocks on the last Sunday of March and the last Sunday of October. In 2026 the clocks went back on 25 October, and in 2027 they go forward on 28 March. Nigeria does not change, so in between, a 3pm UK kick-off is 4pm in Nigeria, and a 9pm game in Spain, Italy, Germany or France is 9pm in Nigeria. In the summer the UK is on the same clock as Nigeria, and central Europe is one hour ahead of it. A kick-off time you saved last spring may be an hour out now.</p><h2>A typical week in Nigerian time</h2><ul><li><b>Friday:</b> a few league openers, mostly in the evening.</li><li><b>Saturday:</b> the busiest day. English games from early afternoon, with Spanish, Italian and German games in the late afternoon and evening.</li><li><b>Sunday:</b> a second big day, with late evening games from Spain and Italy.</li><li><b>Tuesday and Wednesday:</b> Champions League, usually from 6:45pm and 9:00pm in the European winter.</li><li><b>Thursday:</b> Europa League, with an earlier and a later slot.</li></ul><h2>How to avoid mistakes</h2><p>Set your phone to Lagos time, then compare the time on the ZurePicks card with the time in your betting app before you confirm. If the two disagree by an hour, one of them is on the wrong time zone. Remember too that live prices change quickly after kick-off, so the tip you read before the game is no use once it starts.</p>`;
G('best-football-betting-markets-for-beginners').body += `<h2>The same game, six ways</h2><p>Imagine a home favourite at 1.70 to win, a draw at 3.80 and an away win at 5.00. The six markets above would look like this for that game:</p><ul><li><b>Home win (1X2):</b> 1.70, which implies about 59%. You lose if it is a draw or an away win.</li><li><b>Double chance 1X:</b> around 1.20, covering a home win or a draw, about 83%.</li><li><b>Over 1.5 goals:</b> often around 1.30, about 77%.</li><li><b>Over 2.5 goals:</b> often near 1.90, about 52%.</li><li><b>BTTS Yes:</b> often near 1.85, about 54%.</li><li><b>Draw no bet, home:</b> around 1.30, with your stake back if it is a draw.</li></ul><p>The prices are examples, not live odds, but the pattern is real. The safer the market, the shorter the price. There is no market that is both very safe and very well paid. If you ever see one, check the margin.</p><h2>A sensible first week</h2><ol><li>Pick one league you follow and one market from the list. Do not mix more.</li><li>Place only single bets, with a stake of 1% of your budget.</li><li>Write down every bet and result.</li><li>At the end of the week, see how your picks did against the chance you expected. Then change one thing, not three.</li></ol><p>When you are ready for more, the next steps are <a href="corners-betting-explained.html">corners</a>, <a href="asian-handicap-explained.html">Asian handicap</a> and <a href="bet-builder-explained.html">bet builders</a>. The shorthand you will meet in apps is in <a href="football-betting-abbreviations-explained.html">betting abbreviations explained</a>.</p>`;
G('betting-tips-for-sportybet-bet9ja-msport-1xbet').body += `<h2>Before you deposit anywhere</h2><p>Check that the bookmaker is licensed where you live, that it has clear rules on withdrawals and that it offers limits and self-exclusion. Our guide on <a href="is-this-betting-site-safe.html">how to check whether a betting site is safe</a> walks through it. Also read the rules on void legs and early cash out, because they change how an accumulator is settled. See <a href="cash-out-explained.html">cash out explained</a>.</p>`;

Object.assign(REL, {
  'index.html': [...REL['index.html'], ['betting-tips-for-sportybet-bet9ja-msport-1xbet.html', 'Using our tips on SportyBet, Bet9ja, MSport and 1xBet']],
  'football-predictions-weekend.html': [...REL['football-predictions-weekend.html'], ['betting-tips-for-sportybet-bet9ja-msport-1xbet.html', 'Tips for your betting app']],
  'btts-predictions.html': [['over-2-5-goals-vs-btts.html', 'Over 2.5 goals vs BTTS: which is better?']],
  'under-2-5-goals-predictions.html': [['over-2-5-goals-vs-btts.html', 'Over 2.5 goals vs BTTS']]
});
