const WORDS = ["Apple", "Banana", "Coconut", "Date", "Eggplant", "Fig", "Grape", "Hazelnut", "Incaberry", "Jackfruit", "Kiwi", "Lime", "Mango", "Nut", "Orange", "Pear", "Quenepa", "Rice", "Strawberry", "Tomato", "Ugni", "Verdolaga", "Watermelon", "Xoconostle", "Yumberry", "Zucchini"];

const randomWord = () => {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

exports.handler = async (event) => {
  console.log(event);
  let word = randomWord();
  let data = { word: word };
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
};

