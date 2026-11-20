/* =====================================================================
   Gentle Plate · app logic
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
    fun:     { label: 'Fun foods', emoji: '🍭', goal: 0, fact: null,
               why: 'Food is also joy! Fun foods have a place, and pairing them with a meal can keep cravings calmer.',
               ideas: ['Hot Cheetos as a crunchy side with a grilled cheese', 'Pour a bowl to enjoy instead of eating from the bag'] }
  };
  const GROUP_KEYS = Object.keys(GROUPS);

  // Daily amounts for a 2,000-calorie pattern (Dietary Guidelines for Americans, 2020–2025)
  const DAILY = {
    carbs:   { n: 6, unit: 'oz-equivalents of grains (1 slice of bread or ½ cup pasta = 1)' },
    protein: { n: 5.5, unit: 'oz-equivalents of protein (1 oz of fish or meat = 1)' },
    veg:     { n: 2.5, unit: 'cups of vegetables' },
    fruit:   { n: 2, unit: 'cups of fruit' },
    dairy:   { n: 3, unit: 'cups of dairy (1½ oz of cheese = 1 cup)' }
  };

  /* ---------------------------------------------------------------
     A new fact for each food group every day (rotates by date)
     --------------------------------------------------------------- */
  const GROUP_FACTS = {
    carbs: [
      FACTS.brain,
      { text: 'Experts recommend that 45–65% of your daily calories come from carbohydrates. They\'re meant to be the biggest part of your plate.', src: 'Institute of Medicine, Acceptable Macronutrient Distribution Ranges (2005)' },
      { text: 'Your muscles store carbs as glycogen, their main fuel for walking, working out and getting through a busy day.', src: 'Thomas, Erdman & Burke, Academy of Nutrition and Dietetics / ACSM position paper (2016)' },
      FACTS.potato,
      { text: 'The Dietary Guidelines suggest making at least half your grains whole grains. Whole-wheat toast is an easy swap.', src: 'Dietary Guidelines for Americans, 2020–2025' }
    ],
    protein: [
      FACTS.protein,
      FACTS.breakfast,
      { text: 'Adults need about 0.8 g of protein per kilogram of body weight each day, roughly 55 g for someone who weighs 150 lb.', src: 'Institute of Medicine, Dietary Reference Intakes (2005)' },
      { text: 'A 4-oz piece of cooked salmon has roughly 25–30 g of protein, about a full meal\'s worth.', src: 'USDA FoodData Central' },
      { text: 'Your body uses about 20–30% of protein\'s calories just to digest it, more than for carbs or fat, which is part of why it keeps you full.', src: 'Westerterp, Nutrition & Metabolism (2004)' },
      FACTS.iron
    ],
    veg: [
      FACTS.veg,
      FACTS.broccoli,
      { text: 'A review of 95 studies found that eating about 800 g of fruits and vegetables a day (around 10 servings) was linked to lower risk of heart disease, stroke and early death.', src: 'Aune et al., International Journal of Epidemiology (2017)' },
      FACTS.fiber,
      { text: 'Sweet corn contains lutein and zeaxanthin, antioxidants that collect in your eyes and help protect your vision.', src: 'National Eye Institute (NIH)' }
    ],
    fruit: [
      FACTS.fruit,
      { text: 'One cup of strawberries has about 85 mg of vitamin C, more than a medium orange.', src: 'USDA FoodData Central' },
      { text: 'A medium banana has about 420 mg of potassium and 3 g of fiber, an easy grab-and-go breakfast.', src: 'USDA FoodData Central' },
      { text: 'The Dietary Guidelines recommend getting most of your fruit from whole fruit instead of juice, because the fiber keeps you full.', src: 'Dietary Guidelines for Americans, 2020–2025' },
      { text: 'A review of 95 studies found that eating more fruits and vegetables was linked to lower risk of heart disease, stroke and early death.', src: 'Aune et al., International Journal of Epidemiology (2017)' }
    ],
    dairy: [
      FACTS.dairy,
      { text: 'Adults 19–50 need about 1,000 mg of calcium a day. One cup of milk has about 300 mg, nearly a third.', src: 'NIH Office of Dietary Supplements, Calcium Fact Sheet' },
      { text: 'Most people reach their peak bone mass by around age 30, so calcium in your 20s builds your "bone bank" for life.', src: 'NIH Osteoporosis and Related Bone Diseases National Resource Center' },
      { text: 'One ounce of cheddar cheese has about 7 g of protein, so cheese counts toward protein too.', src: 'USDA FoodData Central' }
    ],
    fun: [
      { text: 'In a 2007 study, people who were encouraged to be kind to themselves after eating a treat ate less afterward than people who weren\'t. Guilt doesn\'t help; kindness does.', src: 'Adams & Leary, Journal of Social and Clinical Psychology (2007)' },
      FACTS.timing
    ]
  };
  function dayIndex() { const d = new Date(); return Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(2020, 0, 1)) / 864e5); }
  function dailyFact(group) {
    const pool = GROUP_FACTS[group];
    return pool ? pool[(dayIndex() + GROUP_KEYS.indexOf(group) * 2) % pool.length] : null;
  }

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
    { name: 'Burger Potato Bowl', needs: [['beef', 'burger'], ['potato', 'fries'], ['pickle']], cal: 560, mins: 30, fact: 'iron',
      groups: ['protein', 'carbs', 'veg'], stretch: 'Add some shredded lettuce for crunch',
      ingredients: ['4 oz ground beef', 'Fries or cubed potatoes', 'Sliced pickles', 'Ketchup + mustard (or burger sauce)'],
      steps: ['Bake fries or roast potatoes until crispy.', 'Brown the beef in a pan with salt, pepper and garlic powder.', 'Pile fries in a bowl and top with the beef.', 'Finish with pickles and sauce.'] },
    { name: 'Garlic Butter Steak Bites', needs: [['steak'], ['garlic bread', 'bread', 'toast', 'potato', 'fries']], cal: 540, mins: 20, fact: 'protein',
      groups: ['protein', 'carbs'], stretch: 'Add sautéed peppers or onions',
      ingredients: ['6 oz steak, cut into bite-size cubes', '1 tbsp butter + garlic', 'Garlic bread or crispy potatoes on the side'],
      steps: ['Pat the steak cubes dry and season with salt and pepper.', 'Sear in a very hot pan 2–3 minutes, turning once, until browned.', 'Turn off the heat, add butter and garlic, and toss to coat.', 'Serve with garlic bread or crispy potatoes on the side.'] },
    { name: 'Loaded Broccoli Baked Potato', needs: [['potato'], ['broccoli']], cal: 360, mins: 15, fact: 'potato',
      groups: ['carbs', 'veg'], stretch: 'Top with a little chopped steak or salmon for protein',
      ingredients: ['1 large potato', '1 cup broccoli', 'Butter, salt', 'Parmesan (optional)'],
      steps: ['Poke the potato with a fork. Microwave 8–10 minutes, flipping halfway.', 'Microwave broccoli with a splash of water 2–3 minutes.', 'Split the potato, add butter and salt.', 'Pile on the broccoli and a sprinkle of parmesan.'] },
    { name: 'Garlic Parmesan Broccoli Pasta', needs: [['pasta', 'noodle'], ['broccoli']], cal: 480, mins: 20, fact: 'veg',
      groups: ['carbs', 'veg'], stretch: 'Serve with a small piece of salmon',
      ingredients: ['2 oz pasta', '1 cup chopped broccoli', '1 tbsp butter + 1 clove garlic', 'Parmesan'],
      steps: ['Boil pasta, adding the broccoli for the last 3 minutes.', 'Drain, keeping a splash of the pasta water.', 'Toss with butter, garlic, a splash of pasta water and parmesan until glossy.'] },
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
     Sketch icons: every emoji on the page is swapped for a hand-drawn
     icon from the sprite in index.html
     --------------------------------------------------------------- */
  const ICONS = { '🍽': 'plate', '🍞': 'bread', '🐟': 'fish', '🥦': 'broccoli', '🍓': 'strawberry', '🧀': 'cheese', '🌶': 'chili', '🍭': 'lollipop',
    '💛': 'heart', '📊': 'chart', '💡': 'bulb', '🌈': 'rainbow', '💪': 'dumbbell', '🥔': 'potato', '🌽': 'corn', '🔥': 'fire',
    '🔋': 'battery', '✨': 'sparkle', '🎉': 'sparkle', '☀': 'sun', '🌱': 'sprout', '⏱': 'timer', '📅': 'calendar', '🛒': 'cart', '🔍': 'search', '🍳': 'pan', '🧂': 'shaker', '⭐': 'sparkle' };
  const ICON_RE = new RegExp('(' + Object.keys(ICONS).join('|') + ')\uFE0F?', 'gu');
  const ICON_TEST = new RegExp('(' + Object.keys(ICONS).join('|') + ')', 'u');  // no "g" flag, so repeated .test() calls are reliable
  const GROUP_ICON = { carbs: 'bread', protein: 'fish', veg: 'broccoli', fruit: 'strawberry', dairy: 'cheese', fun: 'lollipop' };
  function ico(name, cls) { return '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
  function sketchify(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentNode.closest('svg, script, option, textarea') || !ICON_TEST.test(n.nodeValue)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const span = document.createElement('span');
      span.innerHTML = esc(n.nodeValue).replace(ICON_RE, (m, e) => ico(ICONS[e]));
      n.replaceWith(...span.childNodes);
    });
  }

  /* ---------------------------------------------------------------
     Calorie estimates for a typical serving (rounded, based on USDA
     FoodData Central). The most specific match wins, so "sweet potato
     fries" beats "fries" and "string cheese" beats "cheese".
     [keyword, calories, group, serving]
     --------------------------------------------------------------- */
  const CAL_DB = [
    // fruit
    ['apple', 95, 'fruit', '1 medium apple'], ['banana', 105, 'fruit', '1 medium banana'], ['strawberr', 50, 'fruit', '1 cup'],
    ['grape', 105, 'fruit', '1 cup'], ['clementine', 35, 'fruit', '1 clementine'], ['mandarin', 35, 'fruit', '1 mandarin'],
    ['orange', 60, 'fruit', '1 medium orange'], ['watermelon', 45, 'fruit', '1 cup'], ['melon', 55, 'fruit', '1 cup'],
    ['blueberr', 85, 'fruit', '1 cup'], ['raspberr', 65, 'fruit', '1 cup'], ['pineapple', 80, 'fruit', '1 cup'],
    ['mango', 100, 'fruit', '1 cup'], ['peach', 60, 'fruit', '1 medium peach'], ['pear', 100, 'fruit', '1 medium pear'],
    ['cherr', 95, 'fruit', '1 cup'], ['applesauce', 50, 'fruit', '1 pouch'], ['fruit', 80, 'fruit', '1 cup'],
    ['juice', 110, 'fruit', '8 oz glass'],
    // veggies
    ['sweet potato fries', 160, 'veg', '3 oz'], ['sweet potato', 115, 'veg', '1 medium'], ['broccoli', 30, 'veg', '1 cup'],
    ['carrot', 30, 'veg', '½ cup'], ['cucumber', 15, 'veg', '1 cup slices'], ['green bean', 35, 'veg', '1 cup'],
    ['pea', 60, 'veg', '½ cup'], ['corn', 90, 'veg', '1 ear'], ['spinach', 20, 'veg', '½ cup cooked'],
    ['cauliflower', 25, 'veg', '1 cup'], ['salad', 20, 'veg', '2 cups greens'], ['lettuce', 10, 'veg', '1 cup'],
    ['tomato', 20, 'veg', '1 medium'], ['pepper', 30, 'veg', '1 medium'], ['onion', 45, 'veg', '1 medium'],
    ['mushroom', 15, 'veg', '1 cup'], ['zucchini', 20, 'veg', '1 cup'], ['pickle', 5, 'veg', '1 spear'],
    ['tater tot', 160, 'carbs', '9 tots'], ['hash brown', 150, 'carbs', '1 patty'], ['mashed potato', 210, 'carbs', '1 cup'],
    ['fries', 320, 'carbs', '1 medium serving'], ['potato', 160, 'carbs', '1 medium'],
    // carbs & grains
    ['garlic bread', 150, 'carbs', '1 slice'], ['grilled cheese', 400, 'carbs', '1 sandwich'], ['mac', 380, 'carbs', '1 cup'],
    ['butter noodle', 300, 'carbs', '1 cup'], ['noodle', 220, 'carbs', '1 cup cooked'], ['pasta', 220, 'carbs', '1 cup cooked'],
    ['spaghetti', 220, 'carbs', '1 cup cooked'], ['toast', 80, 'carbs', '1 slice'], ['bread', 80, 'carbs', '1 slice'],
    ['bagel', 270, 'carbs', '1 bagel'], ['english muffin', 130, 'carbs', '1 muffin'], ['tortilla', 140, 'carbs', '1 large tortilla'],
    ['cracker', 130, 'carbs', '1 serving (about 15)'], ['rice', 205, 'carbs', '1 cup cooked'], ['quinoa', 220, 'carbs', '1 cup cooked'], ['couscous', 175, 'carbs', '1 cup cooked'], ['oat', 150, 'carbs', '1 cup cooked'],
    ['cereal', 150, 'carbs', '1 cup'], ['granola bar', 120, 'carbs', '1 bar'], ['granola', 200, 'carbs', '½ cup'],
    ['waffle', 200, 'carbs', '2 frozen waffles'], ['pancake', 180, 'carbs', '2 small'], ['muffin', 350, 'carbs', '1 muffin'],
    ['croissant', 230, 'carbs', '1 croissant'], ['biscuit', 180, 'carbs', '1 biscuit'], ['bun', 140, 'carbs', '1 bun'],
    ['pizza', 285, 'carbs', '1 slice'], ['quesadilla', 450, 'carbs', '1 quesadilla'], ['burrito', 550, 'carbs', '1 burrito'],
    ['taco', 200, 'carbs', '1 taco'], ['sandwich', 350, 'carbs', '1 sandwich'], ['soup', 150, 'veg', '1 cup'],
    // protein
    ['cheeseburger', 550, 'protein', '1 burger'], ['burger', 250, 'protein', '1 patty'], ['ground beef', 250, 'protein', '4 oz cooked'],
    ['beef', 250, 'protein', '4 oz cooked'], ['steak', 320, 'protein', '6 oz'], ['salmon', 230, 'protein', '4 oz'],
    ['tuna', 100, 'protein', '3 oz can'], ['shrimp', 85, 'protein', '3 oz'], ['cod', 90, 'protein', '3 oz'], ['fish', 150, 'protein', '4 oz'],
    ['egg', 140, 'protein', '2 eggs'], ['peanut butter', 190, 'protein', '2 tbsp'], ['meatball', 180, 'protein', '3 meatballs'],
    ['turkey', 170, 'protein', '4 oz ground'], ['pork', 200, 'protein', '1 chop'], ['bacon', 90, 'protein', '2 slices'],
    ['sausage', 190, 'protein', '2 links'], ['hot dog', 150, 'protein', '1 hot dog'], ['bean', 115, 'protein', '½ cup'],
    ['tofu', 90, 'protein', '3 oz'], ['almond', 165, 'protein', '1 oz'], ['nut', 170, 'protein', '1 oz'], ['hummus', 70, 'protein', '2 tbsp'],
    ['protein bar', 200, 'protein', '1 bar'],
    // dairy
    ['chocolate milk', 200, 'dairy', '1 cup'], ['milkshake', 500, 'fun', '1 medium'], ['milk', 120, 'dairy', '1 cup'],
    ['string cheese', 80, 'dairy', '1 stick'], ['parmesan', 20, 'dairy', '1 tbsp'], ['mozzarella', 85, 'dairy', '1 oz'],
    ['cream cheese', 100, 'dairy', '2 tbsp'], ['alfredo', 110, 'dairy', '¼ cup sauce'], ['rosatella', 100, 'dairy', '½ cup sauce'],
    ['cheese', 115, 'dairy', '1 oz'], ['butter', 100, 'dairy', '1 tbsp'], ['smoothie', 250, 'fruit', '12 oz'],
    // fun foods & extras
    ['hot cheeto', 170, 'fun', '1 oz bag'], ['cheeto', 160, 'fun', '1 oz'], ['chip', 150, 'fun', '1 oz'], ['pretzel', 110, 'fun', '1 oz'],
    ['popcorn', 100, 'fun', '3 cups'], ['cookie', 150, 'fun', '2 cookies'], ['brownie', 230, 'fun', '1 brownie'], ['chocolate', 210, 'fun', '1 bar'],
    ['candy', 200, 'fun', '1 pack'], ['ice cream', 140, 'fun', '½ cup'], ['donut', 250, 'fun', '1 donut'], ['cake', 350, 'fun', '1 slice'],
    ['soda', 150, 'fun', '12 oz can'], ['marinara', 70, 'veg', '½ cup sauce'], ['pizza sauce', 30, 'veg', '¼ cup'],
    ['sauce', 80, 'dairy', '¼ cup'], ['ranch', 130, 'fun', '2 tbsp'], ['ketchup', 20, 'fun', '1 tbsp'], ['mayo', 90, 'fun', '1 tbsp']
  ].sort((a, b) => b[0].length - a[0].length);
  const GROUP_CAL_GUESS = { carbs: 150, protein: 200, veg: 40, fruit: 80, dairy: 110, fun: 160 };

  // Returns { cal, group, serving, sure } for a food name (sure = false when it's only a group-based guess)
  function estimateCal(name, group) {
    const n = String(name || '').toLowerCase();
    const hit = n && CAL_DB.find(([k]) => n.includes(k));
    if (hit) return { cal: hit[1], group: hit[2], serving: hit[3], sure: true };
    const g = group || 'carbs';
    return { cal: GROUP_CAL_GUESS[g] || 120, group: g, serving: 'a typical serving', sure: false };
  }

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
        s.foods.forEach(f => { if (!f.cal) { const e = estimateCal(f.name, f.groups[0]); f.cal = e.cal; f.calEst = true; } });
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
    const f = typeof key === 'string' ? FACTS[key] : key; if (!f) return '';
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

    return '<h2>' + esc(head) + '</h2><p>' + esc(body) + '</p>' + factHTML(fact) + (tip ? '<p class="tip">💡 ' + esc(tip) + '</p>' : '')
      + roundOutHTML(entry);
  }

  /* What to add next, and why, shown right after logging */
  function roundOutHTML(entry) {
    const have = groupsOf(entry);
    const missing = ['protein', 'veg', 'fruit', 'dairy', 'carbs'].filter(g => !have.has(g)).slice(0, entry.type === 'snack' ? 2 : 3);
    const levels = {}; GROUP_KEYS.forEach(g => levels[g] = have.has(g) ? 1 : 0);
    let s = '<div class="roundout"><div class="plate-wrap">' + plateSVG(levels) + '<p class="cap">This ' + entry.type + '\'s plate</p></div><div class="roundout-body">';
    if (!missing.length) return s + '<h3>🌈 Every food group in one go. Beautifully balanced!</h3></div></div>';
    s += '<h3>To round out your next ' + entry.type + ', try adding:</h3><ul class="addlist">';
    s += missing.map(g => {
      const G = GROUPS[g], f = dailyFact(g), mine = likedIn(g);
      return '<li><span class="ic" aria-hidden="true">' + G.emoji + '</span><div><b>' + esc(G.label) + ':</b> ' + esc(G.why)
        + '<span class="try">Try: ' + esc(mine.length ? mine.slice(0, 3).join(', ') : G.ideas[0]) + '</span>'
        + (f ? '<span class="mini-fact">📊 ' + esc(f.text) + ' <i>(' + esc(f.src) + ')</i></span>' : '') + '</div></li>';
    }).join('');
    return s + '</ul></div></div>';
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
      extra = '<p class="tip">💡 Still room today for ' + GROUPS[g].label.toLowerCase() + ', maybe ' + esc(suggestFrom(g)) + '?</p>' + factHTML(dailyFact(g));
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
  const C = { meal: '#6E1F2E', snack: '#EDB9C4', grid: '#C9D4BC', band: '#DCEAF4', bar: '#6F7342', goal: '#6E1F2E', card: '#FFF9E6', empty: '#FFF9E6', plateLo: '#DCE4D0', plateHi: '#9CB08A' };

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
        const tipTxt = mealLabel(e) + ' · ' + fmtTime(e.ts) + ' · ' + e.foods.map(f => f.name).join(', ');
        const cx = x(hourOf(e.ts));
        const mark = e.type === 'meal'
          ? '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="' + C.meal + '" stroke="' + C.card + '" stroke-width="2"/>'
          : '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="' + C.snack + '" stroke="' + C.meal + '" stroke-width="2"/>';
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
      s += '<use href="#i-' + GROUP_ICON[k] + '" x="0" y="' + (y - 3) + '" width="24" height="24" style="color:var(--p-ink)"/>';
      s += '<text class="lab" x="30" y="' + (y + barH - 4) + '">' + esc(g.label) + '</text>';
      s += '<rect x="' + left + '" y="' + y + '" width="' + (W - left - right) + '" height="' + barH + '" fill="' + C.card + '" rx="4"/>';
      if (v > 0) s += '<rect x="' + left + '" y="' + y + '" width="' + Math.max(4, x(v) - left) + '" height="' + barH + '" fill="' + C.bar + '" rx="4"/>';
      if (g.goal) s += '<line x1="' + x(g.goal) + '" x2="' + x(g.goal) + '" y1="' + (y - 4) + '" y2="' + (y + barH + 4) + '" stroke="' + C.goal + '" stroke-width="2"/>';
      const lbl = g.goal ? v + ' / ' + g.goal : String(v);
      s += '<text x="' + (W - right + 8) + '" y="' + (y + barH - 4) + '">' + lbl + '</text>';
      const tipTxt = g.label + ': ' + v + ' this week' + (g.goal ? ' (gentle goal: ' + g.goal + ')' : '');
      s += '<rect class="hit" data-tip="' + esc(tipTxt) + '" x="0" y="' + (top + rowH * i) + '" width="' + W + '" height="' + rowH + '" fill="transparent"/>';
    });
    return s + '</svg>';
  }

  // Plate graphic. levels: { group: 0..1 }, labels: optional { group: text }
  function mix(a, b, t) {
    const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16));
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function plateSVG(levels, labels) {
    const cx = 112, cy = 116, R = 88;
    const pt = (a, r) => [cx + r * Math.cos((a - 90) * Math.PI / 180), cy + r * Math.sin((a - 90) * Math.PI / 180)];
    const wedge = (a0, a1) => { const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
      return 'M' + cx + ' ' + cy + ' L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + R + ' ' + R + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z'; };
    // MyPlate layout: veggies + fruit on one half, grains + protein on the other
    const parts = [['veg', 0, 108], ['fruit', 108, 180], ['carbs', 180, 288], ['protein', 288, 360]];
    let s = '<svg class="chart plate" viewBox="0 0 262 232" role="img" aria-label="Plate showing food groups">';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R + 14) + '" fill="#FFF9E6" stroke="' + C.grid + '" stroke-width="2"/>';
    const fill = (v) => v >= 1 ? C.plateHi : v > 0 ? C.plateLo : C.empty;   // theme: part way / goal reached
    const node = (g, x, y, shape) => {
      const v = levels[g] || 0, G = GROUPS[g], on = v > 0;
      const tip = G.label + (labels && labels[g] ? ': ' + labels[g] : on ? ': yes!' : ': not yet');
      return '<g class="hit" data-tip="' + esc(tip) + '">' + shape(fill(v), on)
        + '<use href="#i-' + GROUP_ICON[g] + '" x="' + (x - 14) + '" y="' + (y - 22) + '" width="28" height="28" opacity="1" style="color:var(--p-ink)"/>'
        + '<text class="plab" x="' + x + '" y="' + (y + 22) + '" text-anchor="middle">' + esc(labels && labels[g] ? labels[g] : G.label.split(' ')[0]) + '</text></g>';
    };
    parts.forEach(([g, a0, a1]) => {
      const [lx, ly] = pt((a0 + a1) / 2, R * 0.58);
      s += node(g, lx, ly, (f, on) => '<path d="' + wedge(a0, a1) + '" fill="' + f + '" stroke="' + (on ? C.card : C.grid) + '" stroke-width="3"' + (on ? '' : ' stroke-dasharray="5 4"') + '/>');
    });
    s += node('dairy', 230, 40, (f, on) => '<circle cx="230" cy="36" r="29" fill="' + f + '" stroke="' + (on ? C.meal : C.grid) + '" stroke-width="2"' + (on ? '' : ' stroke-dasharray="5 4"') + '/>');
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
  // which meal the log form is for; guessed from the time until you pick one
  const MEAL_NAMES = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
  function mealForTime(d) { const h = hourOf(d); return h < 11 ? 'breakfast' : h < 15.5 ? 'lunch' : h < 17 ? 'snack' : 'dinner'; }
  const autoMainMeal = () => { const m = mealForTime(new Date()); return m === 'snack' ? 'lunch' : m; };
  let logMeal = mealForTime(new Date()), mealPicked = false;
  let logType = logMeal === 'snack' ? 'snack' : 'meal';
  function setLogMeal(m, picked) {
    logMeal = m; logType = m === 'snack' ? 'snack' : 'meal'; if (picked !== undefined) mealPicked = picked;
    document.querySelectorAll('.meal-pick button').forEach(x => { const on = x.dataset.meal === m; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  }
  const mealLabel = (e) => MEAL_NAMES[e.meal] || (e.type === 'snack' ? 'Snack' : 'Meal');
  let selected = new Set();   // food ids picked in the log form
  let extras = [];            // "something not on my list" foods

  const THEME_LABELS = {"sage": "Sage Cottage", "strawberry": "Strawberry Milk", "butterblue": "Butter & Blue", "mocha": "Mocha Latte"};
  function applyTheme() {
    const t = 'bubblegum';   // locked in: the darker forest-green look
    document.body.dataset.theme = t;
    document.querySelectorAll('[data-theme-pick]').forEach(b => b.classList.toggle('on', b.dataset.themePick === t));
    const cs = getComputedStyle(document.body), v = (n) => cs.getPropertyValue(n).trim();
    Object.assign(C, { meal: v('--p-accent'), snack: v('--p-plate-part'), grid: v('--p-line'), band: v('--p-a4'), bar: v('--p-accent'),
      goal: v('--p-dark'), card: v('--p-card'), empty: v('--p-card'), plateLo: v('--p-plate-part'), plateHi: v('--p-plate') });
  }
  function render() {
    applyTheme();
    document.body.classList.toggle('no-cal', !state.settings.calories);
    $('#cal-toggle').checked = state.settings.calories;
    renderToday(); renderWeek(); renderRecipe(); renderLearn(); renderFoods(); renderPlan(); renderPlannedToday(); renderIdeas(); renderPantry(); renderExtras(); renderFavs(); renderInstall(); renderPlateBuilder(); renderStickerBook();
    sketchify(document.body);
  }

  function groupOptions() {
    return GROUP_KEYS.map(k => '<option value="' + k + '">' + GROUPS[k].label + '</option>').join('');
  }

  // food picker: tap a food-group button to drop down its foods
  let openCats = new Set();
  function renderPicker() {
    if (!state.foods.length) { $('#pick-foods').innerHTML = '<p class="muted">Add foods on the "My foods" tab.</p>'; updateCalEstimate(); return; }
    const picked = state.foods.filter(f => selected.has(f.id));
    let html = '<div class="picked-row">' + (picked.length || extras.length
      ? '<span class="picked-lbl">Picked:</span>' + picked.map(f => '<button type="button" class="chip on" data-food="' + f.id + '" title="Remove">' + esc(f.name) + '<span class="x">×</span></button>').join('')
        + extras.map((f, i) => '<button type="button" class="chip on" data-extra="' + i + '" title="Remove">' + esc(f.name) + '<span class="x">×</span></button>').join('')
      : '<span class="picked-lbl muted">Nothing picked yet. Open a group below.</span>') + '</div>';
    html += '<div class="cat-list">' + GROUP_KEYS.map(g => {
      const foods = state.foods.filter(f => f.groups[0] === g); if (!foods.length) return '';
      const n = foods.filter(f => selected.has(f.id)).length, open = openCats.has(g);
      return '<div class="cat' + (open ? ' open' : '') + '"><button type="button" class="cat-btn" data-cat="' + g + '" aria-expanded="' + open + '">'
        + ico(GROUP_ICON[g]) + '<span>' + esc(GROUPS[g].label) + '</span>' + (n ? '<em class="cat-n">' + n + '</em>' : '') + '<span class="caret" aria-hidden="true">▾</span></button>'
        + (open ? '<div class="cat-foods">' + foods.map(f => '<button type="button" class="chip' + (selected.has(f.id) ? ' on' : '') + '" data-food="' + f.id + '" aria-pressed="' + selected.has(f.id) + '">' + esc(f.name) + '</button>').join('') + '</div>' : '')
        + '</div>';
    }).join('') + '</div>';
    $('#pick-foods').innerHTML = html;
    sketchify($('#pick-foods'));
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
    return '<li><span class="time">' + fmtTime(e.ts) + '</span><span class="what"><span class="tag ' + e.type + '">' + mealLabel(e) + '</span>'
      + esc(e.foods.map(f => f.name).join(', ')) + cal + (e.note ? '<br><span class="muted">' + esc(e.note) + '</span>' : '') + '</span>'
      + '<button class="del edit-from" data-edit="' + e.id + '" aria-label="Edit this log" title="Edit">✎</button>'
      + '<button class="del fav-from" data-fav-entry="' + e.id + '" aria-label="Save as favorite" title="Save as a favorite meal">☆</button>'
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
    const todayLv = {}; day.forEach(e => groupsOf(e).forEach(g => todayLv[g] = 1));
    $('#today-plate').innerHTML = plateSVG(todayLv);
    $('#today-list').innerHTML = day.map(entryRow).join('') || '<li class="muted">Nothing yet, and that\'s okay.</li>';
  }

  function renderWeek() {
    const days = last7();
    $('#week-note').innerHTML = weekNote();
    $('#week-schedule').innerHTML = scheduleSVG(days, true);

    const counts = {}; GROUP_KEYS.forEach(k => counts[k] = 0);
    days.forEach(d => entriesOn(d).forEach(e => groupsOf(e).forEach(g => { if (g in counts) counts[g]++; })));
    const wkLv = {}, wkLab = {};
    GROUP_KEYS.forEach(k => { if (GROUPS[k].goal) { wkLv[k] = counts[k] / GROUPS[k].goal; wkLab[k] = counts[k] + '/' + GROUPS[k].goal; } });
    $('#week-plate').innerHTML = plateSVG(wkLv, wkLab);
    $('#week-groups').innerHTML = groupBarsSVG(counts)
      + '<p class="muted" style="margin-top:8px">The thin dark line on each bar is a gentle weekly goal, not a rule. Hover a bar for details.</p>';

    // Spotlight the group that's furthest from its goal
    const need = GROUP_KEYS.filter(k => GROUPS[k].goal).sort((a, b) => counts[a] / GROUPS[a].goal - counts[b] / GROUPS[b].goal)[0];
    const g = GROUPS[need];
    const mine = likedIn(need);
    $('#week-try').innerHTML = '<div class="card hello" style="margin:16px 0 0"><h2>' + g.emoji + ' One to add more of: ' + esc(g.label) + '</h2><p>' + esc(g.why) + '</p>'
      + (mine.length ? '<p><b>From your list:</b> ' + esc(mine.join(', ')) + '</p>' : '')
      + '<p><b>Easy ideas:</b> ' + esc(g.ideas.join(' · ')) + '</p>' + factHTML(dailyFact(need)) + '</div>';

    // History, newest first, last 14 days
    const byDay = {};
    state.entries.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts)).forEach(e => {
      const k = dayKey(e.ts); (byDay[k] = byDay[k] || []).push(e);
    });
    const recent = last7().reverse();   // today first
    const older = Object.keys(byDay).filter(k => !recent.some(d => dayKey(d) === k)).slice(0, 10);
    const dayBlock = (d, list) => '<div class="day-block"><div class="day-head-row"><p class="day-head">' + fmtDay(d) + (dayKey(d) === dayKey(new Date()) ? ' <span class="muted">(today)</span>' : '') + '</p>'
      + '<button type="button" class="btn small ghost inline" data-log-for="' + isoDate(new Date(d)) + '">+ Add a missed meal</button></div>'
      + (list.length ? '<ul class="entries">' + list.map(entryRow).join('') + '</ul>' : '<p class="muted empty-day">Nothing logged. If you ate and forgot, you can add it.</p>') + '</div>';
    $('#history').innerHTML = recent.map(d => dayBlock(d, (byDay[dayKey(d)] || []).slice().reverse())).join('')
      + older.map(k => { const list = byDay[k].slice().reverse(); return dayBlock(new Date(list[0].ts), list); }).join('');
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
      + r.groups.map(g => '<span class="pill yes g-' + g + '">' + GROUPS[g].emoji + ' ' + GROUPS[g].label + '</span>').join('') + '</div>'
      + '<div class="cols"><div><h3>You\'ll need</h3><ul>' + r.ingredients.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>'
      + '<p class="tip">🌱 Feeling brave? ' + esc(r.stretch) + '</p></div>'
      + '<div><h3>Steps</h3><ol>' + r.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol></div></div>'
      + '<h3>Why it\'s good for you</h3>' + factHTML(r.fact)
      + (pool.length > 1 ? '<button type="button" class="btn" id="next-recipe">Not feeling it? Show me another</button>' : '');
  }

  function amountIcons(k) {
    const d = DAILY[k]; if (!d) return '';
    let icons = ''; for (let i = 0; i < Math.ceil(d.n); i++) icons += '<span class="amt' + (d.n - i < 1 ? ' half' : '') + '">' + GROUPS[k].emoji + '</span>';
    return '<div class="amount"><div class="icons" aria-hidden="true">' + icons + '</div><span class="muted">About <b>' + d.n + '</b> ' + esc(d.unit) + ' a day</span></div>';
  }
  function renderLearn() {
    const full = {}; GROUP_KEYS.forEach(k => full[k] = 1);
    $('#learn-plate').innerHTML = plateSVG(full);
    $('#fact-date').textContent = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    $('#learn-grid').innerHTML = GROUP_KEYS.map(k => {
      const g = GROUPS[k], mine = likedIn(k);
      return '<div class="card group-card g-' + k + '"><div class="emoji" aria-hidden="true">' + g.emoji + '</div><h2>' + esc(g.label) + '</h2><p>' + esc(g.why) + '</p>'
        + (mine.length ? '<p><b>You already like:</b> ' + esc(mine.join(', ')) + '</p>' : '<p><b>Not on your list yet.</b> Something to explore!</p>')
        + amountIcons(k) + '<p><b>Try:</b></p><ul>' + g.ideas.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>'
        + '<p class="fod">Today\'s fact</p>'
        + factHTML(dailyFact(k)) + '</div>';
    }).join('');
  }

  function renderFoods() {
    $('#food-list').innerHTML = state.foods.map(f =>
      '<li><span class="name">' + esc(f.name) + '</span><span class="muted">' + f.groups.map(g => GROUPS[g].emoji).join(' ')
      + (f.cal ? '<span class="cal-only"> · ≈' + f.cal + ' cal' + (f.calEst ? ' <i class="est" data-tip="Estimated from a typical serving. Type your own number when you add a food to override it.">est.</i>' : '') + '</span>' : '') + '</span>'
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

  document.querySelectorAll('.meal-pick button').forEach(b => b.addEventListener('click', () => setLogMeal(b.dataset.meal, true)));
  setLogMeal(logMeal);
  // until you pick one, the meal follows the time you enter
  $('#log-time').addEventListener('change', () => { if (!mealPicked && $('#log-time').value) setLogMeal(mealForTime(new Date($('#log-time').value))); updatePastNote(); });
  function setLogTime(d) {
    $('#log-time').value = localInputValue(d);
    if (!mealPicked) setLogMeal(mealForTime(d));
    updatePastNote();
  }
  function updatePastNote() {
    const v = $('#log-time').value, n = $('#past-note'); if (!n) return;
    const d = v ? new Date(v) : new Date(), mins = (Date.now() - d) / 60000;
    document.querySelectorAll('.when-quick .chip').forEach(c => c.classList.remove('on'));
    if (mins > 45) { n.hidden = false; n.textContent = '🕒 Logging for ' + fmtDay(d) + ' at ' + fmtTime(d) + '. Thanks for filling it in!'; sketchify(n); }
    else if (mins < -5) { n.hidden = false; n.textContent = 'That time is in the future. Did you mean an earlier time?'; }
    else n.hidden = true;
  }
  document.querySelectorAll('[data-when]').forEach(b => b.addEventListener('click', () => {
    const d = new Date(), w = b.dataset.when;
    if (w === 'morning') d.setHours(8, 30, 0, 0);
    else if (w === 'lunch') d.setHours(12, 30, 0, 0);
    else if (w === 'evening') d.setHours(18, 30, 0, 0);
    else if (w === 'yesterday') { d.setDate(d.getDate() - 1); d.setHours(12, 30, 0, 0); }
    setLogTime(d); b.classList.add('on');
  }));
  document.addEventListener('click', (ev) => {
    const lf = ev.target.closest('[data-log-for]'); if (!lf) return;
    const d = new Date(lf.dataset.logFor + 'T12:30');
    document.querySelector('.tabs button[data-tab="today"]').click();
    setLogTime(d);
    $('#log-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => $('#log-time').focus(), 400);
  });

  $('#pick-foods').addEventListener('click', (ev) => {
    const cb = ev.target.closest('[data-cat]');
    if (cb) { const g = cb.dataset.cat; openCats.has(g) ? openCats.delete(g) : openCats.add(g); renderPicker(); return; }
    const c = ev.target.closest('.chip'); if (!c) return;
    if (c.dataset.food) { selected.has(c.dataset.food) ? selected.delete(c.dataset.food) : selected.add(c.dataset.food); }
    else if (c.dataset.extra) { extras.splice(+c.dataset.extra, 1); }
    renderPicker();
  });

  $('#other-add').addEventListener('click', () => {
    const name = $('#other-name').value.trim(); if (!name) return;
    extras.push({ name, groups: [$('#other-group').value], cal: +$('#other-cal').value || estimateCal(name, $('#other-group').value).cal });
    $('#other-name').value = ''; $('#other-cal').value = ''; otherEst.reset();
    renderPicker();
  });
  $('#log-cal').addEventListener('input', () => { calTouched = true; });

  $('#log-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const foods = state.foods.filter(f => selected.has(f.id)).map(f => ({ name: f.name, groups: f.groups.slice(), cal: f.cal || 0 })).concat(extras);
    if (!foods.length) { $('#pick-foods').scrollIntoView({ behavior: 'smooth', block: 'center' }); alert('Tap at least one food so I know what you had 💛'); return; }
    const t = $('#log-time').value ? new Date($('#log-time').value) : new Date();
    const entry = {
      id: uid(), ts: t.toISOString(), type: logType, meal: logMeal, foods,
      cal: state.settings.calories ? (+$('#log-cal').value || null) : null,
      note: $('#log-note').value.trim()
    };
    const wasEditing = editingId;
    if (wasEditing) {
      const i = state.entries.findIndex(e => e.id === wasEditing);
      if (i >= 0) { const old = state.entries[i]; entry.id = old.id; if (old.plate) entry.plate = true; state.entries[i] = entry; }
      else state.entries.push(entry);
    } else state.entries.push(entry);
    save();
    resetLogForm();
    render();
    if (wasEditing) toast('✓ Changes saved'); else showCheer(entry);
  });

  /* ---- editing a log ---- */
  let editingId = null;
  function resetLogForm() {
    selected = new Set(); extras = []; calTouched = false; editingId = null; openCats = new Set();
    $('#log-note').value = ''; $('#log-cal').value = ''; $('#log-time').value = localInputValue(new Date());
    setLogMeal(mealForTime(new Date()), false); updatePastNote();
    $('#log-submit').innerHTML = 'Log it 💛'; $('#edit-cancel').hidden = true; $('#edit-banner').hidden = true;
    $('#log-form').closest('.card').classList.remove('editing');
  }
  function startEdit(id) {
    const e = state.entries.find(x => x.id === id); if (!e) return;
    editingId = id;
    selected = new Set(); extras = [];
    e.foods.forEach(f => { const liked = state.foods.find(x => x.name === f.name); if (liked) selected.add(liked.id); else extras.push(Object.assign({}, f, { groups: f.groups.slice() })); });
    setLogMeal(e.meal || (e.type === 'snack' ? 'snack' : mealForTime(e.ts)), true);
    $('#log-time').value = localInputValue(new Date(e.ts)); updatePastNote();
    calTouched = true; $('#log-cal').value = e.cal || '';
    $('#log-note').value = e.note || '';
    document.querySelector('.tabs button[data-tab="today"]').click();
    openCats = new Set(state.foods.filter(f => selected.has(f.id)).map(f => f.groups[0]));
    renderPicker();
    $('#log-submit').innerHTML = 'Save changes ✓'; $('#edit-cancel').hidden = false;
    const b = $('#edit-banner'); b.hidden = false;
    b.innerHTML = '✎ Editing your <b>' + esc(mealLabel(e).toLowerCase()) + '</b> from ' + esc(fmtDay(e.ts)) + ', ' + esc(fmtTime(e.ts)) + '. Change anything, then tap <b>Save changes</b>.';
    $('#log-form').closest('.card').classList.add('editing');
    $('#edit-banner').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('#edit-cancel').addEventListener('click', () => { resetLogForm(); renderPicker(); });
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2200);
  }
  document.addEventListener('click', (ev) => { const ed = ev.target.closest('[data-edit]'); if (ed) startEdit(ed.dataset.edit); });

  document.addEventListener('click', (ev) => {
    const del = ev.target.closest('[data-del]');
    if (del) { if (editingId === del.dataset.del) resetLogForm(); state.entries = state.entries.filter(e => e.id !== del.dataset.del); save(); render(); return; }
    const rm = ev.target.closest('[data-remove-food]');
    if (rm) { state.foods = state.foods.filter(f => f.id !== rm.dataset.removeFood); selected.delete(rm.dataset.removeFood); save(); render(); return; }
    if (ev.target.id === 'next-recipe') { state.recipeOffset = (state.recipeOffset || 0) + 1; save(); renderRecipe(); sketchify($('#recipe')); }
  });

  // Live calorie estimate while typing a new food
  function wireEstimate(nameSel, groupSel, calSel, hintSel) {
    let groupTouched = false;
    $(groupSel).addEventListener('change', () => { groupTouched = true; update(); });
    function update() {
      const name = $(nameSel).value.trim(), hint = hintSel && $(hintSel);
      if (!name) { $(calSel).placeholder = hintSel ? 'auto-estimated' : 'cal'; if (hint) hint.innerHTML = ''; groupTouched = false; return; }
      let e = estimateCal(name, groupTouched ? $(groupSel).value : null);
      if (!groupTouched) $(groupSel).value = e.sure ? e.group : 'carbs';   // undo an earlier auto-pick when there's no match
      if (!e.sure) e = estimateCal(name, $(groupSel).value);
      $(calSel).placeholder = '≈ ' + e.cal;
      if (hint) hint.innerHTML = e.sure
        ? '🔥 Estimated <b>≈ ' + e.cal + ' cal</b> for ' + esc(e.serving) + '. Type a number above to use your own.'
        : '🔥 No exact match, so a rough guess for ' + esc(GROUPS[e.group].label.toLowerCase()) + ': <b>≈ ' + e.cal + ' cal</b>. Type a number above to use your own.';
      if (hint) sketchify(hint);
    }
    $(nameSel).addEventListener('input', update);
    return { reset() { groupTouched = false; update(); } };
  }
  const foodEst = wireEstimate('#food-name', '#food-group', '#food-cal', '#food-cal-hint');
  const otherEst = wireEstimate('#other-name', '#other-group', '#other-cal', null);

  $('#food-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = $('#food-name').value.trim(); if (!name) return;
    const typed = +$('#food-cal').value, e = estimateCal(name, $('#food-group').value);
    state.foods.push({ id: uid(), name, groups: [$('#food-group').value], cal: typed || e.cal, calEst: !typed });
    $('#food-name').value = ''; $('#food-cal').value = ''; foodEst.reset();
    save(); render();
  });

  $('#cal-toggle').addEventListener('change', (ev) => { state.settings.calories = ev.target.checked; save(); render(); });
  $('#reset-foods').addEventListener('click', () => {
    if (confirm('Reset your food list to the original foods? Your logs stay.')) { state.foods = DEFAULT_FOODS.slice(); selected = new Set(); save(); render(); }
  });
  $('#clear-all').addEventListener('click', () => {
    if (confirm('Erase every logged meal and snack? This can\'t be undone.')) { state.entries = []; save(); render(); }
  });

  /* ===============================================================
     MEAL PLANNING
     state.plan = { 'YYYY-MM-DD': { breakfast: [items], lunch: [...], dinner: [...], snack: [...], logged: { slot: true } } }
     item = { kind: 'food' | 'recipe', name, groups, cal }
     =============================================================== */
  const SLOTS = [['breakfast', 'Breakfast', 'sun'], ['lunch', 'Lunch', 'bread'], ['dinner', 'Dinner', 'plate'], ['snack', 'Snack', 'strawberry']];
  let planWeek = 0;              // 0 = this week, 1 = next week
  let pickerTarget = null;       // { day, slot }
  let pickerSel = new Set();     // picked food ids / recipe names in the dialog

  function isoDate(d) { const p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function planDays(offset) {
    const t = new Date(); t.setHours(12, 0, 0, 0);
    const monday = new Date(t); monday.setDate(t.getDate() - ((t.getDay() + 6) % 7) + offset * 7);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  }
  function dayPlan(key) {
    state.plan = state.plan || {};
    return state.plan[key] || (state.plan[key] = { breakfast: [], lunch: [], dinner: [], snack: [], logged: {} });
  }
  function peekPlan(key) { return (state.plan && state.plan[key]) || null; }
  function foodItem(f) { return { kind: 'food', name: f.name, groups: f.groups.slice(), cal: f.cal || 0 }; }
  function recipeItem(r) { return { kind: 'recipe', name: r.name, groups: r.groups.slice(), cal: r.cal }; }
  function eligibleRecipes() {
    const pool = RECIPES.filter(r => recipeMatches(r) === r.needs.length);
    return pool.length ? pool : RECIPES.slice(0, 3);
  }
  function dayGroups(p) {
    const s = new Set(); if (!p) return s;
    SLOTS.forEach(([k]) => (p[k] || []).forEach(it => it.groups.forEach(g => s.add(g))));
    return s;
  }

  // Auto-fill: a balanced-ish plan built only from foods you like
  // Which foods make sense for which meal (matched against food names)
  const FIT = {
    breakfast: ['toast', 'egg', 'bagel', 'english muffin', 'waffle', 'pancake', 'oat', 'cereal', 'granola', 'muffin',
                'banana', 'berr', 'apple', 'grape', 'clementine', 'orange', 'melon', 'peanut butter', 'milk', 'smoothie', 'hash brown'],
    breakfastBase: ['toast', 'bagel', 'english muffin', 'waffle', 'pancake', 'oat', 'cereal', 'granola', 'muffin'],
    lunchMain: ['grilled cheese', 'mac', 'sandwich', 'melt', 'burger', 'quesadilla', 'butter noodle', 'pasta', 'soup', 'wrap', 'pizza', 'tuna', 'salmon'],
    side: ['broccoli', 'corn', 'pickle', 'fries', 'potato', 'carrot', 'cucumber', 'green bean', 'pea', 'apple', 'grape', 'berr', 'banana', 'clementine'],
    snack: ['pickle', 'cheeto', 'chip', 'cracker', 'pretzel', 'popcorn', 'string cheese', 'carrot', 'cucumber',
            'apple', 'grape', 'berr', 'banana', 'clementine', 'orange', 'melon', 'peanut butter']
  };
  const fits = (f, words) => words.some(w => f.name.toLowerCase().includes(w));
  // sides that go with each kind of lunch main
  const LUNCH_SIDES = [
    [['grilled cheese', 'burger', 'melt', 'sandwich', 'quesadilla', 'tuna', 'wrap'], ['pickle', 'fries', 'corn', 'apple', 'carrot', 'cucumber', 'grape', 'berr']],
    [['pasta', 'noodle', 'mac', 'pizza', 'soup'], ['broccoli', 'corn', 'pea', 'green bean', 'carrot', 'spinach', 'cauliflower']],
    [['salmon', 'steak', 'beef', 'shrimp', 'cod'], ['broccoli', 'corn', 'potato', 'green bean', 'pea', 'carrot']]
  ];
  // breakfast-friendly foods to suggest trying when your list doesn't have one yet
  const BREAKFAST_TRY = [['Eggs', 'protein'], ['Banana', 'fruit'], ['Strawberries', 'fruit'], ['Peanut butter', 'protein'], ['Milk', 'dairy']];

  // Auto-fill: replaces only slots that are empty or were auto-filled before; never touches what you added yourself
  function rankedDishes(meal) {
    const have = (req) => req.some(w => state.foods.some(f => f.name.toLowerCase().includes(w))) || pantryHas(req);
    return PANTRY_DISHES.filter(dd => dd.meal === meal)
      .map(dd => ({ dd, miss: dd.need.filter(req => !have(req)).length }))
      .filter(x => x.miss <= 1)
      .sort((a, b) => a.miss - b.miss || b.dd.need.length - a.dd.need.length)
      .map(x => x.dd);
  }
  // one new automatic idea for a single plan box, different from what's already in the week
  function rerollSlot(day, slot) {
    const p = dayPlan(day);
    const used = new Set(); planDays(planWeek).forEach(d => { const q = peekPlan(isoDate(d)); if (q) SLOTS.forEach(([k]) => q[k].forEach(it => used.add(it.name))); });
    const current = new Set(p[slot].map(it => it.name));
    const meal = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack' }[slot];
    let pool = meal ? rankedDishes(meal).map(dd => ({ dd, item: dishItem(dd) })) : eligibleRecipes().map(r => ({ item: Object.assign(recipeItem(r), { auto: true }) }));
    if (slot === 'lunch') { const dn = eligibleRecipes().map(r => r.name.toLowerCase()); pool = pool.filter(x => !dn.includes(x.item.name.toLowerCase())); }
    let fresh = pool.filter(x => !used.has(x.item.name));
    if (!fresh.length) fresh = pool.filter(x => !current.has(x.item.name));
    if (!fresh.length) return false;
    state.rerollN = (state.rerollN || 0) + 1;
    p[slot] = [fresh[state.rerollN % fresh.length].item];
    p.logged = p.logged || {}; delete p.logged[slot];
    save(); return true;
  }
  function autofill(days) {
    state.fillSeed = (state.fillSeed || 0) + 1;
    const seed = state.fillSeed;
    const likedHas = (req) => req.some(w => state.foods.some(f => f.name.toLowerCase().includes(w)));
    const have = (req) => likedHas(req) || pantryHas(req);
    // rank recipes for a meal: ones you can fully make first, then ones missing just one thing
    const ranked = rankedDishes;
    const pickList = (list, n) => {   // n different picks, rotated by the shuffle seed
      if (!list.length) return [];
      const off = (seed * 3) % list.length;
      return Array.from({ length: n }, (_, i) => list[(off + i) % list.length]);
    };
    const B = pickList(ranked('Breakfast'), days.length);
    const dinnerNames = eligibleRecipes().map(r => r.name.toLowerCase());
    const L = pickList(ranked('Lunch').filter(dd => !dinnerNames.includes(dd.name.toLowerCase())), days.length);
    const S = pickList(ranked('Snack'), days.length);
    const D = pickList(eligibleRecipes(), days.length);
    // don't serve the same main thing at lunch and dinner on one day (e.g. noodles twice)
    const words = (s) => s.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 4 && !['with', 'cheese', 'cheesy', 'roasted', 'garlic', 'butter'].includes(w));
    const clash = (a, b) => a && b && words(a.name).some(w => words(b.name).includes(w));
    for (let i = 0; i < L.length; i++) {
      if (!clash(L[i], D[i])) continue;
      for (let k = 1; k < L.length; k++) { const o = (i + k) % L.length;
        if (!clash(L[o], D[i]) && !clash(L[i], D[o])) { [L[i], L[o]] = [L[o], L[i]]; break; } }
    }
    const replaceable = (items) => !items.length || items.every(it => it.auto);
    days.forEach((d, i) => {
      const p = dayPlan(isoDate(d));
      if (replaceable(p.breakfast) && B[i]) p.breakfast = [dishItem(B[i])];
      if (replaceable(p.lunch) && L[i]) p.lunch = [dishItem(L[i])];
      if (replaceable(p.dinner) && D[i]) p.dinner = [Object.assign(recipeItem(D[i]), { auto: true })];
      if (replaceable(p.snack) && S[i]) p.snack = [dishItem(S[i])];
    });
    save();
  }

  function dishItem(dd) { return { kind: 'dish', name: dd.name, groups: dd.groups.slice(), cal: estimateCal(dd.name, dd.groups[0]).cal, auto: true }; }

  function itemTag(it, key, slot, idx) {
    return '<span class="pitem ' + it.kind + '"' + (it.kind === 'try' ? ' data-tip="A suggestion to try. Remove it if it\'s not for you."' : '') + '>'
      + '<button class="howto-link" data-howto="' + esc(it.kind + '|' + it.name + '|' + key + '|' + slot) + '" title="How to make it">'
      + (it.kind === 'recipe' ? ico('sparkle') + ' ' : it.kind === 'dish' ? '🍳 ' : it.kind === 'try' ? '<i>Try:</i> ' : '') + esc(it.name) + '</button>'
      + '<button class="x" data-unplan="' + key + '|' + slot + '|' + idx + '" aria-label="Remove ' + esc(it.name) + '">×</button></span>';
  }

  function planSummary(days) {
    const ps = days.map(d => peekPlan(isoDate(d)));
    const planned = ps.filter(p => p && SLOTS.some(([k]) => p[k].length)).length;
    if (!planned) return '<h2>Plan ahead, stress less 📅</h2><p>Deciding meals ahead means fewer "what do I even eat?" moments, and fewer long stretches without food. Tap <b>Fill my week for me</b> to start from foods you already like, then swap anything.</p>' + factHTML('timing');
    const count = (g) => ps.filter(p => dayGroups(p).has(g)).length;
    const bfast = ps.filter(p => p && p.breakfast.length).length;
    const lowest = ['protein', 'veg', 'fruit', 'dairy'].sort((a, b) => count(a) - count(b))[0];
    return '<h2>Look at this plan 🌱</h2><p>You have food planned on <b>' + planned + ' of 7 days</b>, breakfast on <b>' + bfast + '</b>, protein on <b>' + count('protein') + '</b> and veggies on <b>' + count('veg') + '</b>.</p>'
      + (count(lowest) < 4 ? '<p class="tip">💡 Want to add a little more ' + GROUPS[lowest].label.toLowerCase() + '? Try ' + esc(suggestFrom(lowest)) + '.</p>' + factHTML(dailyFact(lowest))
        : '<p class="tip">🌈 That\'s a really well-rounded week.</p>' + factHTML(bfast < 5 ? 'breakfast' : 'timing'));
  }

  function groceryList(days) {
    const foods = new Map(), recipes = new Map(), dishes = new Map();
    days.forEach(d => {
      const p = peekPlan(isoDate(d)); if (!p) return;
      SLOTS.forEach(([k]) => p[k].forEach(it => {
        if (it.kind === 'recipe') { const r = RECIPES.find(x => x.name === it.name); if (r) recipes.set(r.name, r.ingredients); }
        else if (it.kind === 'dish') { const dd = PANTRY_DISHES.find(x => x.name === it.name); if (dd) dishes.set(dd.name, dd.need.map(req => cap1(req[0]))); }
        else if (!foods.has(it.name.toLowerCase())) foods.set(it.name.toLowerCase(), it.name);
      }));
    });
    return { foods: [...foods.values()], recipes: [...recipes.entries()], dishes: [...dishes.entries()] };
  }

  function renderPlan() {
    const days = planDays(planWeek), todayKey = isoDate(new Date());
    document.querySelectorAll('#plan-week button').forEach(b => b.classList.toggle('on', +b.dataset.week === planWeek));
    $('#plan-summary').innerHTML = planSummary(days);
    $('#plan-grid').innerHTML = days.map(d => {
      const key = isoDate(d), p = peekPlan(key), have = dayGroups(p);
      const slots = SLOTS.map(([k, label, icon]) => {
        const items = p ? p[k] : [];
        return '<div class="slot"><div class="slot-name">' + ico(icon) + ' ' + label + (p && p.logged && p.logged[k] ? ' <span class="done">✓ eaten</span>' : '') + '</div>'
          + '<div class="slot-items">' + items.map((it, i) => itemTag(it, key, k, i)).join('') + '</div>'
          + '<div class="slot-btns"><button class="add" data-plan-add="' + key + '|' + k + '">+ Add</button>'
          + '<button class="add reroll" data-plan-reroll="' + key + '|' + k + '" title="Swap this box for a new idea">↻ New idea</button></div></div>';
      }).join('');
      const groupsRow = ['carbs', 'protein', 'veg', 'fruit', 'dairy'].map(g =>
        '<span class="gdot' + (have.has(g) ? ' on' : '') + '" data-tip="' + esc(GROUPS[g].label + (have.has(g) ? ': planned' : ': not planned yet')) + '">' + ico(GROUP_ICON[g]) + '</span>').join('');
      return '<div class="plan-day' + (key === todayKey ? ' today' : '') + '"><div class="plan-head"><h3>' + d.toLocaleDateString([], { weekday: 'long' })
        + ' <span class="muted">' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + '</span>' + (key === todayKey ? ' <span class="badge">Today</span>' : '') + '</h3>'
        + '<div class="groups-row">' + groupsRow + '</div></div><div class="slots">' + slots + '</div></div>';
    }).join('');

    const groc = groceryList(days), wk = isoDate(days[0]);
    state.grocery = state.grocery || {}; const checked = state.grocery[wk] || {};
    const box = (n, strict) => { const h = haveIngredient(n, strict === true);
      return '<li' + (h ? ' class="have"' : '') + '><label><input type="checkbox" data-groc="' + wk + '|' + esc(n) + '"' + (checked[n] || h ? ' checked' : '') + '> <span>' + esc(n) + '</span>'
        + (h ? ' <em class="have-tag">already have</em>' : '') + '</label></li>'; };
    let html = '';
    state.groceryExtra = state.groceryExtra || {};
    const mine = state.groceryExtra[wk] || [];
    if (mine.length) html += '<h3 class="sub">Added by me</h3><ul class="grocery">' + mine.map((n, i) =>
      box(n).replace('</label></li>', '</label><button class="x" data-groc-del="' + wk + '|' + i + '" aria-label="Remove ' + esc(n) + '">×</button></li>')).join('') + '</ul>';
    if (groc.foods.length) html += '<h3 class="sub">Everyday foods</h3><ul class="grocery">' + groc.foods.map(n => box(n, true)).join('') + '</ul>';
    if (groc.dishes && groc.dishes.length) html += '<div class="groc-recipes">' + groc.dishes.map(([name, ings]) =>
      '<div class="groc-recipe"><h3 class="sub">🍳 ' + esc(name) + '</h3><ul class="grocery one">' + ings.map(box).join('') + '</ul></div>').join('') + '</div>';
    if (groc.recipes.length) html += '<div class="groc-recipes">' + groc.recipes.map(([name, ings]) =>
      '<div class="groc-recipe"><h3 class="sub">✨ ' + esc(name) + '</h3><ul class="grocery one">' + ings.map(box).join('') + '</ul></div>').join('') + '</div>';
    $('#grocery').innerHTML = html || '<p class="muted">Add meals to your plan and your shopping list builds itself here.</p>';
  }

  // "Planned for today" card on the Today tab
  function renderPlannedToday() {
    const key = isoDate(new Date()), p = peekPlan(key), box = $('#planned-today');
    const has = p && SLOTS.some(([k]) => p[k].length);
    box.hidden = !has; if (!has) return;
    box.innerHTML = '<h2>📅 Planned for today</h2><p class="muted">Tap a food to see how to make it.</p><ul class="entries">' + SLOTS.filter(([k]) => p[k].length).map(([k, label, icon]) =>
      '<li><span class="time">' + ico(icon) + ' ' + label + '</span><span class="what">' + p[k].map(it => '<button class="howto-link inline" data-howto="' + esc(it.kind + '|' + it.name + '|' + key + '|' + k) + '">' + esc(it.name) + '</button>').join(', ') + '</span>'
      + (p.logged && p.logged[k] ? '<span class="done">✓ eaten</span>' : '<button class="btn small" data-log-plan="' + k + '">I ate this</button>') + '</li>').join('') + '</ul>'
      + '<p class="muted">Ate something different? No problem at all, just log what you had below.</p>';
  }

  function showCheer(entry) {
    const ch = $('#cheer'); ch.innerHTML = cheerFor(entry); ch.hidden = false; sketchify(ch);
    ch.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    celebrate(entry);
  }

  // ---- picker dialog ----
  const picker = $('#picker');
  function openPicker(day, slot) {
    pickerTarget = { day, slot }; pickerSel = new Set();
    const label = SLOTS.find(s => s[0] === slot)[1];
    $('#picker-title').textContent = 'Add to ' + label + ', ' + new Date(day + 'T12:00').toLocaleDateString([], { weekday: 'long' });
    $('#picker-foods').innerHTML = state.foods.map(f => '<button type="button" class="chip" data-pick="f:' + f.id + '">' + esc(f.name) + '</button>').join('');
    const recs = eligibleRecipes();
    $('#picker-recipes').innerHTML = recs.map(r => '<button type="button" class="chip" data-pick="r:' + esc(r.name) + '">' + ico('sparkle') + ' ' + esc(r.name) + '</button>').join('');
    picker.showModal ? picker.showModal() : picker.setAttribute('open', '');
  }
  picker.addEventListener('click', (ev) => {
    const c = ev.target.closest('[data-pick]');
    if (c) { const v = c.dataset.pick; pickerSel.has(v) ? pickerSel.delete(v) : pickerSel.add(v); c.classList.toggle('on', pickerSel.has(v)); }
  });
  $('#picker-cancel').addEventListener('click', () => picker.close());
  $('#picker-add').addEventListener('click', () => {
    if (pickerTarget) {
      const p = dayPlan(pickerTarget.day);
      pickerSel.forEach(v => {
        const has = (n) => p[pickerTarget.slot].some(it => it.name === n);
        if (v.startsWith('f:')) { const f = state.foods.find(x => x.id === v.slice(2)); if (f && !has(f.name)) p[pickerTarget.slot].push(foodItem(f)); }
        else { const r = RECIPES.find(x => x.name === v.slice(2)); if (r) p[pickerTarget.slot].push(recipeItem(r)); }
      });
      save(); render();
    }
    picker.close();
  });

  document.querySelectorAll('#plan-week button').forEach(b => b.addEventListener('click', () => { planWeek = +b.dataset.week; renderPlan(); sketchify($('#tab-plan')); }));
  $('#plan-fill').addEventListener('click', () => { autofill(planDays(planWeek)); render(); });
  $('#plan-clear').addEventListener('click', () => {
    if (!confirm('Clear the plan for this week?')) return;
    planDays(planWeek).forEach(d => { if (state.plan) delete state.plan[isoDate(d)]; }); save(); render();
  });

  document.addEventListener('click', (ev) => {
    const add = ev.target.closest('[data-plan-add]');
    if (add) { const [day, slot] = add.dataset.planAdd.split('|'); openPicker(day, slot); return; }
    const rr = ev.target.closest('[data-plan-reroll]');
    if (rr) { const [day, slot] = rr.dataset.planReroll.split('|');
      if (rerollSlot(day, slot)) { render(); const box = document.querySelector('[data-plan-reroll="' + rr.dataset.planReroll + '"]');
        if (box) { const s = box.closest('.slot'); s.classList.remove('flash'); void s.offsetWidth; s.classList.add('flash'); } }
      else alert('No other ideas for this meal right now. Add more foods you like to unlock more!');
      return; }
    const un = ev.target.closest('[data-unplan]');
    if (un) { const [day, slot, i] = un.dataset.unplan.split('|'); dayPlan(day)[slot].splice(+i, 1); save(); render(); return; }
    const lp = ev.target.closest('[data-log-plan]');
    if (lp) {
      const slot = lp.dataset.logPlan, p = dayPlan(isoDate(new Date()));
      const entry = { id: uid(), ts: new Date().toISOString(), type: slot === 'snack' ? 'snack' : 'meal', meal: MEAL_NAMES[slot] ? slot : autoMainMeal(),
        foods: p[slot].map(it => ({ name: it.name, groups: it.groups.slice(), cal: it.cal || 0 })), note: 'From my plan' };
      entry.cal = state.settings.calories ? (entry.foods.reduce((n, f) => n + f.cal, 0) || null) : null;
      p.logged = p.logged || {}; p.logged[slot] = true;
      state.entries.push(entry); save(); render(); showCheer(entry);
    }
  });
  $('#groc-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const input = $('#groc-input'), name = input.value.trim(); if (!name) return;
    const wk = isoDate(planDays(planWeek)[0]);
    state.groceryExtra = state.groceryExtra || {};
    const list = state.groceryExtra[wk] = state.groceryExtra[wk] || [];
    if (!list.some(n => n.toLowerCase() === name.toLowerCase())) list.push(name);
    input.value = ''; save(); renderPlan(); sketchify($('#tab-plan')); input.focus();
  });
  document.addEventListener('click', (ev) => {
    const d = ev.target.closest('[data-groc-del]'); if (!d) return;
    const [wk, i] = d.dataset.grocDel.split('|');
    const list = (state.groceryExtra || {})[wk]; if (!list) return;
    const [gone] = list.splice(+i, 1);
    if (state.grocery && state.grocery[wk]) delete state.grocery[wk][gone];
    save(); renderPlan(); sketchify($('#tab-plan'));
  });
  document.addEventListener('change', (ev) => {
    const g = ev.target.closest('[data-groc]'); if (!g) return;
    const i = g.dataset.groc.indexOf('|'), wk = g.dataset.groc.slice(0, i), name = g.dataset.groc.slice(i + 1);
    state.grocery = state.grocery || {}; state.grocery[wk] = state.grocery[wk] || {};
    state.grocery[wk][name] = g.checked; save();
  });

  /* ===============================================================
     IDEAS: analyze liked foods, suggest similar foods and meals.
     Catalog avoids chicken, Asian dishes, yogurt, deli meat and
     cottage cheese.
     =============================================================== */
  const TRAITS = {
    cheesy:  { label: 'cheesy', words: ['cheese', 'mac', 'alfredo', 'rosatella', 'parm', 'quesadilla'] },
    creamy:  { label: 'creamy', words: ['alfredo', 'rosatella', 'mac', 'mash', 'cream', 'butter noodle'] },
    garlic:  { label: 'garlicky & buttery', words: ['garlic', 'butter', 'alfredo', 'scampi'] },
    crunchy: { label: 'salty & crunchy', words: ['pickle', 'cheeto', 'fries', 'toast', 'chip', 'cracker'] },
    spicy:   { label: 'spicy', words: ['hot', 'spicy', 'cheeto', 'jalape', 'buffalo'] },
    sweet:   { label: 'naturally sweet', words: ['corn', 'berry', 'apple', 'grape', 'banana', 'sweet potato', 'carrot'] },
    meaty:   { label: 'hearty & meaty', words: ['steak', 'beef', 'burger', 'meatball'] },
    seafood: { label: 'seafood', words: ['salmon', 'fish', 'shrimp', 'tuna', 'cod'] },
    tangy:   { label: 'tangy', words: ['pickle', 'vinegar', 'tomato', 'rosatella'] },
    comfort: { label: 'carb comfort', words: ['pasta', 'noodle', 'bread', 'toast', 'potato', 'fries', 'mac'] }
  };

  // [name, group, traits, because (liked keyword), why]
  const IDEA_FOODS = [
    ['Strawberries', 'fruit', ['sweet'], null, 'Mild, sweet and easy. 1 cup has about 85 mg of vitamin C, more than an orange (USDA).'],
    ['Apple slices', 'fruit', ['sweet', 'crunchy'], 'pickle', 'Crunchy like your favorite snacks. A medium apple has about 4 g of fiber to keep you full (USDA).'],
    ['Frozen grapes', 'fruit', ['sweet', 'crunchy'], 'cheeto', 'A cold, poppable late-night snack, about 100 calories a cup (USDA).'],
    ['Bananas', 'fruit', ['sweet', 'comfort'], 'toast', 'Great on toast. One has about 420 mg of potassium and 3 g of fiber (USDA).'],
    ['Clementines', 'fruit', ['sweet'], null, 'Easy to peel and snack on. Each has about 36 mg of vitamin C, around 40% of a day (USDA).'],
    ['Green beans', 'veg', ['garlic', 'crunchy'], 'broccoli', 'Roasted with garlic butter, they taste a lot like your broccoli. About 4 g of fiber per cup (USDA).'],
    ['Peas', 'veg', ['sweet', 'creamy'], 'corn', 'Sweet like corn and great stirred into mac or alfredo. ½ cup has about 4 g protein and 4 g fiber (USDA).'],
    ['Baby carrots', 'veg', ['sweet', 'crunchy'], 'corn', 'Sweet and crunchy. ½ cup gives about half your daily vitamin A (NIH).'],
    ['Cauliflower', 'veg', ['cheesy', 'creamy', 'garlic'], 'broccoli', 'Broccoli\'s milder cousin. Roast it with garlic and parmesan. 1 cup has about 50 mg of vitamin C (USDA).'],
    ['Spinach', 'veg', ['creamy', 'garlic'], 'alfredo', 'Stir a handful into alfredo or rosatella and it disappears. ½ cup cooked has about 3 mg of iron (NIH).'],
    ['Sweet potato fries', 'veg', ['sweet', 'crunchy', 'comfort'], 'fries', 'Just like fries, with a bonus: one sweet potato has over 100% of your daily vitamin A (NIH).'],
    ['Cucumber slices', 'veg', ['crunchy', 'tangy'], 'pickle', 'Pickles are cucumbers! Fresh slices with salt are cool, crunchy and about 95% water (USDA).'],
    ['Shrimp', 'protein', ['seafood', 'garlic'], 'salmon', 'Garlic butter shrimp cooks in 5 minutes. 3 oz has about 20 g of protein (USDA).'],
    ['Eggs', 'protein', ['comfort', 'cheesy'], 'toast', 'Scrambled on toast makes an easy protein breakfast. 1 egg has about 6 g of protein (USDA).'],
    ['Cod', 'protein', ['seafood', 'garlic'], 'salmon', 'A very mild white fish if you like salmon. 3 oz has about 19 g of protein (USDA).'],
    ['Peanut butter', 'protein', ['comfort', 'sweet'], 'toast', 'On toast with banana for breakfast. 2 tbsp has about 7 g of protein (USDA).'],
    ['String cheese', 'dairy', ['cheesy'], 'cheese', 'A grab-and-go snack with about 7 g of protein per stick (USDA).'],
    ['Milk', 'dairy', ['creamy'], 'mac', '1 cup has about 300 mg of calcium and 8 g of protein (NIH / USDA).'],
    ['Parmesan', 'dairy', ['cheesy', 'garlic'], 'alfredo', 'Sprinkle on broccoli or green beans to make veggies taste like your pasta.'],
    ['Whole-wheat toast', 'carbs', ['comfort', 'crunchy'], 'toast', 'Same toast, more staying power: about 2 g of fiber per slice vs. under 1 g in white (USDA).'],
    ['English muffins', 'carbs', ['comfort', 'garlic'], 'toast', 'Toasted with butter, or as a mini pizza. An easy breakfast base.'],
    ['Tortillas', 'carbs', ['comfort', 'cheesy'], 'grilled cheese', 'For breakfast wraps or salmon tacos. An easy way to make a meal portable.'],
    ['Crackers', 'carbs', ['crunchy'], 'cheeto', 'Crunchy and salty. Pair with fruit or peanut butter for a snack that keeps you full longer.']
  ];

  // name, anchors (liked keywords: any match), groups, likeOf, how-to, shopping items
  const IDEA_MEALS = [
    { name: 'Steak & Cheese Quesadilla', anchors: ['steak', 'grilled cheese'], groups: ['protein', 'carbs', 'dairy'], likeOf: 'grilled cheese + steak',
      how: 'Tortilla, shredded cheese, thin-sliced steak. Fold and pan-crisp 2–3 min per side.', shop: ['Tortillas', 'Shredded cheese', 'Steak'] },
    { name: 'Tuna Melt', anchors: ['grilled cheese'], groups: ['protein', 'carbs', 'dairy'], likeOf: 'grilled cheese',
      how: 'Mix tuna with a little mayo, layer with cheese on bread, and cook it just like grilled cheese.', shop: ['Canned tuna', 'Mayo', 'Bread', 'Cheese slices'] },
    { name: 'Garlic Butter Shrimp & Noodles', anchors: ['butter noodle', 'salmon', 'noodle'], groups: ['protein', 'carbs'], likeOf: 'butter noodles + salmon',
      how: 'Sauté shrimp in butter and garlic for 4–5 min and toss with buttered noodles and parmesan.', shop: ['Shrimp', 'Noodles', 'Butter', 'Garlic', 'Parmesan'] },
    { name: 'Cheesy Egg Toast', anchors: ['toast'], groups: ['protein', 'carbs', 'dairy'], likeOf: 'toast',
      how: 'Scramble 2 eggs with shredded cheese and pile them on buttered toast. Breakfast in 5 minutes.', shop: ['Eggs', 'Shredded cheese', 'Bread'] },
    { name: 'French Bread Pizza', anchors: ['garlic bread', 'rosatella'], groups: ['carbs', 'dairy', 'veg'], likeOf: 'garlic bread',
      how: 'Split garlic bread, add sauce, mozzarella and chopped broccoli. Bake at 425°F for 8–10 min.', shop: ['Garlic bread', 'Pizza sauce', 'Mozzarella', 'Broccoli'] },
    { name: 'Steak & Broccoli Baked Potato Bar', anchors: ['steak', 'potato', 'broccoli'], groups: ['protein', 'carbs', 'veg', 'dairy'], likeOf: 'steak + potatoes + broccoli',
      how: 'Baked potato topped with sliced steak, steamed broccoli, butter and a sprinkle of parmesan.', shop: ['Russet potatoes', 'Steak', 'Broccoli', 'Shredded cheese'] },
    { name: 'Cauliflower Mac & Cheese', anchors: ['mac'], groups: ['carbs', 'dairy', 'veg'], likeOf: 'mac and cheese',
      how: 'Add small cauliflower florets to the pasta water for the last 4 minutes. They melt into the cheese sauce.', shop: ['Mac and cheese', 'Cauliflower'] },
    { name: 'Spinach Rosatella Pasta', anchors: ['rosatella', 'alfredo', 'pasta'], groups: ['carbs', 'dairy', 'veg'], likeOf: 'rosatella / alfredo pasta',
      how: 'Stir 2 handfuls of spinach into the warm sauce until wilted, then toss with pasta.', shop: ['Pasta', 'Rosatella sauce', 'Baby spinach'] },
    { name: 'Salmon Tacos with Sweet Corn', anchors: ['salmon', 'corn'], groups: ['protein', 'carbs', 'veg'], likeOf: 'salmon + sweet corn',
      how: 'Flake baked salmon into warm tortillas and top with buttery corn and a squeeze of lime.', shop: ['Salmon', 'Tortillas', 'Sweet corn', 'Lime'] },
    { name: 'Cheesy Corn & Potato Chowder', anchors: ['corn', 'potato'], groups: ['carbs', 'veg', 'dairy'], likeOf: 'sweet corn + potatoes',
      how: 'Simmer diced potatoes and corn in broth and add milk and cheddar at the end. Cozy and creamy.', shop: ['Potatoes', 'Sweet corn', 'Broth', 'Milk', 'Cheddar'] },
    { name: 'Snack Board (instead of grazing)', anchors: ['pickle', 'cheeto'], groups: ['fruit', 'dairy', 'veg', 'carbs'], likeOf: 'pickles + crunchy snacks',
      how: 'One plate of apple slices, string cheese, pickles and crackers. A real mini-meal that hits 4 food groups.', shop: ['Apples', 'String cheese', 'Pickles', 'Crackers'] },
    { name: 'Strawberry-Banana Milk Smoothie', anchors: ['toast', 'mac', 'cheese'], groups: ['fruit', 'dairy'], likeOf: 'late-night sweet cravings',
      how: 'Blend 1 cup milk, a banana and a handful of frozen strawberries. No yogurt needed!', shop: ['Milk', 'Bananas', 'Frozen strawberries'] },
    { name: 'Garlic Parmesan Green Beans + Steak', anchors: ['steak', 'garlic', 'broccoli'], groups: ['protein', 'veg', 'dairy'], likeOf: 'steak + garlic',
      how: 'Roast green beans with butter, garlic and parmesan at 425°F for 15 min while the steak rests.', shop: ['Green beans', 'Parmesan', 'Garlic', 'Steak'] }
  ];

  // no cheese meals (parmesan is fine)
  const CHEESY = /\b(cheese|cheesy|cheddar|mozzarella|quesadilla|melt|mac)\b/i;
  const isCheesy = (s) => CHEESY.test(String(s).replace(/parmesan/ig, ''));
  for (let i = IDEA_MEALS.length - 1; i >= 0; i--) {
    const m = IDEA_MEALS[i];
    if (isCheesy(m.name) || isCheesy(m.how.replace(/(add|with|and) (cheese|shredded cheese)/ig, ''))) { IDEA_MEALS.splice(i, 1); continue; }
    m.shop = m.shop.filter(x => !isCheesy(x));
  }
  for (let i = IDEA_FOODS.length - 1; i >= 0; i--) if (/string cheese|cheddar|mozzarella/i.test(IDEA_FOODS[i][0])) IDEA_FOODS.splice(i, 1);
  let ideaFilter = 'all';
  const likedNames = () => state.foods.map(f => f.name.toLowerCase());
  function profile() {
    const names = likedNames(), score = {};
    Object.keys(TRAITS).forEach(t => { score[t] = names.filter(n => TRAITS[t].words.some(w => n.includes(w))).length; });
    const groupCount = {}; GROUP_KEYS.forEach(g => groupCount[g] = state.foods.filter(f => f.groups.includes(g)).length);
    return { score, groupCount };
  }
  function likedMatch(word) { return state.foods.find(f => f.name.toLowerCase().includes(word)); }

  function renderIdeas() {
    const { score, groupCount } = profile();
    const top = Object.keys(score).filter(t => score[t] > 0).sort((a, b) => score[b] - score[a]).slice(0, 4);
    const main = ['carbs', 'protein', 'veg', 'fruit', 'dairy'];
    const missing = main.filter(g => groupCount[g] === 0), thin = main.filter(g => groupCount[g] > 0 && groupCount[g] <= 2);
    const strongest = main.slice().sort((a, b) => groupCount[b] - groupCount[a])[0];
    const maxC = Math.max(1, ...main.map(k => groupCount[k]));
    const bars = main.map(g => '<div class="pbar"><span class="pl">' + ico(GROUP_ICON[g]) + ' ' + esc(GROUPS[g].label) + '</span><span class="track"><span class="fill" style="width:'
      + (groupCount[g] / maxC * 100) + '%"></span></span><b>' + groupCount[g] + '</b></div>').join('');
    $('#ideas-profile').innerHTML = '<div class="profile-cols"><div><h2>🔍 Your food profile</h2>'
      + '<p>You have <b>' + state.foods.length + ' foods</b> on your list. Your taste leans <b>' + (top.length ? top.map(t => TRAITS[t].label).join(', ') : 'comforting and simple') + '</b>. '
      + 'That\'s a great base, because those flavors are easy to build new foods around.</p>'
      + '<p>Your list is strongest in <b>' + esc(GROUPS[strongest].label.toLowerCase()) + '</b>'
      + (missing.length ? ' and has <b>no ' + missing.map(g => GROUPS[g].label.toLowerCase()).join(' or ') + '</b> yet' : '')
      + (thin.length ? ', with only a few ' + thin.map(g => GROUPS[g].label.toLowerCase()).join(' and ') : '') + '. The <b>Ideas</b> tab leans that way, using flavors you already like.</p>'
      + '<div class="traits">' + top.map(t => '<span class="pill">' + esc(TRAITS[t].label) + '</span>').join('') + '</div></div>'
      + '<div class="pbars"><p class="lbl">Foods on your list, by group</p>' + bars + '</div></div>';

    // ---- food suggestions ----
    const names = likedNames(), hidden = state.hiddenIdeas || [];
    const scored = IDEA_FOODS.filter(([n]) => !names.includes(n.toLowerCase()) && !hidden.includes(n)).map(([n, g, traits, because, why]) => {
      let s = traits.reduce((a, t) => a + (score[t] || 0), 0);
      if (groupCount[g] === 0) s += 6; else if (groupCount[g] <= 2) s += 3;
      const b = because && likedMatch(because);
      if (b) s += 2;
      return { n, g, because: b ? b.name : null, why, s };
    }).sort((a, b) => b.s - a.s);
    const groupsPresent = ['all'].concat(main.filter(g => scored.some(x => x.g === g)));
    if (!groupsPresent.includes(ideaFilter)) ideaFilter = 'all';
    $('#ideas-filter').innerHTML = groupsPresent.map(g => '<button type="button" class="chip' + (g === ideaFilter ? ' on' : '') + '" data-idea-filter="' + g + '">'
      + (g === 'all' ? 'Top picks' : ico(GROUP_ICON[g]) + ' ' + esc(GROUPS[g].label)) + '</button>').join('');
    const list = ideaFilter === 'all' ? scored.slice(0, 8) : scored.filter(x => x.g === ideaFilter);
    $('#ideas-foods').innerHTML = list.map(x => '<div class="idea g-' + x.g + '">'
      + '<div class="idea-head">' + ico(GROUP_ICON[x.g], 'big') + '<div><h3>' + esc(x.n) + '</h3><span class="muted">' + esc(GROUPS[x.g].label)
      + (x.because ? ' · because you like ' + esc(x.because.toLowerCase()) : '') + '</span></div></div>'
      + '<p>📊 ' + esc(x.why) + '</p>'
      + '<div class="idea-actions"><button class="btn small" data-idea-shop="' + esc(x.n) + '">🛒 Shopping list</button>'
      + '<button class="btn small soft" data-idea-like="' + esc(x.n) + '|' + x.g + '">💛 I\'ll try it</button>'
      + '<button class="linkish" data-idea-hide="' + esc(x.n) + '">Not for me</button></div></div>').join('')
      || '<p class="muted">You\'ve added or hidden everything here. Amazing!</p>';

    // ---- meal suggestions ----
    const meals = IDEA_MEALS.filter(m => !hidden.includes(m.name)).map(m => {
      const hits = m.anchors.filter(a => likedMatch(a));
      const adds = m.groups.filter(g => groupCount[g] <= 2);
      return { m, hits, adds, s: hits.length * 3 + adds.length * 2 };
    }).filter(x => x.hits.length).sort((a, b) => b.s - a.s).slice(0, 6);
    $('#ideas-meals').innerHTML = meals.map(({ m, adds }) => '<div class="idea meal">'
      + '<h3>' + esc(m.name) + '</h3><p class="muted">Like your ' + esc(m.likeOf) + '</p>'
      + '<div class="meta">' + m.groups.map(g => '<span class="pill g-' + g + (adds.includes(g) ? ' yes' : '') + '">' + ico(GROUP_ICON[g]) + ' ' + esc(GROUPS[g].label) + '</span>').join('') + '</div>'
      + '<p>' + esc(m.how) + '</p>'
      + (adds.length ? '<p class="tip">🌱 Sneaks in ' + adds.map(g => GROUPS[g].label.toLowerCase()).join(' & ') + '</p>' : '')
      + '<div class="idea-actions"><button class="btn small" data-meal-shop="' + esc(m.name) + '">🛒 Add ingredients</button>'
      + '<button class="linkish" data-idea-hide="' + esc(m.name) + '">Not for me</button></div></div>').join('')
      || '<p class="muted">Add a few more foods you like and meal ideas will show up here.</p>';

    $('#ideas-hidden').innerHTML = hidden.length ? hidden.length + ' idea' + (hidden.length > 1 ? 's' : '') + ' hidden. <button class="linkish" id="ideas-unhide">Show them again</button>' : '';
  }

  function addToShopping(items) {
    const wk = isoDate(planDays(0)[0]);
    state.groceryExtra = state.groceryExtra || {};
    const list = state.groceryExtra[wk] = state.groceryExtra[wk] || [];
    let added = 0;
    items.forEach(n => { if (!list.some(x => x.toLowerCase() === n.toLowerCase())) { list.push(n); added++; } });
    save(); return added;
  }
  function flash(btn, text) { const old = btn.innerHTML; btn.textContent = text; btn.disabled = true; setTimeout(() => { btn.innerHTML = old; btn.disabled = false; }, 1600); }

  document.addEventListener('click', (ev) => {
    const f = ev.target.closest('[data-idea-filter]');
    if (f) { ideaFilter = f.dataset.ideaFilter; renderIdeas(); sketchify($('#tab-ideas')); return; }
    const sh = ev.target.closest('[data-idea-shop]');
    if (sh) { const n = addToShopping([sh.dataset.ideaShop]); renderPlan(); sketchify($('#tab-plan')); flash(sh, n ? '✓ Added to this week\'s list' : '✓ Already on your list'); return; }
    const ms = ev.target.closest('[data-meal-shop]');
    if (ms) { const m = IDEA_MEALS.find(x => x.name === ms.dataset.mealShop); const n = addToShopping(m.shop); renderPlan(); sketchify($('#tab-plan')); flash(ms, '✓ Added ' + n + ' item' + (n === 1 ? '' : 's')); return; }
    const lk = ev.target.closest('[data-idea-like]');
    if (lk) { const [n, g] = lk.dataset.ideaLike.split('|'); state.foods.push({ id: uid(), name: n, groups: [g], cal: estimateCal(n, g).cal, calEst: true }); save(); render(); return; }
    const hd = ev.target.closest('[data-idea-hide]');
    if (hd) { state.hiddenIdeas = (state.hiddenIdeas || []).concat(hd.dataset.ideaHide); save(); renderIdeas(); sketchify($('#tab-ideas')); return; }
    if (ev.target.id === 'ideas-unhide') { state.hiddenIdeas = []; save(); renderIdeas(); sketchify($('#tab-ideas')); }
  });

  /* ===============================================================
     WHAT CAN I MAKE? Match pantry ingredients to simple dishes.
     need = list of requirements; each requirement is a list of
     keywords (any one counts). Salt, pepper and oil are assumed.
     =============================================================== */
  const PANTRY_DISHES = [
    { name: 'Buttered toast', meal: 'Breakfast', need: [['bread', 'toast'], ['butter']], extra: [['jam', 'honey', 'cinnamon']], groups: ['carbs'], steps: 'Toast the bread and butter it while it\'s hot.' },
    { name: 'Garlic toast', meal: 'Side', need: [['bread', 'toast'], ['butter'], ['garlic']], extra: [], groups: ['carbs'], steps: 'Mix soft butter with garlic, spread on bread and toast at 400°F for 6–8 min.' },
    { name: 'Egg toast', meal: 'Breakfast', need: [['bread', 'toast'], ['egg']], extra: [['butter'], ['hot sauce']], groups: ['carbs', 'protein'], steps: 'Scramble 2 eggs slowly in butter and pile onto buttered toast.' },
    { name: 'Scrambled eggs', meal: 'Breakfast', need: [['egg']], extra: [['butter'], ['milk']], groups: ['protein'], steps: 'Whisk eggs with a splash of milk and cook low and slow in butter, stirring.' },
    { name: 'Breakfast potato hash', meal: 'Breakfast', need: [['potato', 'hash brown'], ['egg']], extra: [['onion', 'pepper']], groups: ['carbs', 'protein'], steps: 'Pan-fry small potato cubes until crispy, then crack eggs on top and cover until set.' },
    { name: 'Peanut butter banana toast', meal: 'Breakfast', need: [['bread', 'toast'], ['peanut butter'], ['banana']], extra: [['honey']], groups: ['carbs', 'protein', 'fruit'], steps: 'Spread peanut butter on toast and top with banana slices.' },
    { name: 'Apple & peanut butter', meal: 'Snack', need: [['apple'], ['peanut butter']], extra: [], groups: ['fruit', 'protein'], steps: 'Slice the apple and dip!' },
    { name: 'Milk smoothie', meal: 'Breakfast', need: [['milk'], ['banana', 'strawberr', 'berr', 'mango']], extra: [['peanut butter'], ['honey']], groups: ['fruit', 'dairy'], steps: 'Blend 1 cup milk with your fruit (frozen fruit makes it thick). No yogurt needed.' },
    { name: 'Butter noodles', meal: 'Lunch', need: [['pasta', 'noodle', 'spaghetti'], ['butter']], extra: [['parmesan'], ['garlic']], groups: ['carbs'], steps: 'Boil noodles, drain, and toss with butter, salt and parmesan.' },
    { name: 'Pasta alfredo', meal: 'Dinner', need: [['pasta', 'noodle', 'fettuccine'], ['alfredo']], extra: [['broccoli', 'spinach', 'pea'], ['salmon', 'shrimp']], groups: ['carbs', 'dairy'], steps: 'Boil pasta, drain, and stir in warm alfredo sauce.' },
    { name: 'Broccoli alfredo', meal: 'Dinner', need: [['pasta', 'noodle'], ['alfredo'], ['broccoli']], extra: [['parmesan']], groups: ['carbs', 'dairy', 'veg'], steps: 'Add broccoli to the pasta pot for the last 3 min, drain, stir in alfredo.' },
    { name: 'Rosatella pasta', meal: 'Dinner', need: [['pasta', 'noodle'], ['rosatella', 'rosa sauce', 'vodka sauce']], extra: [['spinach', 'broccoli'], ['parmesan']], groups: ['carbs', 'dairy'], steps: 'Boil pasta and toss with warm rosatella sauce.' },
    { name: 'Garlic butter shrimp noodles', meal: 'Dinner', need: [['shrimp'], ['pasta', 'noodle'], ['butter']], extra: [['garlic'], ['parmesan']], groups: ['protein', 'carbs'], steps: 'Sauté shrimp in butter (and garlic) 4–5 min; toss with cooked noodles.' },
    { name: 'Garlic butter salmon', meal: 'Dinner', need: [['salmon'], ['butter']], extra: [['garlic'], ['lemon']], groups: ['protein'], steps: 'Top salmon with butter and garlic and bake at 400°F for 12–15 min.' },
    { name: 'Salmon & broccoli sheet pan', meal: 'Dinner', need: [['salmon'], ['broccoli']], extra: [['potato'], ['butter', 'garlic']], groups: ['protein', 'veg'], steps: 'Salmon on one side, broccoli on the other. Bake at 400°F for 12–15 min.' },
    { name: 'Salmon tacos', meal: 'Dinner', need: [['salmon'], ['tortilla']], extra: [['corn'], ['lime']], groups: ['protein', 'carbs'], steps: 'Bake salmon, flake into warm tortillas and top with corn and cheese.' },
    { name: 'Steak & potatoes', meal: 'Dinner', need: [['steak'], ['potato', 'fries']], extra: [['corn', 'broccoli', 'green bean'], ['butter']], groups: ['protein', 'carbs'], steps: 'Roast potatoes at 425°F for 25 min; sear steak 3–4 min per side, rest 5 min.' },
    { name: 'Cheeseburger potato bowl', meal: 'Dinner', need: [['beef', 'burger'], ['potato', 'fries']], extra: [['pickle']], groups: ['protein', 'carbs'], steps: 'Crispy potatoes or fries in a bowl, topped with browned beef, cheese and pickles.' },
    { name: 'Loaded baked potato', meal: 'Dinner', need: [['potato']], extra: [['butter'], ['broccoli'], ['steak', 'beef']], groups: ['carbs'], steps: 'Microwave a pricked potato 8–10 min, split, and add your toppings.' },
    { name: 'Mashed potatoes', meal: 'Side', need: [['potato'], ['butter'], ['milk']], extra: [['garlic']], groups: ['carbs', 'dairy'], steps: 'Boil peeled potato chunks 15 min, drain, mash with butter and warm milk.' },
    { name: 'Corn & potato chowder', meal: 'Dinner', need: [['corn'], ['potato'], ['milk']], extra: [['broth'], ['butter']], groups: ['carbs', 'veg', 'dairy'], steps: 'Simmer diced potato and corn in broth or water 15 min, add milk and cheese.' },
    { name: 'Buttered sweet corn', meal: 'Side', need: [['corn'], ['butter']], extra: [['parmesan']], groups: ['veg'], steps: 'Boil or microwave corn 4–5 min, then butter and salt.' },
    { name: 'Parmesan broccoli', meal: 'Side', need: [['broccoli']], extra: [['parmesan'], ['garlic'], ['butter']], groups: ['veg'], steps: 'Steam broccoli 4 minutes, toss with butter and garlic, and finish with a sprinkle of parmesan.' },
    { name: 'Garlic roasted broccoli', meal: 'Side', need: [['broccoli']], extra: [['garlic'], ['parmesan']], groups: ['veg'], steps: 'Toss with oil and salt, roast at 425°F for 15 min until crispy edges.' },
    { name: 'Cinnamon sugar toast', meal: 'Breakfast', need: [['bread', 'toast'], ['butter']], extra: [['cinnamon'], ['banana']], groups: ['carbs'], steps: 'Toast the bread. Spread with butter, then sprinkle with cinnamon and a little sugar. Add banana slices on top for extra staying power.' },
    { name: 'Buttery corn scramble', meal: 'Breakfast', need: [['egg'], ['corn']], extra: [['butter'], ['toast', 'bread']], groups: ['protein', 'veg'], steps: 'Warm a handful of corn in butter for 2 minutes. Add 2 whisked eggs and stir slowly until just set. Serve with toast.' },
    { name: '2-ingredient banana pancakes', meal: 'Breakfast', need: [['banana'], ['egg']], extra: [['butter'], ['cinnamon'], ['peanut butter']], groups: ['fruit', 'protein'], steps: 'Mash 1 ripe banana and whisk in 2 eggs. Cook small spoonfuls in a buttered pan on medium-low, about 1 minute per side. Top with peanut butter if you like.' },
    { name: 'Dill pickle pasta salad', meal: 'Lunch', need: [['pasta', 'noodle'], ['pickle']], extra: [['mayo'], ['ranch'], ['parmesan']], groups: ['carbs', 'veg'], steps: 'Cook pasta and rinse with cold water. Toss with chopped pickles, a spoon of mayo or ranch and a splash of pickle juice. Chill or eat right away.' },
    { name: 'Garlic parmesan fries', meal: 'Lunch', need: [['fries', 'potato']], extra: [['garlic'], ['parmesan'], ['beef', 'burger']], groups: ['carbs'], steps: 'Bake fries until crispy, then toss with melted garlic butter and parmesan. Add browned beef on top to make it a full meal.' },
    { name: 'Garlic parmesan toast bites', meal: 'Snack', need: [['bread', 'toast']], extra: [['garlic'], ['butter'], ['parmesan']], groups: ['carbs'], steps: 'Butter bread, sprinkle with garlic and parmesan, and toast until golden. Cut into small squares.' },
    { name: 'Crispy potato bites', meal: 'Snack', need: [['potato', 'fries']], extra: [['ranch']], groups: ['carbs'], steps: 'Toss small potato cubes with oil and salt. Air-fry at 400°F or bake at 425°F about 15 minutes until crispy. Dip in ranch.' },
    { name: 'Banana & peanut butter', meal: 'Snack', need: [['banana'], ['peanut butter']], extra: [['cinnamon']], groups: ['fruit', 'protein'], steps: 'Slice a banana and dip in or drizzle with peanut butter. Sweet, filling, and ready in a minute.' },
    { name: 'Buttery corn cup', meal: 'Snack', need: [['corn']], extra: [['butter'], ['hot sauce'], ['parmesan']], groups: ['veg'], steps: 'Microwave a cup of corn 1 minute, stir in butter, and add a dash of hot sauce for a Hot Cheetos kick.' },
    { name: 'Grilled cheese', meal: 'Lunch', need: [['bread', 'toast', 'grilled cheese'], ['cheese', 'grilled cheese']], extra: [['butter'], ['pickle']], groups: ['carbs', 'dairy'], steps: 'Butter the outside of two slices of bread, fill with cheese, and cook in a pan on medium 3 minutes per side until golden and melty. Pickles on the side.' },
    { name: 'PB&J', meal: 'Lunch', need: [['bread', 'toast'], ['peanut butter']], extra: [['jam', 'jelly'], ['banana']], groups: ['carbs', 'protein'], steps: 'Spread peanut butter on one slice and jam or jelly on the other, then press together. Swap the jam for banana slices if you like.' },
    { name: 'PB&J toast bites', meal: 'Snack', need: [['bread', 'toast'], ['peanut butter']], extra: [['jam', 'jelly']], groups: ['carbs', 'protein'], steps: 'Toast a slice, spread with peanut butter and a little jam, and cut into 4 squares.' },
    { name: 'Fruit & cracker plate', meal: 'Snack', need: [['apple', 'grape', 'strawberr', 'clementine', 'berr', 'banana'], ['cracker']], extra: [['peanut butter'], ['pickle']], groups: ['fruit', 'carbs'], steps: 'Arrange fruit and crackers on a plate. A real mini-meal instead of grazing.' },
    { name: 'Parmesan broccoli pasta', meal: 'Lunch', need: [['pasta', 'noodle'], ['broccoli']], extra: [['parmesan'], ['garlic'], ['butter']], groups: ['carbs', 'veg'], steps: 'Boil pasta with broccoli for the last 3 minutes. Drain and toss with butter, garlic and parmesan.' },
    { name: 'Salmon pasta salad', meal: 'Lunch', need: [['salmon'], ['pasta', 'noodle']], extra: [['pickle'], ['mayo'], ['lemon']], groups: ['protein', 'carbs'], steps: 'Toss cooked, cooled pasta with flaked salmon, chopped pickles and a spoon of mayo or a squeeze of lemon.' },
    { name: 'Potato & corn hash bowl', meal: 'Lunch', need: [['potato', 'fries'], ['corn']], extra: [['egg'], ['butter'], ['hot sauce']], groups: ['carbs', 'veg'], steps: 'Pan-fry small potato cubes until crispy, stir in corn and butter, and top with a fried egg if you like.' }
  ];
  const PANTRY_STAPLES = ['Eggs', 'Bread', 'Butter', 'Parmesan', 'Milk', 'Garlic', 'Pasta', 'Tortillas'];
  // no melts / sandwiches / tuna (grilled cheese and PB&J are fine)
  const NOT_FOR_ME = /\b(melt|melts|sandwich|sandwiches|sub|subs|wrap|wraps|hoagie|panini|tuna|buns?)\b/i;
  const okFood = (s) => !NOT_FOR_ME.test(String(s).replace(/grilled cheese|pb&j/ig, ''));
  [RECIPES, PANTRY_DISHES, IDEA_MEALS].forEach(list => { for (let i = list.length - 1; i >= 0; i--) {
    const x = list[i]; if (!okFood(x.name) || (x.shop && x.shop.some(s => !okFood(s)))) list.splice(i, 1); } });
  for (let i = IDEA_FOODS.length - 1; i >= 0; i--) if (!okFood(IDEA_FOODS[i][0])) IDEA_FOODS.splice(i, 1);

  /* ---- cooking extras (spices, aromatics, sauces, other) ---- */
  const EXTRA_CATS = {
    spice: { label: 'Spices & seasonings', icon: 'sparkle',
      quick: ['Garlic powder', 'Onion powder', 'Paprika', 'Italian seasoning', 'Chili flakes', 'Cajun seasoning', 'Lemon pepper', 'Cinnamon', 'Everything bagel seasoning', 'Taco seasoning', 'Oregano', 'Parsley'] },
    veg: { label: 'Cooking veggies & aromatics', icon: 'broccoli',
      quick: ['Garlic', 'Onion', 'Bell pepper', 'Mushrooms', 'Spinach', 'Tomatoes', 'Lemon', 'Lime', 'Green onion', 'Jalapeño'] },
    sauce: { label: 'Sauces & condiments', icon: 'chili',
      quick: ['Ketchup', 'Mustard', 'Mayo', 'Ranch', 'Hot sauce', 'BBQ sauce', 'Marinara', 'Pizza sauce', 'Honey', 'Pesto'] },
    other: { label: 'Other ingredients', icon: 'pan',
      quick: ['Butter', 'Olive oil', 'Parmesan', 'Breadcrumbs', 'Flour', 'Broth', 'Heavy cream', 'Sour cream', 'Brown sugar'] }
  };
  // which extras go well with which dishes: [extra keyword, dish keywords]
  const SEASON_PAIRS = [
    ['garlic', ['pasta', 'noodle', 'alfredo', 'rosatella', 'mac', 'potato', 'salmon', 'shrimp', 'steak', 'broccoli', 'toast', 'pizza', 'bread']],
    ['onion powder', ['burger', 'potato', 'steak', 'chowder', 'mac', 'egg']], ['onion', ['burger', 'steak', 'potato', 'chowder', 'hash', 'quesadilla']],
    ['paprika', ['potato', 'egg', 'salmon', 'shrimp', 'mac', 'hash', 'fries']], ['italian', ['pasta', 'pizza', 'bread', 'toast', 'alfredo', 'rosatella']],
    ['oregano', ['pizza', 'pasta', 'rosatella']], ['parsley', ['pasta', 'potato', 'salmon', 'shrimp', 'alfredo']],
    ['chili flake', ['pasta', 'pizza', 'rosatella', 'shrimp', 'egg']], ['cajun', ['salmon', 'shrimp', 'potato', 'fries', 'steak', 'corn']],
    ['lemon pepper', ['salmon', 'shrimp', 'broccoli', 'potato']], ['lemon', ['salmon', 'shrimp', 'broccoli', 'alfredo']],
    ['lime', ['taco', 'quesadilla', 'corn', 'salmon']], ['cinnamon', ['toast', 'smoothie', 'apple', 'banana', 'peanut butter']],
    ['everything bagel', ['egg', 'toast', 'potato']], ['taco', ['quesadilla', 'taco', 'burger', 'beef']],
    ['hot sauce', ['egg', 'quesadilla', 'mac', 'taco', 'potato', 'hash']], ['ranch', ['potato', 'fries', 'broccoli', 'pizza']],
    ['bbq', ['burger', 'steak', 'potato', 'salmon']], ['honey', ['toast', 'salmon', 'smoothie', 'peanut butter', 'corn']],
    ['mushroom', ['steak', 'burger', 'pizza', 'alfredo', 'egg']], ['bell pepper', ['quesadilla', 'pizza', 'hash', 'egg', 'steak']],
    ['spinach', ['alfredo', 'rosatella', 'pasta', 'egg', 'quesadilla']], ['parmesan', ['pasta', 'noodle', 'broccoli', 'corn', 'alfredo', 'potato']],
    ['pickle', ['burger', 'grilled cheese', 'tuna']], ['mustard', ['burger', 'tuna', 'potato']], ['pesto', ['pasta', 'noodle', 'pizza', 'toast']]
  ];
  function seasonFor(dishName) {
    const d = dishName.toLowerCase();
    return (state.extras || []).filter(x => SEASON_PAIRS.some(([k, dishes]) => x.name.toLowerCase().includes(k) && dishes.some(w => d.includes(w))))
      .map(x => x.name).slice(0, 3);
  }
  function renderExtras() {
    const ex = state.extras || [];
    const have = ex.map(x => x.name.toLowerCase());
    $('#extras-grid').innerHTML = Object.keys(EXTRA_CATS).map(c => {
      const C = EXTRA_CATS[c], mine = ex.map((x, i) => ({ x, i })).filter(o => o.x.cat === c);
      const quick = C.quick.filter(n => !have.includes(n.toLowerCase()));
      return '<div class="extra-col"><h3>' + ico(C.icon) + ' ' + esc(C.label) + ' <span class="count">' + mine.length + '</span></h3>'
        + '<div class="chips">' + (mine.length ? mine.map(({ x, i }) => '<span class="chip on">' + esc(x.name)
            + '<button class="x low" data-extra-low="' + i + '" title="Running low: add to shopping list" aria-label="Add ' + esc(x.name) + ' to shopping list">🛒</button>'
            + '<button class="x" data-extra-del="' + i + '" aria-label="Remove ' + esc(x.name) + '">×</button></span>').join('')
          : '<span class="muted">Nothing yet</span>') + '</div>'
        + (quick.length ? '<div class="chips quick">' + quick.map(n => '<button type="button" class="chip" data-extra-quick="' + esc(n) + '|' + c + '">+ ' + esc(n) + '</button>').join('') + '</div>' : '')
        + '</div>';
    }).join('');
  }
  function guessExtraCat(name) {
    const n = name.toLowerCase();
    for (const c of Object.keys(EXTRA_CATS)) if (EXTRA_CATS[c].quick.some(q => q.toLowerCase() === n)) return c;
    if (/powder|seasoning|spice|salt|pepper$|paprika|cumin|oregano|basil|thyme|rosemary|cinnamon|nutmeg|flake|dill|curry|chili powder|ginger|saffron|turmeric|sage|herbes|allspice|clove|bay leaf|seed/.test(n)) return 'spice';
    if (/sauce|ketchup|mustard|mayo|ranch|dressing|honey|syrup|salsa|pesto|vinegar|jam/.test(n)) return 'sauce';
    if (/onion|garlic|pepper|mushroom|spinach|tomato|lemon|lime|celery|carrot|herb|cilantro|jalape|kale|zucchini/.test(n)) return 'veg';
    return null;
  }
  function addExtras(text, cat) {
    state.extras = state.extras || [];
    text.split(/[,\n]/).map(t => t.trim()).filter(Boolean).forEach(n => {
      n = n.charAt(0).toUpperCase() + n.slice(1);
      if (!state.extras.some(x => x.name.toLowerCase() === n.toLowerCase())) state.extras.push({ name: n, cat: cat || guessExtraCat(n) || 'other' });
    });
    save(); renderExtras(); renderPantry(); sketchify($('#tab-foods')); sketchify($('#tab-ideas'));
  }
  $('#extra-cat').innerHTML = '<option value="">Auto-pick category</option>' + Object.keys(EXTRA_CATS).map(c => '<option value="' + c + '">' + EXTRA_CATS[c].label + '</option>').join('');
  $('#extra-form').addEventListener('submit', (ev) => { ev.preventDefault(); const i = $('#extra-input'); addExtras(i.value, $('#extra-cat').value); i.value = ''; i.focus(); });
  document.addEventListener('click', (ev) => {
    const q = ev.target.closest('[data-extra-quick]'); if (q) { const [n, c] = q.dataset.extraQuick.split('|'); addExtras(n, c); return; }
    const d = ev.target.closest('[data-extra-del]');
    if (d) { state.extras.splice(+d.dataset.extraDel, 1); save(); renderExtras(); renderPantry(); sketchify($('#tab-foods')); sketchify($('#tab-ideas')); return; }
    const lo = ev.target.closest('[data-extra-low]');
    if (lo) { const x = state.extras[+lo.dataset.extraLow]; const n = addToShopping([x.name]); renderPlan(); sketchify($('#tab-plan'));
      lo.textContent = '✓'; lo.title = n ? 'Added to this week\'s shopping list' : 'Already on your list'; setTimeout(() => { lo.textContent = '🛒'; sketchify(lo.parentNode); }, 1500); }
  });

  function pantryHas(words) {
    const p = (state.pantry || []).concat((state.extras || []).map(x => x.name)).map(x => x.toLowerCase());
    return words.some(w => p.some(x => x.includes(w) || (x.length > 3 && w.includes(x))));
  }
  function renderPantry() {
    const pantry = state.pantry || [];
    $('#pantry-chips').innerHTML = pantry.length
      ? pantry.map((n, i) => '<span class="chip on">' + esc(n) + '<button class="x" data-pantry-del="' + i + '" aria-label="Remove ' + esc(n) + '">×</button></span>').join('')
        + '<button class="linkish" id="pantry-clear">Clear all</button>'
      : '<span class="muted">No ingredients yet. Add what\'s in your kitchen!</span>';
    const have = pantry.map(x => x.toLowerCase());
    const quick = state.foods.filter(f => !/sauce/i.test(f.name) || /alfredo|rosatella/i.test(f.name)).map(f => f.name).concat(PANTRY_STAPLES)
      .filter((n, i, a) => a.findIndex(x => x.toLowerCase() === n.toLowerCase()) === i && !have.includes(n.toLowerCase())).slice(0, 18);
    $('#pantry-quick').innerHTML = quick.map(n => '<button type="button" class="chip" data-pantry-quick="' + esc(n) + '">+ ' + esc(n) + '</button>').join('');

    if (!pantry.length) { $('#pantry-results').innerHTML = ''; return; }
    const results = PANTRY_DISHES.map(d => {
      const missing = d.need.filter(req => !pantryHas(req));
      const extras = d.extra.filter(req => pantryHas(req)).map(req => req.find(w => pantryHas([w])) || req[0]);
      return { d, missing, extras, score: (d.need.length - missing.length) / d.need.length };
    }).filter(r => r.score > 0 && r.missing.length <= 2).sort((a, b) => a.missing.length - b.missing.length || b.extras.length - a.extras.length || b.d.need.length - a.d.need.length);
    const ready = results.filter(r => !r.missing.length), almost = results.filter(r => r.missing.length);
    const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
    const card = (r) => {
      const add = r.missing.map(req => cap(req[0]));
      return '<div class="idea dish m-' + r.d.meal.toLowerCase() + '"><div class="dish-top"><h3><button class="howto-link title" data-howto="' + esc('dish|' + r.d.name) + '">' + esc(r.d.name) + ' →</button></h3><span class="pill">' + esc(r.d.meal) + '</span></div>'
        + '<div class="meta">' + r.d.groups.map(g => '<span class="pill g-' + g + '">' + ico(GROUP_ICON[g]) + ' ' + esc(GROUPS[g].label) + '</span>').join('') + '</div>'
        + '<p>' + esc(r.d.steps) + '</p>'
        + (r.extras.length ? '<p class="muted">✓ You also have ' + esc(r.extras.join(', ')) + ' to add.</p>' : '')
        + (seasonFor(r.d.name + ' ' + r.d.steps).length ? '<p class="season">🧂 Season with your: <b>' + esc(seasonFor(r.d.name + ' ' + r.d.steps).join(', ')) + '</b></p>' : '')
        + (add.length ? '<p class="need">Missing: <b>' + esc(add.join(', ')) + '</b></p><div class="idea-actions"><button class="btn small" data-pantry-shop="' + esc(add.join('|')) + '">🛒 Add missing to list</button></div>' : '')
        + '</div>';
    };
    $('#pantry-results').innerHTML =
      '<h3 class="sub">🎉 Ready to make (' + ready.length + ')</h3>'
      + (ready.length ? '<div class="idea-grid">' + ready.map(card).join('') + '</div>' : '<p class="muted">Nothing complete yet. Check the "almost there" list below!</p>')
      + (almost.length ? '<h3 class="sub">🛒 Almost there: missing 1–2 things (' + almost.length + ')</h3><div class="idea-grid">' + almost.slice(0, 9).map(card).join('') + '</div>' : '');
  }
  function addPantry(text) {
    state.pantry = state.pantry || [];
    text.split(/[,\n]/).map(t => t.trim()).filter(Boolean).forEach(n => {
      if (!state.pantry.some(x => x.toLowerCase() === n.toLowerCase())) state.pantry.push(n.charAt(0).toUpperCase() + n.slice(1));
    });
    save(); renderPantry(); sketchify($('#tab-ideas'));
  }
  $('#pantry-form').addEventListener('submit', (ev) => { ev.preventDefault(); const i = $('#pantry-input'); addPantry(i.value); i.value = ''; i.focus(); });
  document.addEventListener('click', (ev) => {
    const q = ev.target.closest('[data-pantry-quick]'); if (q) { addPantry(q.dataset.pantryQuick); return; }
    const d = ev.target.closest('[data-pantry-del]');
    if (d) { state.pantry.splice(+d.dataset.pantryDel, 1); save(); renderPantry(); sketchify($('#tab-ideas')); return; }
    if (ev.target.id === 'pantry-clear') { state.pantry = []; save(); renderPantry(); sketchify($('#tab-ideas')); return; }
    const sh = ev.target.closest('[data-pantry-shop]');
    if (sh) { const n = addToShopping(sh.dataset.pantryShop.split('|')); renderPlan(); sketchify($('#tab-plan')); flash(sh, '✓ Added ' + n + ' to this week\'s list'); }
  });

  /* ===============================================================
     HOW TO MAKE IT page (#make/...)
     =============================================================== */
  function cap1(w) { return w.charAt(0).toUpperCase() + w.slice(1); }
  const STOP = /^(cup|cups|tbsp|tsp|oz|small|large|medium|slice|slices|optional|fresh|about|chopped|minced|cooked|shredded|extra|frozen|thinly|sliced|cubed|flaked|clove|cloves|piece|handful|handfuls|your|with|and|or|any|shape|leftovers|perfect|box|black|crushed|a|of|the|for)$/;
  function haveIngredient(line, strict) {
    const l = line.toLowerCase();
    if (/^(salt|pepper|olive oil|oil)\b/.test(l) || /salt, pepper/.test(l)) return true;
    const words = l.replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.test(w));
    const hit = (w) => pantryHas([w.replace(/(es|s)$/, '')]);
    return words.length > 0 && (strict ? words.every(hit) : words.some(hit));
  }

  // Simple guides for single foods
  const FOOD_HOWTO = [
    ['garlic bread', 10, ['Frozen garlic bread (or bread + butter + garlic)'], ['Heat the oven to 400°F (200°C).', 'Bake frozen garlic bread 8–10 minutes until golden. Homemade: spread bread with butter mixed with garlic and bake 6–8 minutes.']],
    ['grilled cheese', 8, ['2 slices bread', '2 slices cheese', 'Butter'], ['Butter one side of each slice.', 'Put one slice butter-side down in a pan on medium, add cheese, and top with the other slice butter-side up.', 'Cook 2–3 minutes per side until golden and melty.']],
    ['toast', 3, ['Bread', 'Butter (optional)'], ['Toast bread until golden.', 'Butter it while it\'s hot. Add peanut butter, banana or cheese for extra staying power.']],
    ['mac', 12, ['1 box mac and cheese (and the milk/butter it calls for)'], ['Boil water and cook the pasta 7–8 minutes.', 'Drain, then stir in the cheese packet with the milk and butter.', 'Optional: toss in broccoli for the last 3 minutes of boiling.']],
    ['butter noodle', 12, ['2 oz noodles', '1 tbsp butter', 'Parmesan (optional)'], ['Boil noodles in salted water until tender.', 'Drain, then toss with butter, a pinch of salt and parmesan.']],
    ['pasta', 12, ['2 oz pasta', 'Sauce you like'], ['Boil a big pot of salted water.', 'Cook pasta per the box time, stirring once or twice.', 'Drain and toss with warm sauce, butter or parmesan.']],
    ['alfredo', 5, ['Alfredo sauce', 'Cooked pasta'], ['Warm ½ cup sauce in a small pot or the microwave.', 'Toss with hot pasta. Stir in broccoli or spinach if you like.']],
    ['rosatella', 5, ['Rosatella sauce', 'Cooked pasta'], ['Warm ½ cup sauce in a small pot or the microwave.', 'Toss with hot pasta and top with parmesan.']],
    ['salmon', 15, ['1 salmon fillet', 'Butter or oil', 'Salt, pepper, garlic'], ['Heat the oven to 400°F (200°C).', 'Put salmon on a lined pan, season, and top with a little butter.', 'Bake 12–15 minutes, until it flakes easily with a fork.']],
    ['steak', 15, ['1 steak', 'Salt, pepper', 'Butter (optional)'], ['Take the steak out 20 minutes early and pat it dry. Season well.', 'Heat a pan until very hot with a little oil.', 'Sear 3–4 minutes per side (longer if thick), adding butter at the end.', 'Rest 5 minutes before slicing.']],
    ['burger', 12, ['4 oz ground beef', 'Bun', 'Cheese, pickles, sauce'], ['Shape beef into a patty a bit wider than the bun; season with salt and pepper.', 'Cook in a hot pan 3–4 minutes per side. Add cheese for the last minute.', 'Build on a toasted bun with pickles and sauce.']],
    ['beef', 12, ['4 oz ground beef', 'Salt, pepper'], ['Cook beef in a pan on medium-high, breaking it up, 6–8 minutes until browned.', 'Season with salt, pepper and garlic powder.']],
    ['sweet corn', 6, ['1 ear corn', 'Butter, salt'], ['Microwave the ear in its husk 4 minutes (or boil 5 minutes).', 'Let it cool a minute, peel, and add butter and salt.']],
    ['corn', 6, ['Corn', 'Butter, salt'], ['Boil or microwave 4–5 minutes.', 'Add butter and salt.']],
    ['broccoli', 15, ['2 cups broccoli', 'Oil, salt', 'Parmesan (optional)'], ['Roast: toss with oil and salt, then 425°F (220°C) for 15 minutes until crispy edges.', 'Or steam: microwave with a splash of water, covered, 3 minutes.']],
    ['fries', 20, ['Frozen fries'], ['Bake at 425°F (220°C) for 20 minutes, flipping halfway, or air-fry at 400°F for 12–15 minutes.', 'Salt while hot.']],
    ['potato', 25, ['2 small potatoes', 'Oil, salt, garlic powder'], ['Heat the oven to 425°F (220°C).', 'Cut into bite-size cubes and toss with oil and seasoning.', 'Roast 25 minutes, flipping once, until crispy.', 'Quick option: prick a whole potato and microwave 8–10 minutes.']],
    ['pickle', 0, ['Pickles'], ['Ready to eat! Grab a few spears.', 'Tip: pair with a cheese stick or crackers for a more filling snack.']],
    ['cheeto', 0, ['Hot Cheetos'], ['Pour a bowl instead of eating from the bag. Enjoy every crunch!', 'Tip: having them with a sandwich or some cheese keeps you fuller longer.']],
    ['egg', 5, ['2 eggs', 'Butter', 'Cheese (optional)'], ['Whisk eggs with a pinch of salt.', 'Melt butter in a pan on low and add eggs.', 'Stir slowly until just set, about 2–3 minutes. Add cheese at the end.']],
    ['banana', 0, ['1 banana'], ['Peel and eat, or slice onto toast with peanut butter.']],
    ['strawberr', 2, ['Strawberries'], ['Rinse, cut off the green tops and enjoy. Great with a cheese stick.']],
    ['peanut butter', 3, ['Peanut butter', 'Toast or apple slices'], ['Spread 2 tbsp on toast or use as a dip for apple slices.']],
    ['milk', 0, ['1 cup milk'], ['Pour a glass, or blend with banana and frozen strawberries for a smoothie.']]
  ];

  function howtoData(kind, name) {
    const r = RECIPES.find(x => x.name === name);
    if (r) return { name: r.name, mins: r.mins, cal: r.cal, groups: r.groups, ingredients: r.ingredients, steps: r.steps, fact: r.fact, stretch: r.stretch, meal: 'Recipe' };
    const dd = PANTRY_DISHES.find(x => x.name === name);
    if (dd) return { name: dd.name, groups: dd.groups, cal: estimateCal(dd.name, dd.groups[0]).cal, meal: dd.meal,
      ingredients: dd.need.map(req => cap1(req[0])).concat(dd.extra.map(req => cap1(req[0]) + ' (optional)')),
      steps: dd.steps.split(/(?<=\.)\s+/).filter(Boolean), fact: dd.groups.includes('protein') ? 'protein' : dd.groups.includes('veg') ? 'veg' : 'brain' };
    const n = name.toLowerCase(), h = FOOD_HOWTO.find(([k]) => n.includes(k));
    const f = state.foods.find(x => x.name === name), g = f ? f.groups : [estimateCal(name).group];
    if (h) return { name, mins: h[1], cal: estimateCal(name, g[0]).cal, groups: g, ingredients: h[2], steps: h[3], fact: GROUPS[g[0]] && GROUPS[g[0]].fact, meal: 'Food' };
    return { name, groups: g, cal: estimateCal(name, g[0]).cal, ingredients: [name], steps: ['No step-by-step guide for this one yet. Prepare it the way you like it!', 'Tip: pair it with a protein or a veggie to make it a fuller meal.'], fact: 'timing', meal: 'Food' };
  }

  let lastTab = 'today';
  function showHowto(kind, name, day, slot) {
    const h = howtoData(kind, name);
    const have = h.ingredients.map(i => ({ i, ok: haveIngredient(i.replace(/\(optional\)/, '')), opt: /optional/i.test(i) }));
    const missing = have.filter(x => !x.ok && !x.opt).map(x => x.i.replace(/^[\d½¼¾\s]+(oz|cup|cups|tbsp|tsp|small|large)?\s*/i, '').replace(/\s*\(.*\)/, ''));
    const season = seasonFor(h.name + ' ' + h.steps.join(' '));
    $('#howto').innerHTML = '<button class="btn ghost inline back" data-howto-back>← Back</button>'
      + '<div class="card howto-card"><p class="muted">' + ico('pan') + ' How to make it</p><h2 class="howto-title">' + esc(h.name) + '</h2>'
      + '<div class="meta">' + (h.mins !== undefined ? '<span class="pill">⏱ ' + (h.mins ? h.mins + ' min' : 'No cooking!') + '</span>' : '')
      + (h.cal ? '<span class="pill cal-only">≈ ' + h.cal + ' cal</span>' : '')
      + h.groups.filter(g => GROUPS[g]).map(g => '<span class="pill yes g-' + g + '">' + ico(GROUP_ICON[g]) + ' ' + esc(GROUPS[g].label) + '</span>').join('') + '</div>'
      + '<div class="howto-cols"><div class="card olive inner"><h3>' + ico('cart') + ' Ingredients</h3><ul class="ing">'
      + have.map(x => '<li class="' + (x.ok ? 'ok' : x.opt ? 'opt' : 'no') + '"><span class="mark">' + (x.ok ? '✓' : x.opt ? '·' : '○') + '</span>' + esc(x.i)
        + (x.ok ? ' <em>you have it</em>' : '') + '</li>').join('') + '</ul>'
      + (missing.length ? '<button class="btn small" data-howto-shop="' + esc(missing.join('|')) + '">🛒 Add ' + missing.length + ' missing to list</button>' : '<p class="tip">🎉 You have everything you need!</p>')
      + (season.length ? '<p class="season">🧂 Season with your: <b>' + esc(season.join(', ')) + '</b></p>' : '')
      + '</div><div><h3>Steps <span class="muted">(tap to tick off)</span></h3><ol class="steps">'
      + h.steps.map(st => '<li tabindex="0">' + esc(st) + '</li>').join('') + '</ol>'
      + (h.stretch ? '<p class="tip">🌱 Feeling brave? ' + esc(h.stretch) + '</p>' : '') + '</div></div>'
      + (h.fact ? '<h3>Why it\'s good for you</h3>' + factHTML(typeof h.fact === 'string' && FACTS[h.fact] ? h.fact : dailyFact(h.groups[0])) : '')
      + '<button class="btn" data-howto-log="' + esc([kind, name, day || '', slot || ''].join('|')) + '">💛 I made it! Log this</button></div>';
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('on', p.id === 'tab-howto'));
    document.querySelectorAll('.tabs button').forEach(x => x.classList.remove('on'));
    sketchify($('#howto')); window.scrollTo({ top: 0 });
  }
  function leaveHowto() {
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('on', p.id === 'tab-' + lastTab));
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x.dataset.tab === lastTab));
  }
  function routeHash() {
    const m = location.hash.match(/^#make\/(.+)$/);
    if (m) { const [kind, name, day, slot] = decodeURIComponent(m[1]).split('|'); showHowto(kind, name, day, slot); }
    else if ($('#tab-howto').classList.contains('on')) leaveHowto();
  }
  window.addEventListener('hashchange', routeHash);
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
    lastTab = b.dataset.tab;
    if (location.hash.startsWith('#make/')) history.replaceState(null, '', location.pathname + location.search);
  }));
  document.addEventListener('click', (ev) => {
    const ht = ev.target.closest('[data-howto]');
    if (ht) { const cur = document.querySelector('.panel.on'); if (cur && cur.id !== 'tab-howto') lastTab = cur.id.replace('tab-', ''); location.hash = '#make/' + encodeURIComponent(ht.dataset.howto); return; }
    if (ev.target.closest('[data-howto-back]')) { if (history.length > 1) history.back(); else { location.hash = ''; leaveHowto(); } return; }
    const st = ev.target.closest('.steps li'); if (st) { st.classList.toggle('done'); return; }
    const sh = ev.target.closest('[data-howto-shop]');
    if (sh) { const n = addToShopping(sh.dataset.howtoShop.split('|')); renderPlan(); sketchify($('#tab-plan')); flash(sh, '✓ Added ' + n + ' to this week\'s list'); return; }
    const lg = ev.target.closest('[data-howto-log]');
    if (lg) {
      const [kind, name, day, slot] = lg.dataset.howtoLog.split('|'), h = howtoData(kind, name);
      const entry = { id: uid(), ts: new Date().toISOString(), type: slot === 'snack' ? 'snack' : 'meal', meal: MEAL_NAMES[slot] ? slot : autoMainMeal(),
        foods: [{ name: h.name, groups: h.groups.filter(g => GROUPS[g]), cal: h.cal || 0 }], cal: state.settings.calories ? (h.cal || null) : null, note: 'Made it myself' };
      if (day && slot && state.plan && state.plan[day]) { state.plan[day].logged = state.plan[day].logged || {}; state.plan[day].logged[slot] = true; }
      state.entries.push(entry); save();
      lastTab = 'today'; history.replaceState(null, '', location.pathname + location.search); leaveHowto();
      render(); showCheer(entry);
    }
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.matches('.steps li')) ev.target.classList.toggle('done'); });

  document.addEventListener('click', (ev) => {
    const tp = ev.target.closest('[data-theme-pick]'); if (!tp) return;
    state.settings.theme = tp.dataset.themePick; save(); render();
  });


  /* ---- magazine heroes: big title, micro labels, sticker, ticker ---- */
  const HEROES = {
    today:  ['Today', 'a little fuel, a lot of kindness', 'plate'],
    week:   ['My Week', 'your rhythm, not your grade', 'calendar'],
    plan:   ['The Plan', 'decide once, eat easy', 'pan'],
    recipe: ['Recipe', "this week's pick, just for you", 'sparkle'],
    ideas:  ['Ideas', 'new things to fall for', 'search'],
    learn:  ['Food Groups', 'what each one does for you', 'broccoli'],
    foods:  ['My Foods', 'the things you love', 'heart'],
    howto:  ['Make It', 'step by step, no stress', 'pan']
  };
  function buildHeroes() {
    const issue = new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    Object.keys(HEROES).forEach((k, i) => {
      const sec = document.getElementById('tab-' + k); if (!sec || sec.querySelector('.mag-hero')) return;
      const [title, sub, icon] = HEROES[k];
      const word = esc(title) + ' <span aria-hidden="true">✦</span> ';
      const wrap = document.createElement('div');
      wrap.innerHTML = '<header class="mag-hero' + (k === 'recipe' || k === 'ideas' ? ' grain' : '') + '">'
        + '<div class="micro"><span>Gentle Plate · No. ' + String(i + 1).padStart(2, '0') + ' · ' + esc(issue) + '</span><span>Eat well, feel good, no grades, ever.</span></div>'
        + '<h2 class="big' + (k === 'today' || k === 'ideas' || k === 'foods' ? ' bubble' : '') + '">' + esc(title) + '</h2><p class="sub">' + esc(sub) + '</p>'
        + '<span class="star2" aria-hidden="true"></span><div class="sticker" aria-hidden="true"><svg><use href="#i-' + icon + '"/></svg></div></header>'
        + '<div class="marquee" aria-hidden="true"><div>' + word.repeat(24) + '</div></div>';
      sec.prepend(...wrap.childNodes);
    });
  }
  buildHeroes();

  /* ===============================================================
     FAVORITE MEALS: save a combo, log it with one tap
     =============================================================== */
  function renderFavs() {
    const favs = state.favorites || [];
    $('#favs').innerHTML = '<p class="lbl">★ Favorites <span class="muted">' + (favs.length ? '(tap to log it right now)' : '') + '</span></p>'
      + (favs.length ? '<div class="chips">' + favs.map(f => '<span class="fav-chip"><button type="button" class="chip fav" data-fav-log="' + f.id + '" title="' + esc(f.foods.map(x => x.name).join(', ')) + '">'
          + (f.type === 'snack' ? '🍓 ' : '🍽 ') + esc(f.name) + '</button><button type="button" class="x" data-fav-del="' + f.id + '" aria-label="Remove favorite ' + esc(f.name) + '">×</button></span>').join('') + '</div>'
        : '<p class="muted fav-empty">Pick foods below and tap <b>☆ Save as favorite</b>, or tap ☆ on anything in your history.</p>');
    sketchify($('#favs'));
  }
  function addFavorite(foods, type, favMeal) {
    if (!foods.length) { alert('Pick at least one food first 💛'); return; }
    const suggested = foods.map(f => f.name).join(' + ');
    const name = prompt('Name this favorite:', suggested.length > 40 ? suggested.slice(0, 40) + '…' : suggested);
    if (name === null) return;
    state.favorites = state.favorites || [];
    state.favorites.push({ id: uid(), name: name.trim() || suggested, type, meal: favMeal, foods: foods.map(f => ({ name: f.name, groups: f.groups.slice(), cal: f.cal || 0 })) });
    save(); renderFavs();
  }
  $('#fav-save').addEventListener('click', () => {
    const foods = state.foods.filter(f => selected.has(f.id)).map(f => ({ name: f.name, groups: f.groups.slice(), cal: f.cal || 0 })).concat(extras);
    const before = (state.favorites || []).length;
    addFavorite(foods, logType, logMeal);
    if ((state.favorites || []).length > before) { selected = new Set(); extras = []; calTouched = false; renderPicker(); }
  });
  document.addEventListener('click', (ev) => {
    const lg = ev.target.closest('[data-fav-log]');
    if (lg) {
      const f = (state.favorites || []).find(x => x.id === lg.dataset.favLog); if (!f) return;
      const cal = f.foods.reduce((n, x) => n + (x.cal || 0), 0);
      const entry = { id: uid(), ts: new Date().toISOString(), type: f.type, meal: f.meal || (f.type === 'snack' ? 'snack' : autoMainMeal()), foods: f.foods.map(x => Object.assign({}, x, { groups: x.groups.slice() })),
        cal: state.settings.calories ? (cal || null) : null, note: '★ ' + f.name };
      state.entries.push(entry); save(); render(); showCheer(entry); return;
    }
    const del = ev.target.closest('[data-fav-del]');
    if (del) { state.favorites = (state.favorites || []).filter(x => x.id !== del.dataset.favDel); save(); renderFavs(); return; }
    const fe = ev.target.closest('[data-fav-entry]');
    if (fe) { const e = state.entries.find(x => x.id === fe.dataset.favEntry); if (e) addFavorite(e.foods, e.type, e.meal); }
  });

  /* ===============================================================
     INSTALL AS AN APP (Add to Home Screen)
     =============================================================== */
  let installPrompt = null;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  function renderInstall() {
    const box = $('#install-box'); if (!box) return;
    const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
    if (standalone()) { box.innerHTML = '<p class="tip">✨ You\'re using the app version. Nice!</p>'; return; }
    if (installPrompt) { box.innerHTML = '<p class="muted">Install it like an app: its own icon, full screen, works offline.</p><button type="button" class="btn" id="install-btn">Install Gentle Plate</button>'; return; }
    box.innerHTML = ios
      ? '<ol class="install-steps"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (square with an arrow).</li><li>Scroll and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol><p class="muted">It opens full screen with the Gentle Plate icon and works offline. Your logs stay the same as in Safari\'s copy the first time only, so start logging from the app.</p>'
      : '<ol class="install-steps"><li>Open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu.</li><li>Tap <b>Add to Home screen</b> or <b>Install app</b>.</li></ol><p class="muted">It opens full screen with the Gentle Plate icon and works offline.</p>';
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; renderInstall(); });
  window.addEventListener('appinstalled', () => { installPrompt = null; renderInstall(); });
  document.addEventListener('click', async (ev) => {
    if (ev.target.id !== 'install-btn' || !installPrompt) return;
    installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; renderInstall();
  });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* ===============================================================
     CONFETTI + STICKERS
     =============================================================== */
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CONF_COLORS = ['#F3B3D3', '#C8C46C', '#EE6A3C', '#24301A', '#FFFBF4', '#6B1F2A'];
  function confetti() {
    if (reduceMotion()) return;
    const cx = window.innerWidth / 2, cy = window.innerHeight * 0.42;
    for (let i = 0; i < 48; i++) {
      const el = document.createElement('span'); el.className = 'confetti';
      const c = CONF_COLORS[i % CONF_COLORS.length], star = i % 3 !== 0, size = 10 + Math.random() * 14;
      el.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;width:' + size + 'px;height:' + size + 'px';
      el.innerHTML = star
        ? '<svg viewBox="0 0 40 40" width="100%" height="100%"><path d="M20 1l4.6 13.4L39 15l-11.4 8.7L31.8 38 20 29.6 8.2 38l4.2-14.3L1 15l14.4-.6z" fill="' + c + '" stroke="#1C1A14" stroke-width="1.5"/></svg>'
        : '<svg viewBox="0 0 10 10" width="100%" height="100%"><circle cx="5" cy="5" r="4" fill="' + c + '"/></svg>';
      document.body.appendChild(el);
      const ang = Math.random() * Math.PI * 2, dist = 140 + Math.random() * 260;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * 0.75 - 80, r = (Math.random() - .5) * 720;
      el.animate([
        { transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1) rotate(' + r + 'deg)', opacity: 1, offset: .65 },
        { transform: 'translate(calc(-50% + ' + dx * 1.1 + 'px), calc(-50% + ' + (dy + 160) + 'px)) scale(.8) rotate(' + r * 1.4 + 'deg)', opacity: 0 }
      ], { duration: 1300 + Math.random() * 700, easing: 'cubic-bezier(.15,.8,.3,1)' }).onfinish = () => el.remove();
    }
  }
  const GROUP_WORD = { carbs: 'Carbs', protein: 'Protein', veg: 'Veggies', fruit: 'Fruit', dairy: 'Dairy' };
  function stickersFor(entry) {
    const out = [], h = hourOf(entry.ts);
    const today = entriesOn(entry.ts).filter(e => e.id !== entry.id);
    if (h < 12 && !today.some(e => hourOf(e.ts) < 12)) out.push({ key: 'early', label: 'Early Bird', sub: 'ate before noon!', icon: 'sun', bg: '#C8C46C' });
    const since = new Date(entry.ts); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
    const seen = new Set();
    state.entries.filter(e => e.id !== entry.id && new Date(e.ts) >= since && new Date(e.ts) <= new Date(entry.ts)).forEach(e => groupsOf(e).forEach(g => seen.add(g)));
    [...groupsOf(entry)].filter(g => GROUP_WORD[g] && !seen.has(g)).forEach(g =>
      out.push({ key: 'new-' + g, label: 'New: ' + GROUP_WORD[g] + '!', sub: 'first this week', icon: GROUP_ICON[g], bg: '#F3B3D3' }));
    if (entry.plate) out.push({ key: 'plate', label: 'Plate Artist', sub: 'plate of the week', icon: 'plate', bg: '#EE6A3C' });
    return out;
  }
  function stickerHTML(s, rot) {
    return '<div class="sticker-badge" style="--bg:' + s.bg + ';--rot:' + rot + 'deg"><svg class="ico"><use href="#i-' + s.icon + '"/></svg>'
      + '<b>' + esc(s.label) + '</b><span>' + esc(s.sub) + '</span></div>';
  }
  function celebrate(entry) {
    confetti();
    const st = stickersFor(entry); if (!st.length) return;
    state.stickers = state.stickers || [];
    st.forEach(s => state.stickers.push({ key: s.key, label: s.label, sub: s.sub, icon: s.icon, bg: s.bg, ts: entry.ts }));
    save(); renderStickerBook();
    const pop = document.createElement('div'); pop.className = 'sticker-pop'; pop.setAttribute('role', 'status');
    pop.innerHTML = '<p class="pop-title">You earned ' + (st.length > 1 ? st.length + ' stickers' : 'a sticker') + '!</p><div class="pop-row">'
      + st.map((s, i) => stickerHTML(s, (i % 2 ? 7 : -6))).join('') + '</div><p class="pop-hint">tap to close · saved in your sticker book</p>';
    document.body.appendChild(pop);
    const close = () => { pop.classList.add('out'); setTimeout(() => pop.remove(), 300); };
    pop.addEventListener('click', close); setTimeout(close, 3600);
  }
  function renderStickerBook() {
    const box = $('#sticker-book'); if (!box) return;
    const all = state.stickers || [];
    const counts = {}; all.forEach(s => { counts[s.key] = counts[s.key] || Object.assign({ n: 0 }, s); counts[s.key].n++; });
    const list = Object.values(counts);
    box.innerHTML = '<h2>⭐ Sticker book</h2>'
      + (list.length ? '<p class="muted">' + all.length + ' sticker' + (all.length > 1 ? 's' : '') + ' earned. Every one is a moment you took care of yourself.</p><div class="sticker-grid">'
        + list.map((s, i) => '<div class="sb-item">' + stickerHTML(s, ((i * 37) % 15) - 7) + (s.n > 1 ? '<em class="sb-count">×' + s.n + '</em>' : '') + '</div>').join('') + '</div>'
        : '<p class="muted">Earn stickers by eating before noon, trying a food group for the first time this week, or building your plate of the week.</p>');
    sketchify(box);
  }

  /* ===============================================================
     PLATE OF THE WEEK: tap or drag foods onto a big plate
     =============================================================== */
  let plateItems = (state.plateDraft || []).slice(), plateAgain = false, lastAdded = null, lastFact = null;
  const saveDraft = () => { state.plateDraft = plateItems.slice(); save(); };
  // a "why it's good" fact for a specific food (falls back to its food group's fact of the day)
  const FOOD_FACTS = [
    ['salmon', FACTS.salmon],
    ['steak', FACTS.iron], ['beef', FACTS.iron], ['burger', FACTS.iron],
    ['sweet potato', { text: 'One medium sweet potato has over 100% of your daily vitamin A, which helps your eyes and immune system.', src: 'NIH Office of Dietary Supplements, Vitamin A Fact Sheet' }],
    ['potato', FACTS.potato], ['fries', FACTS.potato],
    ['broccoli', FACTS.broccoli],
    ['corn', { text: 'Sweet corn contains lutein and zeaxanthin, antioxidants that collect in your eyes and help protect your vision.', src: 'National Eye Institute (NIH)' }],
    ['pickle', { text: 'Pickles are cucumbers, so they count as a veggie, and a whole spear has only about 5 calories.', src: 'USDA FoodData Central' }],
    ['grilled cheese', { text: 'The cheese in a grilled cheese brings calcium for strong bones, and one ounce of cheddar has about 7 g of protein.', src: 'USDA FoodData Central' }],
    ['mac', { text: 'Mac and cheese gives you carbs for energy plus calcium and protein from the cheese. A real two-food-group comfort meal.', src: 'USDA FoodData Central' }],
    ['alfredo', { text: 'Alfredo is made with milk, butter and parmesan, so it adds calcium. Adults 19–50 need about 1,000 mg a day.', src: 'NIH Office of Dietary Supplements, Calcium Fact Sheet' }],
    ['rosatella', { text: 'Rosatella blends tomato and cream: tomatoes bring lycopene, an antioxidant your body absorbs better when it\'s cooked with a little fat.', src: 'NIH National Library of Medicine' }],
    ['cheese', { text: 'One ounce of cheddar cheese has about 7 g of protein, so cheese counts toward protein too.', src: 'USDA FoodData Central' }],
    ['noodle', { text: 'A cup of cooked pasta has about 8 g of protein along with the carbs your brain runs on.', src: 'USDA FoodData Central' }],
    ['pasta', { text: 'A cup of cooked pasta has about 8 g of protein along with the carbs your brain runs on.', src: 'USDA FoodData Central' }],
    ['garlic', { text: 'Bread is a carb, and carbs are your brain\'s main fuel. It uses about 20% of your body\'s energy.', src: 'Institute of Medicine, Dietary Reference Intakes (2005)' }],
    ['toast', { text: 'Toast is quick fuel: carbs are your brain\'s main energy source. Whole-wheat adds about 2 g of fiber per slice.', src: 'Institute of Medicine (2005); USDA FoodData Central' }],
    ['bread', { text: 'Bread is a carb, and carbs are your brain\'s main fuel. It uses about 20% of your body\'s energy.', src: 'Institute of Medicine, Dietary Reference Intakes (2005)' }],
    ['egg', { text: 'One egg has about 6 g of protein, and eggs at breakfast are linked to feeling full longer.', src: 'USDA FoodData Central' }],
    ['strawberr', { text: 'One cup of strawberries has about 85 mg of vitamin C, more than a medium orange.', src: 'USDA FoodData Central' }],
    ['banana', { text: 'A medium banana has about 420 mg of potassium and 3 g of fiber.', src: 'USDA FoodData Central' }],
    ['apple', { text: 'A medium apple has about 4 g of fiber to help keep you full.', src: 'USDA FoodData Central' }],
    ['milk', { text: 'One cup of milk has about 300 mg of calcium and 8 g of protein.', src: 'NIH Office of Dietary Supplements; USDA' }],
    ['cheeto', { text: 'Fun foods belong on the plate too: in one study, people who were kind to themselves about a treat ate less afterward than people who felt guilty.', src: 'Adams & Leary, Journal of Social and Clinical Psychology (2007)' }]
  ];
  function foodFact(f) {
    const n = f.name.toLowerCase(), hit = FOOD_FACTS.find(([k]) => n.includes(k));
    return hit ? hit[1] : (dailyFact(f.groups[0]) || FACTS.timing);
  }
  const ZONES = [['veg', 0, 108], ['fruit', 108, 180], ['carbs', 180, 288], ['protein', 288, 360]];
  const ZONE_LABEL = { veg: 'Veggies', fruit: 'Fruit', carbs: 'Carbs', protein: 'Protein', dairy: 'Dairy' };
  function plateNote() {
    const have = new Set(); plateItems.forEach(f => f.groups.forEach(g => have.add(g)));
    if (!plateItems.length) return 'Tap a food (or drag it) to put it on your plate.';
    const checks = ['protein', 'carbs', 'veg', 'fruit'].filter(g => have.has(g)).map(g => ZONE_LABEL[g].toLowerCase() + ' ✓').join(', ');
    const want = { protein: 'some protein', veg: 'a veggie', carbs: 'a carb', fruit: 'some fruit' };
    const miss = ['protein', 'veg', 'carbs', 'fruit'].find(g => !have.has(g));
    if (!miss) return checks + '. That\'s a beautifully balanced plate! 🌈';
    return (checks ? checks + ', ' : '') + 'maybe ' + want[miss] + '? Try ' + suggestFrom(miss) + '.';
  }
  function plateSVGBig() {
    const cx = 150, cy = 158, R = 118;
    const pt = (a, r) => [cx + r * Math.cos((a - 90) * Math.PI / 180), cy + r * Math.sin((a - 90) * Math.PI / 180)];
    const wedge = (a0, a1) => { const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
      return 'M' + cx + ' ' + cy + ' L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + R + ' ' + R + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z'; };
    const count = (g) => plateItems.filter(f => f.groups.includes(g)).length;
    let s = '<svg class="big-plate" viewBox="0 0 330 320" role="img" aria-label="Your plate">'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R + 18) + '" class="rim"/>';
    ZONES.forEach(([g, a0, a1]) => {
      const n = count(g), [lx, ly] = pt((a0 + a1) / 2, R * .55);
      s += '<g class="zone z-' + g + (n ? ' on' : '') + (lastAdded && lastAdded.includes(g) ? ' wiggle' : '') + '" data-zone="' + g + '">'
        + '<path d="' + wedge(a0, a1) + '"/>'
        + '<use href="#i-' + GROUP_ICON[g] + '" x="' + (lx - 18) + '" y="' + (ly - 30) + '" width="36" height="36"/>'
        + '<text x="' + lx + '" y="' + (ly + 20) + '" text-anchor="middle">' + ZONE_LABEL[g] + (n ? ' ×' + n : '') + '</text></g>';
    });
    const nd = count('dairy');
    s += '<g class="zone z-dairy' + (nd ? ' on' : '') + (lastAdded && lastAdded.includes('dairy') ? ' wiggle' : '') + '" data-zone="dairy">'
      + '<circle cx="292" cy="44" r="32"/><use href="#i-cheese" x="276" y="24" width="32" height="32"/>'
      + '<text x="292" y="66" text-anchor="middle">Dairy' + (nd ? ' ×' + nd : '') + '</text></g>';
    return s + '</svg>';
  }
  function renderPlateBuilder() {
    const box = $('#plate-builder'); if (!box) return;
    const wk = isoDate(planDays(0)[0]);
    if (state.plateDone === wk && !plateAgain) {
      const saved = (state.plateSaved && state.plateSaved.wk === wk) ? state.plateSaved.items : [];
      const keep = plateItems; plateItems = saved;           // draw the saved plate
      const svg = plateSVGBig(), note = plateNote(); plateItems = keep;
      const fav = (state.favorites || []).some(f => f.plateWk === wk);
      box.innerHTML = '<h2>🍽 Plate of the week</h2><div class="pb-grid"><div class="pb-plate">' + svg + '</div>'
        + '<div class="pb-done-side">' + stickerHTML({ label: 'Plate Artist', sub: 'done this week', icon: 'plate', bg: '#EE6A3C' }, -6)
        + '<p><b>This week\'s plate is saved. 💛</b></p>'
        + (saved.length ? '<p class="pb-note">' + esc(saved.map(x => x.name).join(' + ')) + '</p>' : '')
        + '<p class="muted">A new plate of the week opens on Monday.</p>'
        + '<div class="pb-actions">' + (saved.length ? '<button type="button" class="btn" id="pb-relog">Eat it again 💛</button>' : '')
        + (saved.length && !fav ? '<button type="button" class="btn ghost inline" id="pb-fav">☆ Save to favorites</button>' : (fav ? '<span class="done">★ in your favorites</span>' : ''))
        + '</div><button type="button" class="linkish" id="pb-again">Build another anyway</button></div></div>';
      sketchify(box); return;
    }
    const groupsOrder = ['protein', 'carbs', 'veg', 'fruit', 'dairy', 'fun'];
    const tray = groupsOrder.map(g => {
      const foods = state.foods.filter(f => f.groups[0] === g && !/sauce/i.test(f.name));
      if (!foods.length) return '';
      return '<div class="tray-row"><span class="tray-lbl">' + esc(GROUPS[g].label) + '</span>' + foods.map(f =>
        '<button type="button" class="chip" draggable="true" data-pb-food="' + f.id + '">' + esc(f.name) + '</button>').join('') + '</div>';
    }).join('');
    box.innerHTML = '<h2>🍽 Plate of the week</h2><p class="muted">Once a week, build one meal on the plate. Tap a food, or drag it onto the plate. Each section fills as you go.</p>'
      + '<div class="pb-grid"><div class="pb-plate" id="pb-drop">' + plateSVGBig()
      + '<p class="pb-note" aria-live="polite">' + esc(plateNote()) + '</p>'
      + (plateItems.length ? '<div class="pb-items">' + plateItems.map((f, i) => '<button type="button" class="pitem" data-pb-remove="' + i + '">' + esc(f.name) + ' ×</button>').join('') + '</div>'
        + '<div class="pb-actions"><button type="button" class="btn" id="pb-log">Log this plate 💛</button><button type="button" class="btn ghost inline" id="pb-clear">Start over</button></div>' : '')
      + '</div><div class="pb-tray">' + tray + '</div></div>';
    sketchify(box);
    lastAdded = null;
  }
  function plateAdd(id) {
    const f = state.foods.find(x => x.id === id); if (!f) return;
    plateItems.push({ name: f.name, groups: f.groups.slice(), cal: f.cal || 0 });
    lastFact = { name: f.name, fact: foodFact(f) };
    lastAdded = f.groups.slice(); saveDraft(); renderPlateBuilder();
    showFactPop(lastFact);
  }
  // pop-up card with a fact about the food you just put on the plate
  let factPopTimer = null;
  function showFactPop(lf) {
    document.querySelectorAll('.fact-pop').forEach(x => x.remove());
    clearTimeout(factPopTimer);
    const f = lf.fact, item = state.foods.find(x => x.name === lf.name), g = item ? item.groups[0] : 'carbs';
    const pop = document.createElement('div'); pop.className = 'fact-pop'; pop.setAttribute('role', 'status');
    pop.innerHTML = '<button type="button" class="fp-close" aria-label="Close">×</button>'
      + '<div class="fp-head"><span class="fp-ico">' + ico(GROUP_ICON[g] || 'sparkle') + '</span><div><p class="fp-lbl">Good to know</p><h3>' + esc(lf.name) + '</h3></div></div>'
      + '<p class="fp-text">' + esc(f.text) + '</p><p class="fp-src">Source: ' + esc(f.src) + '</p>';
    document.body.appendChild(pop); sketchify(pop);
    const close = () => { pop.classList.add('out'); setTimeout(() => pop.remove(), 250); };
    pop.querySelector('.fp-close').addEventListener('click', close);
    factPopTimer = setTimeout(close, 7000);
  }
  document.addEventListener('click', (ev) => {
    const f = ev.target.closest('[data-pb-food]'); if (f) { plateAdd(f.dataset.pbFood); return; }
    const r = ev.target.closest('[data-pb-remove]'); if (r) { const [gone] = plateItems.splice(+r.dataset.pbRemove, 1); if (lastFact && gone && lastFact.name === gone.name) lastFact = null; saveDraft(); renderPlateBuilder(); return; }
    if (ev.target.closest('#pb-clear')) { plateItems = []; lastFact = null; saveDraft(); renderPlateBuilder(); return; }
    if (ev.target.closest('#pb-relog')) {
      const items = (state.plateSaved && state.plateSaved.items) || []; if (!items.length) return;
      const cal = items.reduce((n, x) => n + (x.cal || 0), 0);
      const entry = { id: uid(), ts: new Date().toISOString(), type: 'meal', meal: autoMainMeal(), foods: items.map(x => Object.assign({}, x, { groups: x.groups.slice() })),
        cal: state.settings.calories ? (cal || null) : null, note: '🍽 Plate of the week' };
      state.entries.push(entry); save(); render(); showCheer(entry); return;
    }
    if (ev.target.closest('#pb-fav')) {
      const items = (state.plateSaved && state.plateSaved.items) || []; if (!items.length) return;
      state.favorites = state.favorites || [];
      state.favorites.push({ id: uid(), name: 'Plate of the week', type: 'meal', plateWk: state.plateSaved.wk, foods: items.map(x => Object.assign({}, x, { groups: x.groups.slice() })) });
      save(); render(); return;
    }
    if (ev.target.closest('#pb-again')) { plateAgain = true; plateItems = []; saveDraft(); renderPlateBuilder(); return; }
    if (ev.target.closest('#pb-log')) {
      if (!plateItems.length) return;
      const cal = plateItems.reduce((n, x) => n + (x.cal || 0), 0);
      const entry = { id: uid(), ts: new Date().toISOString(), type: 'meal', meal: autoMainMeal(), plate: true, foods: plateItems.map(x => Object.assign({}, x)),
        cal: state.settings.calories ? (cal || null) : null, note: '🍽 Plate of the week' };
      const wk = isoDate(planDays(0)[0]);
      state.entries.push(entry); state.plateDone = wk;
      state.plateSaved = { wk, items: plateItems.map(x => Object.assign({}, x, { groups: x.groups.slice() })) };
      plateItems = []; lastFact = null; plateAgain = false; saveDraft(); render(); showCheer(entry);
    }
  });
  document.addEventListener('dragstart', (ev) => { const f = ev.target.closest && ev.target.closest('[data-pb-food]'); if (f) ev.dataTransfer.setData('text/plain', f.dataset.pbFood); });
  document.addEventListener('dragover', (ev) => { if (ev.target.closest && ev.target.closest('#pb-drop')) { ev.preventDefault(); $('#pb-drop').classList.add('over'); } });
  document.addEventListener('dragleave', (ev) => { if (ev.target.id === 'pb-drop') ev.target.classList.remove('over'); });
  document.addEventListener('drop', (ev) => {
    if (!(ev.target.closest && ev.target.closest('#pb-drop'))) return;
    ev.preventDefault(); const id = ev.dataTransfer.getData('text/plain'); if (id) plateAdd(id);
  });

  render();
  routeHash();
})();
