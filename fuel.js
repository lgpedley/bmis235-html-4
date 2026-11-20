/* =====================================================================
   Fuel Up · app logic
   Everything is stored in localStorage on this device only.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Research-backed facts. Every encouragement pulls from these.
     --------------------------------------------------------------- */
  const FACTS = {
    brain: {
      text: 'Your brain uses about 20% of your body\'s energy, and its main fuel is carbohydrate. The recommended minimum of 130 g of carbs a day is set by how much your brain needs.',
      src: 'Institute of Medicine, Dietary Reference Intakes for Macronutrients (2005)'
    },
    breakfast: {
      text: 'In a 2013 study, people who ate a protein-rich breakfast had fewer cravings and snacked less in the evening than people who skipped breakfast.',
      src: 'Leidy et al., Obesity (2013)'
    },
    protein: {
      text: 'Getting about 25–30 g of protein at a meal helps you feel full longer and supports your muscles.',
      src: 'Paddon-Jones et al., American Journal of Clinical Nutrition (2008)'
    },
    veg: {
      text: 'Only about 1 in 10 U.S. adults eat enough vegetables, so every veggie you eat puts you ahead of most people.',
      src: 'CDC, Morbidity and Mortality Weekly Report (2017)'
    },
    fruit: {
      text: 'Only about 1 in 8 U.S. adults eat enough fruit. Fruit gives you vitamin C, potassium and fiber, plus quick natural energy.',
      src: 'CDC, Morbidity and Mortality Weekly Report (2017)'
    },
    fiber: {
      text: 'Only about 5% of Americans get enough fiber. Fiber slows digestion, so you stay full longer and have fewer cravings.',
      src: 'Quagliani & Felt-Gunderson, American Journal of Lifestyle Medicine (2017)'
    },
    dairy: {
      text: 'About 90% of Americans don\'t get enough dairy, which supplies calcium and vitamin D for strong bones.',
      src: 'Dietary Guidelines for Americans, 2020–2025'
    },
    salmon: {
      text: 'Salmon is one of the best food sources of omega-3 fats, which support your heart and brain. The Dietary Guidelines suggest about 8 oz of seafood a week.',
      src: 'Dietary Guidelines for Americans, 2020–2025'
    },
    iron: {
      text: 'Your body absorbs about 15–35% of the iron in red meat, compared with 2–20% from plant foods. Iron carries oxygen and helps fight tiredness.',
      src: 'NIH Office of Dietary Supplements, Iron Fact Sheet'
    },
    potato: {
      text: 'A medium baked potato with the skin has about 900 mg of potassium, more than twice what a banana has.',
      src: 'USDA FoodData Central'
    },
    broccoli: {
      text: 'Half a cup of cooked broccoli gives you more than half the vitamin C you need in a day.',
      src: 'NIH Office of Dietary Supplements, Vitamin C Fact Sheet'
    },
    timing: {
      text: 'The American Heart Association notes that planning when you eat, and not skipping meals, supports steadier energy and healthier eating overall.',
      src: 'St-Onge et al., Circulation (2017)'
    }
  };

  /* ---------------------------------------------------------------
     Food groups
     --------------------------------------------------------------- */
  const GROUPS = {
    carbs:   { label: 'Carbs & starches', emoji: '🍞', goal: 14, fact: 'brain',
               why: 'Your body\'s favorite, fastest fuel. Carbs power your brain and muscles.',
               ideas: ['Toast or garlic bread with a meal', 'Potatoes in any form', 'Pasta or butter noodles'] },
    protein: { label: 'Protein', emoji: '🐟', goal: 14, fact: 'protein',
               why: 'Keeps you full for hours, steadies your energy and builds muscle.',
               ideas: ['Salmon: bake it with garlic butter', 'Steak or a burger patty', 'Add cheese to toast for a bit extra'] },
    veg:     { label: 'Veggies', emoji: '🥦', goal: 14, fact: 'veg',
               why: 'Vitamins, minerals and fiber that help you feel good and stay full.',
               ideas: ['Broccoli stirred into alfredo or mac', 'Sweet corn on the side', 'Pickles count as a crunchy extra!'] },
    fruit:   { label: 'Fruit', emoji: '🍓', goal: 7, fact: 'fruit',
               why: 'Natural sweetness, vitamin C and fiber. Great for curbing late-night sweet cravings.',
               ideas: ['Strawberries or grapes as a snack', 'Apple slices with something salty', 'A banana before you leave the house'] },
    dairy:   { label: 'Dairy', emoji: '🧀', goal: 14, fact: 'dairy',
               why: 'Calcium and vitamin D for strong bones, plus some protein.',
               ideas: ['Cheese in grilled cheese or mac', 'Alfredo or rosatella sauce', 'A glass of milk with dinner'] },
    fun:     { label: 'Fun foods', emoji: '🌶️', goal: 0, fact: null,
               why: 'Food is also joy! Fun foods have a place, and pairing them with a meal can keep cravings calmer.',
               ideas: ['Hot Cheetos as a crunchy side with a grilled cheese', 'Pour a bowl to enjoy instead of eating from the bag'] }
  };
  const GROUP_KEYS = Object.keys(GROUPS);

  const DEFAULT_FOODS = [
    ['Toast', ['carbs'], 80], ['Garlic bread', ['carbs'], 150], ['Pickles', ['veg'], 5],
    ['Hot Cheetos', ['fun'], 170], ['Mac and cheese', ['carbs', 'dairy'], 380], ['Pasta', ['carbs'], 220],
    ['Alfredo sauce', ['dairy'], 110], ['Butter noodles', ['carbs'], 300], ['Salmon', ['protein'], 230],
    ['Beef / burger', ['protein'], 250], ['Steak', ['protein'], 320], ['Sweet corn', ['veg'], 90],
    ['Grilled cheese', ['carbs', 'dairy'], 400], ['Rosatella sauce', ['dairy'], 100], ['Broccoli', ['veg'], 30],
    ['Fries', ['carbs'], 320], ['Potatoes', ['carbs', 'veg'], 160]
  ].map(([name, groups, cal]) => ({ id: uid(), name, groups, cal }));

  /* ---------------------------------------------------------------
     Recipes. "needs" = keyword groups that must match a liked food.
     --------------------------------------------------------------- */
  const RECIPES = [
    { name: 'Garlic Butter Salmon with Roasted Broccoli', needs: [['salmon'], ['broccoli']], cal: 480, mins: 25, fact: 'salmon',
      groups: ['protein', 'veg'], stretch: 'Squeeze of lemon on top',
      ingredients: ['1 salmon fillet', '2 cups broccoli florets', '1 tbsp butter + 1 clove garlic (minced)', 'Salt, pepper, olive oil', 'Optional: a slice of garlic bread'],
      steps: ['Heat the oven to 400°F (200°C).', 'Toss broccoli with oil and salt on one side of a sheet pan.', 'Put salmon on the other side, top with garlic and butter.', 'Bake 12–15 minutes until the salmon flakes with a fork.', 'Serve with garlic bread if you want it.'] },
    { name: 'Steak, Crispy Potatoes & Sweet Corn', needs: [['steak'], ['potato', 'fries'], ['corn']], cal: 680, mins: 35, fact: 'iron',
      groups: ['protein', 'carbs', 'veg'], stretch: 'Try a few green beans on the side',
      ingredients: ['1 steak (6 oz)', '2 small potatoes, cubed (or frozen fries)', '1 ear sweet corn', 'Butter, salt, pepper, garlic powder'],
      steps: ['Roast potatoes at 425°F (220°C) with oil and salt for 25 minutes (or bake fries per bag).', 'Boil or microwave corn 4–5 minutes, then add butter.', 'Pat steak dry, season, and sear in a hot pan 3–4 min per side.', 'Rest the steak 5 minutes, slice and serve.'] },
    { name: 'Creamy Broccoli Alfredo', needs: [['pasta', 'noodle'], ['alfredo'], ['broccoli']], cal: 620, mins: 20, fact: 'broccoli',
      groups: ['carbs', 'dairy', 'veg'], stretch: 'Add a piece of salmon on top for protein',
      ingredients: ['2 oz pasta (fettuccine or any shape)', '½ cup alfredo sauce', '1 cup broccoli florets', 'Parmesan, black pepper'],
      steps: ['Boil pasta. Add broccoli to the same pot for the last 3 minutes.', 'Drain and return to the pot.', 'Stir in warm alfredo sauce.', 'Top with parmesan and pepper.'] },
    { name: 'Rosatella Pasta with Roasted Broccoli', needs: [['pasta', 'noodle'], ['rosatella', 'rosa'], ['broccoli']], cal: 560, mins: 25, fact: 'broccoli',
      groups: ['carbs', 'dairy', 'veg'], stretch: 'Stir in a handful of spinach; it melts right in',
      ingredients: ['2 oz pasta', '½ cup rosatella sauce', '1 cup broccoli', 'Olive oil, salt, parmesan'],
      steps: ['Roast broccoli at 425°F with oil and salt for 15 minutes until crispy edges.', 'Boil pasta and drain.', 'Toss pasta with warm rosatella sauce.', 'Top with the roasted broccoli and parmesan.'] },
    { name: 'Cheeseburger Potato Bowl', needs: [['beef', 'burger'], ['potato', 'fries'], ['pickle']], cal: 650, mins: 30, fact: 'iron',
      groups: ['protein', 'carbs', 'veg'], stretch: 'Add some shredded lettuce for crunch',
      ingredients: ['4 oz ground beef', 'Fries or cubed potatoes', 'Sliced pickles', 'Shredded cheese', 'Ketchup + mustard (or burger sauce)'],
      steps: ['Bake fries or roast potatoes until crispy.', 'Brown the beef in a pan with salt, pepper and garlic powder.', 'Pile fries in a bowl, top with beef and cheese.', 'Finish with pickles and sauce.'] },
    { name: 'Steak & Cheese Garlic Melt', needs: [['steak'], ['grilled cheese', 'bread', 'toast']], cal: 620, mins: 20, fact: 'protein',
      groups: ['protein', 'carbs', 'dairy'], stretch: 'Add sautéed peppers or onions',
      ingredients: ['4 oz steak, thinly sliced (leftovers are perfect)', '2 slices bread', 'Butter + garlic powder', '2 slices cheese'],
      steps: ['Butter the outside of the bread and sprinkle with garlic powder.', 'Quickly sear the steak slices 1–2 minutes.', 'Build: bread, cheese, steak, cheese, bread.', 'Cook in a pan like grilled cheese, 3 minutes per side.'] },
    { name: 'Loaded Broccoli Baked Potato', needs: [['potato'], ['broccoli']], cal: 420, mins: 15, fact: 'potato',
      groups: ['carbs', 'veg', 'dairy'], stretch: 'Top with a little chopped steak or salmon for protein',
      ingredients: ['1 large potato', '1 cup broccoli', 'Shredded cheese', 'Butter, salt'],
      steps: ['Poke the potato with a fork. Microwave 8–10 minutes, flipping halfway.', 'Microwave broccoli with a splash of water 2–3 minutes.', 'Split the potato, add butter and salt.', 'Pile on broccoli and cheese; microwave 30 seconds to melt.'] },
    { name: 'Baked Mac & Cheese with Broccoli', needs: [['mac'], ['broccoli']], cal: 520, mins: 25, fact: 'veg',
      groups: ['carbs', 'dairy', 'veg'], stretch: 'Serve with a small piece of salmon',
      ingredients: ['1 box or 2 cups mac and cheese', '1 cup chopped broccoli', 'Extra shredded cheese', 'Breadcrumbs (or crushed crackers)'],
      steps: ['Make mac and cheese as usual, adding broccoli for the last 3 minutes.', 'Pour into a baking dish, top with cheese and breadcrumbs.', 'Bake at 375°F (190°C) for 10–12 minutes until golden.'] },
    { name: 'Salmon & Corn Potato Cakes', needs: [['salmon'], ['potato'], ['corn']], cal: 500, mins: 30, fact: 'salmon',
      groups: ['protein', 'carbs', 'veg'], stretch: 'Dip in a lemon-mayo sauce',
      ingredients: ['1 cooked salmon fillet, flaked', '1 cup mashed potato', '½ cup sweet corn', '1 egg, salt, garlic powder'],
      steps: ['Mix salmon, mashed potato, corn, egg and seasonings.', 'Shape into 4 small patties.', 'Pan-fry in butter 3–4 minutes per side until golden.'] },
    { name: 'Garlic Butter Noodles with Salmon', needs: [['butter noodle', 'noodle', 'pasta'], ['salmon']], cal: 640, mins: 20, fact: 'protein',
      groups: ['carbs', 'protein'], stretch: 'Toss in a cup of broccoli or peas',
      ingredients: ['2 oz noodles', '1 salmon fillet', '1 tbsp butter + garlic', 'Parmesan, salt, pepper'],
      steps: ['Bake or pan-sear salmon 10–12 minutes.', 'Boil noodles, drain, toss with butter, garlic and parmesan.', 'Flake the salmon on top.'] }
  ];

  /* ---------------------------------------------------------------
     Storage
     --------------------------------------------------------------- */
  const KEY = 'fuelup.v1';
  let state = load();

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.foods) && Array.isArray(s.entries)) {
        s.settings = Object.assign({ calories: true }, s.settings);
        return s;
      }
    } catch (e) { /* ignore */ }
    return { foods: DEFAULT_FOODS.slice(), entries: [], settings: { calories: true }, recipeOffset: 0 };
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: app still works this visit */ }
  }

  /* ---------------------------------------------------------------
     Helpers
     --------------------------------------------------------------- */
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  const $ = (sel) => document.querySelector(sel);
  function dayKey(d) { d = new Date(d); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function fmtTime(d) { return new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  function fmtDay(d) { return new Date(d).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }); }
  function hourOf(d) { d = new Date(d); return d.getHours() + d.getMinutes() / 60; }
  function localInputValue(d) {
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function entriesOn(d) { const k = dayKey(d); return state.entries.filter(e => dayKey(e.ts) === k).sort((a, b) => new Date(a.ts) - new Date(b.ts)); }
  function groupsOf(entry) { const s = new Set(); entry.foods.forEach(f => f.groups.forEach(g => s.add(g))); return s; }
  function hasFood(entry, word) { return entry.foods.some(f => f.name.toLowerCase().includes(word)); }
  function likedIn(group) { return state.foods.filter(f => f.groups.includes(group)).map(f => f.name); }
  function factHTML(key) {
    const f = FACTS[key]; if (!f) return '';
    return '<p class="fact">📊 ' + esc(f.text) + '<span class="src">Source: ' + esc(f.src) + '</span></p>';
  }
  function suggestFrom(group) {
    const mine = likedIn(group);
    return mine.length ? mine.slice(0, 2).join(' or ').toLowerCase() : GROUPS[group].ideas[0].toLowerCase();
  }

  /* ---------------------------------------------------------------
     Encouragement after logging one entry
     --------------------------------------------------------------- */
  function cheerFor(entry) {
    const day = entriesOn(entry.ts);
    const h = hourOf(entry.ts);
    const first = day[0] && day[0].id === entry.id;
    const groups = groupsOf(entry);
    const eveningCount = day.filter(e => hourOf(e.ts) >= 18).length;
    const heavy = (entry.cal || 0) >= 600 || (!groups.has('protein') && (groups.has('carbs') || groups.has('fun')));
    let head, body, fact, tip = '';

    if (first && h >= 15) {
      head = pick(['You fed your body today. That\'s a real win. 💛', 'You ate, and that\'s what matters most right now. 💛']);
      body = 'Some days appetite is quiet or life gets busy. Eating now is exactly the right move, with zero guilt.';
      fact = 'breakfast';
      tip = 'Tomorrow, try one small thing before noon, even a slice of toast. It can make evenings feel calmer.';
    } else if (h >= 20 && eveningCount >= 3) {
      head = 'Your body asked for fuel, and you listened. 💛';
      body = 'Being extra hungry at night is your body catching up on energy it needed earlier. That\'s not a failure; it\'s biology.';
      fact = 'timing';
      tip = 'Tomorrow is a fresh start: try a real meal before 2 pm so tonight-you isn\'t running on empty.';
    } else if (hasFood(entry, 'salmon')) {
      head = 'Salmon! Your heart and brain say thank you. 🐟'; body = 'That\'s a seriously nourishing choice.'; fact = 'salmon';
    } else if (hasFood(entry, 'steak') || hasFood(entry, 'beef')) {
      head = 'Steak power! 💪'; body = 'Great protein and an easy-to-absorb kind of iron.'; fact = 'iron';
    } else if (groups.has('protein')) {
      head = 'Yay, protein in! 💪'; body = 'This one will keep you going for a while.'; fact = 'protein';
    } else if (hasFood(entry, 'broccoli')) {
      head = 'Broccoli! Look at you go. 🥦'; body = 'Green on the plate is a big deal.'; fact = 'broccoli';
    } else if (hasFood(entry, 'potato') || hasFood(entry, 'fries')) {
      head = 'Potatoes are secretly mighty. 🥔'; body = 'Comforting and packed with more than you\'d think.'; fact = 'potato';
    } else if (groups.has('veg')) {
      head = 'Veggies in! 🌽'; body = 'Every bit of color adds up.'; fact = 'veg';
    } else if (heavy) {
      head = pick(['That\'s real fuel. 🔥', 'Hearty meal, happy body. 🔥', 'Energy: loaded. 🔋']);
      body = 'Filling, energy-rich food is exactly what keeps you going, especially if you haven\'t eaten much today.';
      fact = 'brain';
    } else if (entry.type === 'snack') {
      head = pick(['Snack logged. Snacks count! ✨', 'A little fuel is still fuel. ✨']);
      body = 'Listening to hunger is a good thing.'; fact = 'fiber';
    } else {
      head = 'Meal logged! 🎉'; body = 'You took care of yourself. That\'s worth celebrating.'; fact = 'timing';
    }

    if (!tip) {
      if (!groups.has('protein')) tip = 'Maybe try adding some protein next time, like ' + suggestFrom('protein') + '. It helps the energy last longer.';
      else if (!groups.has('veg')) tip = 'Next time, a side of ' + suggestFrom('veg') + ' would round it out nicely.';
      else if (entry.type === 'snack') tip = 'Pairing a snack with protein keeps you satisfied longer.';
    }

    return '<h2>' + esc(head) + '</h2><p>' + esc(body) + '</p>' + factHTML(fact) + (tip ? '<p class="tip">💡 ' + esc(tip) + '</p>' : '');
  }

  /* ---------------------------------------------------------------
     Daily note (top of Today)
     --------------------------------------------------------------- */
  function dailyNote() {
    const now = new Date(), h = hourOf(now), day = entriesOn(now);
    const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    if (!day.length) {
      if (h < 12) return '<h2>' + greet + '! ☀️</h2><p>Whenever you\'re ready, even something small, like toast, is a wonderful start to the day.</p>' + factHTML('breakfast');
      return '<h2>' + greet + '! 💛</h2><p>Nothing logged yet today, and that\'s okay. Your body would love some fuel. What sounds good from your list?</p>' + factHTML('brain');
    }
    const meals = day.filter(e => e.type === 'meal').length;
    const snacks = day.length - meals;
    const all = new Set(); day.forEach(e => groupsOf(e).forEach(g => all.add(g)));
    const missing = ['protein', 'veg', 'fruit'].filter(g => !all.has(g));
    let msg = 'You\'ve fed yourself ' + day.length + ' time' + (day.length > 1 ? 's' : '') + ' today';
    msg += meals ? ' (' + meals + ' meal' + (meals > 1 ? 's' : '') + (snacks ? ', ' + snacks + ' snack' + (snacks > 1 ? 's' : '') : '') + ')' : '';
    msg += '. Proud of you.';
    let extra = '';
    if (missing.length) {
      const g = missing[0];
      extra = '<p class="tip">💡 Still room today for ' + GROUPS[g].label.toLowerCase() + ', maybe ' + esc(suggestFrom(g)) + '?</p>' + factHTML(GROUPS[g].fact);
    } else {
      extra = '<p class="tip">🌈 Protein, veggies AND fruit today. That\'s a beautifully balanced day.</p>';
    }
    return '<h2>' + greet + '! 💛</h2><p>' + msg + '</p>' + extra;
  }

  /* ---------------------------------------------------------------
     Week note
     --------------------------------------------------------------- */
  function weekNote() {
    const days = last7();
    const fed = days.filter(d => entriesOn(d).length).length;
    const beforeNoon = days.filter(d => entriesOn(d).some(e => hourOf(e.ts) < 12)).length;
    const meals = days.reduce((n, d) => n + entriesOn(d).filter(e => e.type === 'meal').length, 0);
    if (!fed) return '<h2>Your week starts whenever you log</h2><p>Every entry helps you see your own rhythm, with no grades and no streaks to break.</p>';
    let tip;
    if (beforeNoon < 4) tip = 'Small goal idea: eat something before noon on ' + Math.min(beforeNoon + 2, 7) + ' days next week.';
    else tip = 'You\'re eating earlier on most days. That\'s a steadier rhythm forming!';
    return '<h2>Look at this week 🌱</h2><p>You logged food on <b>' + fed + ' of 7 days</b>, including <b>' + meals + ' meal' + (meals === 1 ? '' : 's') + '</b>, and ate before noon on <b>' + beforeNoon + '</b> of them.</p><p class="tip">💡 ' + esc(tip) + '</p>' + factHTML('breakfast');
  }

  function last7() {
    const out = []; const t = new Date(); t.setHours(12, 0, 0, 0);
    for (let i = 6; i >= 0; i--) { const d = new Date(t); d.setDate(t.getDate() - i); out.push(d); }
    return out;
  }

  /* ---------------------------------------------------------------
     Charts (inline SVG)
     --------------------------------------------------------------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const C = { meal: '#724319', snack: '#D88180', grid: '#EED3A8', band: '#FEEAC7', bar: '#D88180', goal: '#724319' };

  // Timeline: rows of days, x = hour of day
  function scheduleSVG(days, rowLabels) {
    const W = rowLabels ? 680 : 420, left = rowLabels ? 92 : 12, right = 12, rowH = 34, top = 8, axisH = 22;
    const H = top + rowH * days.length + axisH;
    const x = (h) => left + (W - left - right) * (h / 24);
    let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Times you ate">';
    // daytime band 7am–7pm
    s += '<rect x="' + x(7) + '" y="' + top + '" width="' + (x(19) - x(7)) + '" height="' + rowH * days.length + '" fill="' + C.band + '" rx="8"/>';
    [0, 6, 12, 18, 24].forEach(h => {
      s += '<line x1="' + x(h) + '" x2="' + x(h) + '" y1="' + top + '" y2="' + (top + rowH * days.length) + '" stroke="' + C.grid + '" stroke-width="1"/>';
      const lab = h === 0 || h === 24 ? '12am' : h === 12 ? '12pm' : (h % 12) + (h < 12 ? 'am' : 'pm');
      s += '<text x="' + x(h) + '" y="' + (H - 4) + '" text-anchor="middle">' + lab + '</text>';
    });
    days.forEach((d, i) => {
      const cy = top + rowH * i + rowH / 2;
      s += '<line x1="' + left + '" x2="' + (W - right) + '" y1="' + cy + '" y2="' + cy + '" stroke="' + C.grid + '" stroke-dasharray="2 4"/>';
      if (rowLabels) s += '<text class="lab" x="0" y="' + (cy + 4) + '">' + new Date(d).toLocaleDateString([], { weekday: 'short', day: 'numeric' }) + '</text>';
      entriesOn(d).forEach(e => {
        const tipTxt = (e.type === 'meal' ? 'Meal' : 'Snack') + ' · ' + fmtTime(e.ts) + ' · ' + e.foods.map(f => f.name).join(', ');
        const cx = x(hourOf(e.ts));
        const mark = e.type === 'meal'
          ? '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="' + C.meal + '" stroke="#FFF6E6" stroke-width="2"/>'
          : '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="#fff" stroke="' + C.snack + '" stroke-width="3"/>';
        s += '<g class="hit" data-tip="' + esc(tipTxt) + '">' + mark + '<circle cx="' + cx + '" cy="' + cy + '" r="14" fill="transparent"/></g>';
      });
    });
    return s + '</svg>';
  }

  // Horizontal bars: servings per group (last 7 days) with goal tick
  function groupBarsSVG(counts) {
    const keys = GROUP_KEYS;
    const W = 680, left = 150, right = 70, rowH = 38, barH = 18, top = 4;
    const H = top + rowH * keys.length;
    const max = Math.max(14, ...keys.map(k => counts[k]), ...keys.map(k => GROUPS[k].goal));
    const x = (v) => left + (W - left - right) * (v / max);
    let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Food groups this week">';
    keys.forEach((k, i) => {
      const g = GROUPS[k], y = top + rowH * i + (rowH - barH) / 2, v = counts[k];
      s += '<text class="lab" x="0" y="' + (y + barH - 4) + '">' + g.emoji + ' ' + esc(g.label) + '</text>';
      s += '<rect x="' + left + '" y="' + y + '" width="' + (W - left - right) + '" height="' + barH + '" fill="' + C.band + '" rx="4"/>';
      if (v > 0) s += '<rect x="' + left + '" y="' + y + '" width="' + Math.max(4, x(v) - left) + '" height="' + barH + '" fill="' + C.bar + '" rx="4"/>';
      if (g.goal) s += '<line x1="' + x(g.goal) + '" x2="' + x(g.goal) + '" y1="' + (y - 4) + '" y2="' + (y + barH + 4) + '" stroke="' + C.goal + '" stroke-width="2"/>';
      const lbl = g.goal ? v + ' / ' + g.goal : String(v);
      s += '<text x="' + (W - right + 8) + '" y="' + (y + barH - 4) + '">' + lbl + '</text>';
      const tipTxt = g.label + ': ' + v + ' this week' + (g.goal ? ' (gentle goal: ' + g.goal + ')' : '');
      s += '<rect class="hit" data-tip="' + esc(tipTxt) + '" x="0" y="' + (top + rowH * i) + '" width="' + W + '" height="' + rowH + '" fill="transparent"/>';
    });
    return s + '</svg>';
  }

  // Tooltip for anything with data-tip
  const tooltip = $('#tooltip');
  document.addEventListener('pointermove', (ev) => {
    const t = ev.target.closest && ev.target.closest('[data-tip]');
    if (!t) { tooltip.hidden = true; return; }
    tooltip.textContent = t.getAttribute('data-tip');
    tooltip.hidden = false;
    const x = Math.min(ev.clientX + 14, window.innerWidth - tooltip.offsetWidth - 8);
    tooltip.style.left = x + 'px';
    tooltip.style.top = (ev.clientY + 14) + 'px';
  });

  /* ---------------------------------------------------------------
     Rendering
     --------------------------------------------------------------- */
  let logType = 'meal';
  let selected = new Set();   // food ids picked in the log form
  let extras = [];            // "something not on my list" foods

  function render() {
    document.body.classList.toggle('no-cal', !state.settings.calories);
    $('#cal-toggle').checked = state.settings.calories;
    renderToday(); renderWeek(); renderRecipe(); renderLearn(); renderFoods();
  }

  function groupOptions() {
    return GROUP_KEYS.map(k => '<option value="' + k + '">' + GROUPS[k].emoji + ' ' + GROUPS[k].label + '</option>').join('');
  }

  function renderPicker() {
    const chips = state.foods.map(f =>
      '<button type="button" class="chip' + (selected.has(f.id) ? ' on' : '') + '" data-food="' + f.id + '" aria-pressed="' + selected.has(f.id) + '">' + esc(f.name) + '</button>');
    extras.forEach((f, i) => chips.push('<button type="button" class="chip on" data-extra="' + i + '" title="Remove">' + esc(f.name) + '<span class="x">×</span></button>'));
    $('#pick-foods').innerHTML = chips.join('') || '<p class="muted">Add foods on the "My foods" tab.</p>';
    updateCalEstimate();
  }

  let calTouched = false;
  function updateCalEstimate() {
    if (calTouched) return;
    const total = state.foods.filter(f => selected.has(f.id)).reduce((n, f) => n + (f.cal || 0), 0)
      + extras.reduce((n, f) => n + (f.cal || 0), 0);
    $('#log-cal').value = total || '';
  }

  function entryRow(e) {
    const cal = state.settings.calories && e.cal ? ' <span class="muted">· ≈' + e.cal + ' cal</span>' : '';
    return '<li><span class="time">' + fmtTime(e.ts) + '</span><span class="what"><span class="tag ' + e.type + '">' + (e.type === 'meal' ? 'Meal' : 'Snack') + '</span>'
      + esc(e.foods.map(f => f.name).join(', ')) + cal + (e.note ? '<br><span class="muted">' + esc(e.note) + '</span>' : '') + '</span>'
      + '<button class="del" data-del="' + e.id + '" aria-label="Delete entry" title="Delete">×</button></li>';
  }

  function renderToday() {
    $('#daily-note').innerHTML = dailyNote();
    renderPicker();
    const day = entriesOn(new Date());
    const meals = day.filter(e => e.type === 'meal').length;
    const cal = day.reduce((n, e) => n + (e.cal || 0), 0);
    let stats = '<div class="stat"><b>' + meals + '</b><span>meals</span></div><div class="stat"><b>' + (day.length - meals) + '</b><span>snacks</span></div>'
      + '<div class="stat"><b>' + (day[0] ? fmtTime(day[0].ts) : '—') + '</b><span>first bite</span></div>';
    if (state.settings.calories) stats += '<div class="stat"><b>' + (cal || 0) + '</b><span>≈ calories</span></div>';
    $('#today-stats').innerHTML = stats;
    $('#today-timeline').innerHTML = scheduleSVG([new Date()], false);
    $('#today-list').innerHTML = day.map(entryRow).join('') || '<li class="muted">Nothing yet, and that\'s okay.</li>';
  }

  function renderWeek() {
    const days = last7();
    $('#week-note').innerHTML = weekNote();
    $('#week-schedule').innerHTML = scheduleSVG(days, true);

    const counts = {}; GROUP_KEYS.forEach(k => counts[k] = 0);
    days.forEach(d => entriesOn(d).forEach(e => groupsOf(e).forEach(g => { if (g in counts) counts[g]++; })));
    $('#week-groups').innerHTML = groupBarsSVG(counts)
      + '<p class="muted" style="margin-top:8px">The thin dark line on each bar is a gentle weekly goal, not a rule. Hover a bar for details.</p>';

    // Spotlight the group that's furthest from its goal
    const need = GROUP_KEYS.filter(k => GROUPS[k].goal).sort((a, b) => counts[a] / GROUPS[a].goal - counts[b] / GROUPS[b].goal)[0];
    const g = GROUPS[need];
    const mine = likedIn(need);
    $('#week-try').innerHTML = '<div class="card hello" style="margin:16px 0 0"><h2>' + g.emoji + ' One to add more of: ' + esc(g.label) + '</h2><p>' + esc(g.why) + '</p>'
      + (mine.length ? '<p><b>From your list:</b> ' + esc(mine.join(', ')) + '</p>' : '')
      + '<p><b>Easy ideas:</b> ' + esc(g.ideas.join(' · ')) + '</p>' + factHTML(g.fact) + '</div>';

    // History, newest first, last 14 days
    const byDay = {};
    state.entries.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts)).forEach(e => {
      const k = dayKey(e.ts); (byDay[k] = byDay[k] || []).push(e);
    });
    const keys = Object.keys(byDay).slice(0, 14);
    $('#history').innerHTML = keys.length ? keys.map(k => {
      const list = byDay[k].slice().reverse();
      return '<p class="day-head">' + fmtDay(list[0].ts) + '</p><ul class="entries">' + list.map(entryRow).join('') + '</ul>';
    }).join('') : '<p class="muted">Your logs will show up here.</p>';
  }

  function weekNumber() {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return Math.floor((d - new Date(1970, 0, 5)) / 6048e5); // weeks since a Monday
  }
  function recipeMatches(r) {
    const names = state.foods.map(f => f.name.toLowerCase());
    return r.needs.filter(opts => opts.some(w => names.some(n => n.includes(w)))).length;
  }
  function renderRecipe() {
    let pool = RECIPES.filter(r => recipeMatches(r) === r.needs.length);
    if (!pool.length) pool = RECIPES.slice().sort((a, b) => recipeMatches(b) / b.needs.length - recipeMatches(a) / a.needs.length).slice(0, 3);
    const r = pool[((weekNumber() + (state.recipeOffset || 0)) % pool.length + pool.length) % pool.length];
    $('#recipe').innerHTML = '<p class="muted">✨ This week\'s recipe, picked from foods you like</p>'
      + '<h2 style="font-size:1.6rem">' + esc(r.name) + '</h2>'
      + '<div class="meta"><span class="pill">⏱ ' + r.mins + ' min</span>'
      + '<span class="pill cal-only">≈ ' + r.cal + ' cal</span>'
      + r.groups.map(g => '<span class="pill yes">' + GROUPS[g].emoji + ' ' + GROUPS[g].label + '</span>').join('') + '</div>'
      + '<div class="cols"><div><h3>You\'ll need</h3><ul>' + r.ingredients.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>'
      + '<p class="tip">🌱 Feeling brave? ' + esc(r.stretch) + '</p></div>'
      + '<div><h3>Steps</h3><ol>' + r.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol></div></div>'
      + '<h3>Why it\'s good for you</h3>' + factHTML(r.fact)
      + (pool.length > 1 ? '<button type="button" class="btn" id="next-recipe">Not feeling it? Show me another</button>' : '');
  }

  function renderLearn() {
    $('#learn-grid').innerHTML = GROUP_KEYS.map(k => {
      const g = GROUPS[k], mine = likedIn(k);
      return '<div class="card group-card"><div class="emoji" aria-hidden="true">' + g.emoji + '</div><h2>' + esc(g.label) + '</h2><p>' + esc(g.why) + '</p>'
        + (mine.length ? '<p><b>You already like:</b> ' + esc(mine.join(', ')) + '</p>' : '<p><b>Not on your list yet.</b> Something to explore!</p>')
        + '<p><b>Try:</b></p><ul>' + g.ideas.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>'
        + (g.fact ? factHTML(g.fact) : '') + '</div>';
    }).join('');
  }

  function renderFoods() {
    $('#food-list').innerHTML = state.foods.map(f =>
      '<li><span class="name">' + esc(f.name) + '</span><span class="muted">' + f.groups.map(g => GROUPS[g].emoji).join(' ')
      + (f.cal ? '<span class="cal-only"> · ≈' + f.cal + ' cal</span>' : '') + '</span>'
      + '<button class="del" data-remove-food="' + f.id + '" aria-label="Remove ' + esc(f.name) + '" title="Remove">×</button></li>').join('')
      || '<li class="muted">No foods yet. Add some!</li>';
  }

  /* ---------------------------------------------------------------
     Events
     --------------------------------------------------------------- */
  $('#other-group').innerHTML = groupOptions();
  $('#food-group').innerHTML = groupOptions();
  $('#log-time').value = localInputValue(new Date());

  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('on', p.id === 'tab-' + b.dataset.tab));
    tooltip.hidden = true;
  }));

  document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
    logType = b.dataset.type;
    document.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b));
  }));

  $('#pick-foods').addEventListener('click', (ev) => {
    const c = ev.target.closest('.chip'); if (!c) return;
    if (c.dataset.food) { selected.has(c.dataset.food) ? selected.delete(c.dataset.food) : selected.add(c.dataset.food); }
    else if (c.dataset.extra) { extras.splice(+c.dataset.extra, 1); }
    renderPicker();
  });

  $('#other-add').addEventListener('click', () => {
    const name = $('#other-name').value.trim(); if (!name) return;
    extras.push({ name, groups: [$('#other-group').value], cal: +$('#other-cal').value || 0 });
    $('#other-name').value = ''; $('#other-cal').value = '';
    renderPicker();
  });
  $('#log-cal').addEventListener('input', () => { calTouched = true; });

  $('#log-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const foods = state.foods.filter(f => selected.has(f.id)).map(f => ({ name: f.name, groups: f.groups.slice(), cal: f.cal || 0 })).concat(extras);
    if (!foods.length) { $('#pick-foods').scrollIntoView({ behavior: 'smooth', block: 'center' }); alert('Tap at least one food so I know what you had 💛'); return; }
    const t = $('#log-time').value ? new Date($('#log-time').value) : new Date();
    const entry = {
      id: uid(), ts: t.toISOString(), type: logType, foods,
      cal: state.settings.calories ? (+$('#log-cal').value || null) : null,
      note: $('#log-note').value.trim()
    };
    state.entries.push(entry); save();
    selected = new Set(); extras = []; calTouched = false;
    $('#log-note').value = ''; $('#log-time').value = localInputValue(new Date());
    render();
    const ch = $('#cheer'); ch.innerHTML = cheerFor(entry); ch.hidden = false;
    ch.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  document.addEventListener('click', (ev) => {
    const del = ev.target.closest('[data-del]');
    if (del) { state.entries = state.entries.filter(e => e.id !== del.dataset.del); save(); render(); return; }
    const rm = ev.target.closest('[data-remove-food]');
    if (rm) { state.foods = state.foods.filter(f => f.id !== rm.dataset.removeFood); selected.delete(rm.dataset.removeFood); save(); render(); return; }
    if (ev.target.id === 'next-recipe') { state.recipeOffset = (state.recipeOffset || 0) + 1; save(); renderRecipe(); }
  });

  $('#food-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = $('#food-name').value.trim(); if (!name) return;
    state.foods.push({ id: uid(), name, groups: [$('#food-group').value], cal: +$('#food-cal').value || 0 });
    $('#food-name').value = ''; $('#food-cal').value = '';
    save(); render();
  });

  $('#cal-toggle').addEventListener('change', (ev) => { state.settings.calories = ev.target.checked; save(); render(); });
  $('#reset-foods').addEventListener('click', () => {
    if (confirm('Reset your food list to the original foods? Your logs stay.')) { state.foods = DEFAULT_FOODS.slice(); selected = new Set(); save(); render(); }
  });
  $('#clear-all').addEventListener('click', () => {
    if (confirm('Erase every logged meal and snack? This can\'t be undone.')) { state.entries = []; save(); render(); }
  });

  render();
})();
