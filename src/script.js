// import style from './src/style/style.scss';
import json from './json/main.json';
import cat from './img/cat.jpg';

document.addEventListener('DOMContentLoaded', () => {
  // console.log('style', style);
  console.log('script', json);

  const img = document.createElement('IMG');
  img.src = cat;
  img.style.width = '200px';

  async function start() {
    const res = await Promise.resolve('async is work');
    return res;
  }

  start().then(console.log);

  class Util {
    constructor() {
      const Now = Date.now;
      this.id = Now();
    }
  }

  console.log('date', new Util().id);

  document.body.append(img);
});
