import '@/js/svgLoader';
import cat from '@/assets/img/cat.jpg';
import '@/style/style.scss';

document.addEventListener('DOMContentLoaded', () => {
  fetch('./json/main.json')
    .then((res) => res.json())
    .then((res) => console.log(res));

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
